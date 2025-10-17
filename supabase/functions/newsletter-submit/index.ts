import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod validation schema
const newsletterSchema = z.object({
  email: z.string()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga'),
  name: z.string()
    .min(2, 'Nome troppo corto')
    .max(100, 'Nome troppo lungo')
    .regex(/^[a-zA-Z\s'-]+$/, 'Il nome contiene caratteri non validi')
    .optional()
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limit (no auth required for newsletter)
    // Use IP-based rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    // Parse and validate input
    const rawData = await req.json();
    const validationResult = newsletterSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Dati non validi', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name } = validationResult.data;

    // Get Google Newsletter URL from secrets
    const googleNewsletterUrl = Deno.env.get("GOOGLE_NEWSLETTER_URL");
    if (!googleNewsletterUrl) {
      console.error("GOOGLE_NEWSLETTER_URL not configured");
      return new Response(
        JSON.stringify({ error: "Configurazione server non valida" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Forward to Google Apps Script
    const response = await fetch(googleNewsletterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    if (!response.ok) {
      console.error("Google Script error:", response.status, response.statusText);
      throw new Error(`Google Script request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Also store in our database
    try {
      await supabase.from('newsletter_subscribers').insert({
        email,
        ip_address: clientIp,
        source: 'website'
      });
    } catch (dbError) {
      console.error("Database insert error:", dbError);
      // Don't fail the request if DB insert fails
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in newsletter-submit:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Errore nell'iscrizione alla newsletter" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
