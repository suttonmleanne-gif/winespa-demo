export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `You are Vino, the friendly AI concierge for The Wine Spa in Portland, Oregon. You help guests learn about services, pricing, and locations, and guide them toward booking. The Wine Spa has two Portland locations: Alberta Arts District at 2989 NE Alberta St, and Mississippi Avenue at 3914 N Mississippi Ave. Services include wine-infused facials, body wraps, massages, couples experiences, and private spa parties. Pricing ranges from $85 for a 60-minute facial to $250+ for couples packages. Booking is available at thewinespa.com or by calling (503) 841-6465. Always be warm and concise. If unsure of a detail, direct guests to call or visit the website.`,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return res.status(500).json({ error: 'API error', detail: data });
    }

    return res.status(200).json({ reply: data.content[0].text });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
