
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(apiKey);
    const { email, confirmationUrl, token }: ConfirmationEmailRequest = await req.json();

    console.log(`Attempting to send confirmation email to: ${email}`);
    console.log(`Confirmation URL: ${confirmationUrl}`);

    // Create unsubscribe URL
    const unsubscribeUrl = `https://playgroundjam.21.com/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

    const emailResponse = await resend.emails.send({
      from: "Playground Jam Bologna <noreply@playgroundjam.21.com>",
      to: [email],
      subject: "Conferma il tuo account - Playground Jam",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Conferma Account</title>
          <style>
            body { 
              font-family: 'Press Start 2P', monospace, Arial, sans-serif; 
              background: #000; 
              color: #00ffff; 
              padding: 20px;
              text-align: center;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: rgba(0,0,0,0.9); 
              border: 3px dashed #ff00ff; 
              border-radius: 20px; 
              padding: 30px;
              box-shadow: 0 0 20px #00ffff;
            }
            .title { 
              color: #ffcc00; 
              font-size: 18px; 
              text-shadow: 2px 2px 0px #000; 
              margin-bottom: 20px;
            }
            .button { 
              display: inline-block; 
              background: #ff00ff; 
              color: #ffffff; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 10px; 
              font-weight: bold; 
              margin: 20px 0;
              text-shadow: 1px 1px 0px #000;
            }
            .code { 
              background: #333; 
              color: #00ffff; 
              padding: 10px; 
              border-radius: 5px; 
              font-family: monospace; 
              margin: 15px 0;
              font-size: 16px;
              word-break: break-all;
            }
            .footer { 
              color: #888; 
              font-size: 10px; 
              margin-top: 30px;
              border-top: 1px solid #333;
              padding-top: 20px;
            }
            .unsubscribe { 
              color: #666; 
              font-size: 8px; 
              margin-top: 15px;
            }
            .unsubscribe a { 
              color: #888; 
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">🎮 PLAYGROUND JAM BOLOGNA 🎮</h1>
            <p>Benvenuto nella community! Conferma il tuo account per accedere alla piattaforma.</p>
            
            <a href="${confirmationUrl}" class="button">CONFERMA ACCOUNT</a>
            
            <p>Oppure copia e incolla questo link di conferma:</p>
            <div class="code">${confirmationUrl}</div>
            
            <p>Una volta confermato potrai:</p>
            <ul style="text-align: left; color: #00ffff; margin: 20px 0;">
              <li>🏀 Trovare campi da basket a Bologna</li>
              <li>💬 Chattare con altri giocatori</li>
              <li>📊 Vedere statistiche dei playground</li>
              <li>🎯 Partecipare agli eventi</li>
            </ul>
            
            <p style="font-size: 10px; color: #888;">Se non ti sei registrato, puoi ignorare questa email.</p>
            
            <div class="footer">
              <p>PLAYGROUND JAM BOLOGNA © 2025</p>
              <p>Contatti: playgroundjam21@gmail.com</p>
              
              <div class="unsubscribe">
                <p>Non vuoi più ricevere queste email?</p>
                <a href="${unsubscribeUrl}">Cancellati dalla mailing list</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
