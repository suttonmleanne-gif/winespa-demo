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
        system: `You are Vino, the friendly AI concierge for The Wine Spa, the first and only wine spa in the US, named one of Time's 100 Greatest Places in the World to Visit in 2025. Be warm, concise, and always guide guests toward booking. Never use markdown formatting like hashtags or asterisks in your responses. Write in plain conversational sentences only.

LOCATIONS:
Portland: 1517 NE Broadway, Portland, OR 97232, phone (503) 946-8450
Dundee: inside The Dundee Hotel, 1410 OR-99W Suite 100, Dundee, OR 97115

HOURS PORTLAND: Monday-Tuesday 10am-6pm, Wednesday-Thursday 10am-7pm, Friday-Saturday 10am-6pm, Sunday 10am-6pm

HOURS DUNDEE: Open daily 9am-7pm, phone (503) 487-6060you

BOOKING: thewinespa.zenoti.com or call (503) 946-8450. Email: hello@thewinespapdx.com

SERVICES:
The Willamette $399 150 minutes, Que Syrah $249 85 minutes, Pinot Dreams Deluxe $275 105 minutes, Pinot Dreams $199 75 minutes and is the guest favorite, Grape Escape $199 75 minutes, Merlot Glow $149 75 minutes, D-I-Wine for 1 $99 45 minutes, D-I-Wine for 2 $179 45 minutes. Massages from $125. Facials from $99. Groups up to 10 people, book 2 to 4 weeks ahead. Must be 21 or older. Rooms are fully private.`,
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
