import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Restrict CORS to specific origins for security
const ALLOWED_ORIGINS = [
  "https://bologna-playgroundjam.lovable.app",
  "https://id-preview--d01073df-498e-488b-be4b-ef189a39047d.lovable.app"
];

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  // Check if origin is in allowed list or if it's a lovable.app domain
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith('.lovable.app')
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Zod validation schema with enhanced security
const newsletterSchema = z.object({
  email: z.string()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga')
    .transform(val => val.trim().toLowerCase())
    .refine(val => !val.includes('+'), 'Email con alias non accettata'),
  name: z.string()
    .min(2, 'Nome troppo corto')
    .max(100, 'Nome troppo lungo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Il nome contiene caratteri non validi')
    .optional()
});

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Metodo non consentito" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Initialize Supabase client with service role for IP rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "0.0.0.0";
    
    // Check IP-based rate limit
    const { data: rateLimitAllowed, error: rateLimitError } = await supabase.rpc(
      'check_newsletter_rate_limit', 
      { p_ip_address: clientIp }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Errore nella verifica del limite" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!rateLimitAllowed) {
      return new Response(
        JSON.stringify({ error: "Troppe richieste. Riprova più tardi." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Parse and validate input
    const rawData = await req.json();
    const validationResult = newsletterSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Dati non validi', 
          details: validationResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name } = validationResult.data;

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .maybeSingle();

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return new Response(
          JSON.stringify({ success: true, message: "Sei già iscritto alla newsletter!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true, 
            unsubscribed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id);
          
        return new Response(
          JSON.stringify({ success: true, message: "Iscrizione riattivata!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get Google Newsletter URL from secrets
    const googleNewsletterUrl = Deno.env.get("GOOGLE_NEWSLETTER_URL");
    
    // Forward to Google Apps Script if configured
    if (googleNewsletterUrl) {
      try {
        const response = await fetch(googleNewsletterUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        });

        if (!response.ok) {
          console.error("Google Script error:", response.status, response.statusText);
          // Don't fail - still save to database
        }
      } catch (googleError) {
        console.error("Google Script call failed:", googleError);
        // Don't fail - still save to database
      }
    }
    
    // Store in database
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        ip_address: clientIp,
        source: 'website',
        user_agent: req.headers.get("user-agent")?.substring(0, 500) || null
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: true, message: "Sei già iscritto alla newsletter!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Errore nel salvataggio" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Iscrizione completata!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in newsletter-submit:", error);
    const errorMessage = error instanceof Error ? error.message : "Errore nell'iscrizione";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
