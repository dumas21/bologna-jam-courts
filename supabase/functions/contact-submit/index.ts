import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome troppo corto')
    .max(100, 'Nome troppo lungo')
    .regex(/^[a-zA-Z\s'-]+$/, 'Il nome contiene caratteri non validi'),
  email: z.string()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga'),
  message: z.string()
    .min(10, 'Il messaggio deve essere di almeno 10 caratteri')
    .max(1000, 'Il messaggio è troppo lungo')
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limit
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_action_type: 'contact_form',
      p_max_attempts: 3,
      p_window_hours: 1
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Errore nella verifica del limite di richieste" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Hai raggiunto il limite di invii. Riprova più tardi." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate input
    const rawData = await req.json();
    const validationResult = contactSchema.safeParse(rawData);

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

    const { name, email, message } = validationResult.data;

    // Get Google Script URL from secrets
    const googleScriptUrl = Deno.env.get("GOOGLE_SCRIPT_URL");
    if (!googleScriptUrl) {
      console.error("GOOGLE_SCRIPT_URL not configured");
      return new Response(
        JSON.stringify({ error: "Configurazione server non valida" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Forward to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (!response.ok) {
      console.error("Google Script error:", response.status, response.statusText);
      throw new Error(`Google Script request failed: ${response.status}`);
    }

    // Record rate limit attempt
    await supabase.rpc('record_rate_limit_attempt', {
      p_action_type: 'contact_form'
    });

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in contact-submit:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Errore nell'invio del messaggio" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
