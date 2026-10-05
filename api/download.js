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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });

    const html = await response.text();

    const videoMatches = html.match(/https:\/\/[^"]+\.mp4[^"]*/g) || 
                         html.match(/https:\/\/cf-st\.sc-cdn\.net\/[^"]+/g);

    if (videoMatches && videoMatches.length > 0) {
      let videoUrl = videoMatches[0].replace(/\\u0026/g, '&');
      return res.status(200).json({ videoUrl: videoUrl });
    } else {
      return res.status(404).json({ error: 'نەتوانرا لینکی ڤیدیۆکە لەم ستۆرییە بدۆزرێتەوە' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'کێشەیەک لە سێرڤەر ڕووی دا' });
  }
}
