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
    // ڕەوانەکردنی لینکەکە بۆ APIێکی تایبەت بە وەرگرتنی میدیای سناپچات
    const apiUrl = `https://api.cobalt.tools/api/json`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    });

    const data = await response.json();

    if (data && data.url) {
      return res.status(200).json({ videoUrl: data.url });
    } else if (data && data.picker && data.picker.length > 0) {
      return res.status(200).json({ videoUrl: data.picker[0].url });
    } else {
      return res.status(404).json({ error: 'نەتوانرا لینکی ڤیدیۆ لەم ستۆرییە بدۆزرێتەوە' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'کێشەیەک لە پەیوەندیکردن بە سێرڤەر ڕووی دا' });
  }
}
