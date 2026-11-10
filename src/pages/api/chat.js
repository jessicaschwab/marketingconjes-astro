export async function POST({ request }) {
  try {
    const data = await request.json();
    const userMessage = data.message;

    if (!userMessage) {
      return new Response(JSON.stringify({ success: false, message: 'El mensaje está vacío.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = 'openai/gpt-oss-120b';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, message: 'Error: La clave de API no está disponible en el servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contextoNegocio = `
    Eres el asistente virtual oficial de 'Marketing con Jes', la web de Jessica Schwab (marketingconjes.ar), ubicada en Comodoro Rivadavia, Chubut. 
    Tu objetivo es ser amable, comercial, persuasivo y ayudar a los visitantes a conocer los servicios de marketing digital, diseño web y captación de leads.

    INFORMACIÓN DE CONTACTO OBLIGATORIA:
    - Si te piden un número de teléfono o WhatsApp, DEBES dar siempre este número de contacto directo: +54 9 2974189847 (o indícales que pueden hacer clic directamente en el botón verde de WhatsApp ubicado en la esquina inferior derecha de la pantalla). Nunca inventes números ni uses corchetes.

    SERVICIOS Y PLANES VIGENTES:
    1. PLAN BÁSICO: 3 publicaciones semanales y 3 historias. Opcionales: Pauta publicitaria y reels.
    2. PLAN INTERMEDIO: 5 publicaciones semanales y 5 historias. Opcionales: Reels y pauta publicitaria.
    3. PLAN A MEDIDA: Soluciones personalizadas. Derivar directamente a WhatsApp.
    4. PRESUPUESTOS Y COTIZACIONES: El servicio de elaboración de presupuesto tiene un costo total de $20.000 ARS.
    5. DESARROLLO Y DISEÑO WEB: Creamos páginas web profesionales y optimizamos tiendas online para captación de leads.

    REGLAS DE RESPUESTA:
    - Responde siempre de forma breve, clara, amable y directa en español.
    - Si preguntan por precios o detalles de los planes, enuméralos claramente.
    - Si quieren avanzar con un presupuesto, recuérdales el costo de $20.000 ARS e invítalos a coordinarlo por WhatsApp.
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: contextoNegocio },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const result = await response.json();

    if (result.error) {
      return new Response(JSON.stringify({ success: false, message: 'Error de Groq: ' + result.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const botReply = result.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu respuesta.';

    return new Response(JSON.stringify({ success: true, reply: botReply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}