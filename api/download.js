export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'تکایە لینکێک بنووسە' });
  }

  try {
    const initialRes = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    });

    const html = await initialRes.text();

    const videoMatch = html.match(/https:\/\/[^"]+\.mp4[^"]*/i) || html.match(/https:\/\/[^"]+\.m3u8[^"]*/i);

    if (videoMatch && videoMatch[0]) {
      const cleanUrl = videoMatch[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
      return res.status(200).json({ downloadUrl: cleanUrl });
    } else {
      return res.status(404).json({ error: 'نەتوانرا لینکی ڤیدیۆکە لەم ستۆرییە بدۆزرێتەوە' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'هەڵەیەک لە پەیوەندیدا ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.' });
  }
}
