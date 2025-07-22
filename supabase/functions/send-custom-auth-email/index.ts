import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  username: string;
  confirmationUrl: string;
  type: 'signup' | 'magic_link';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, confirmationUrl, type }: AuthEmailRequest = await req.json();

    const subject = type === 'signup' ? 
      'Conferma il tuo account - Bologna Jam Courts' : 
      'Il tuo link di accesso - Bologna Jam Courts';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Bologna Jam Courts</h1>
            </div>
            <div class="content">
              <h2>Ciao ${username}!</h2>
              ${type === 'signup' ? 
                '<p>Benvenuto su Bologna Jam Courts! Per completare la registrazione, clicca sul pulsante qui sotto:</p>' :
                '<p>Ecco il tuo link di accesso a Bologna Jam Courts:</p>'
              }
              
              <a href="${confirmationUrl}" class="button">
                ${type === 'signup' ? 'Conferma Account' : 'Accedi'}
              </a>
              
              <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                ${confirmationUrl}
              </p>
              
              <p><strong>Questo link è valido per 24 ore.</strong></p>
              
              ${type === 'signup' ? 
                '<p>Dopo la conferma potrai accedere alla piattaforma e scoprire tutti i campi da basket di Bologna!</p>' :
                '<p>Una volta effettuato l\'accesso, potrai esplorare tutti i campi da basket di Bologna!</p>'
              }
            </div>
            <div class="footer">
              <p>Se non hai richiesto questo ${type === 'signup' ? 'account' : 'accesso'}, puoi ignorare questa email.</p>
              <p>© 2024 Bologna Jam Courts - La tua guida ai campi da basket di Bologna</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bologna Jam Courts <noreply@bologna-jam-courts.com>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email inviata con successo:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Errore nell'invio email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);