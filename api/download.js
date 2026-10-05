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
    // 1. شوێنکەوتنی لینکەکە بۆ دەستکەوتنی لینکی ڕاستەقینە
    const headRes = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      },
      redirect: 'follow'
    });

    const finalUrl = headRes.url;
    const html = await headRes.text();

    // 2. گەڕان بەدوای فایلی mp4 یان m3u8 لەناو لاپەڕەکەدا
    const videoMatches = html.match(/https:\/\/[^"\s\\]+\.mp4[^"\s\\]*/g) || 
                         html.match(/https:\/\/cf-st\.sc-cdn\.net\/[^"\s\\]+/g) ||
                         html.match(/https:\/\/[^"\s\\]+\.m3u8[^"\s\\]*/g);

    if (videoMatches && videoMatches.length > 0) {
      let cleanUrl = videoMatches[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
      return res.status(200).json({ videoUrl: cleanUrl });
    }

    // 3. ئەگەر بە ڕێگەی یەکەم نەدۆزرایەوە، ناردنی بۆ APIی بەهێزی شوێنگرەوە
    const proxyRes = await fetch(`https://api.cobalt.tools/api/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ url: finalUrl || url })
    });

    const proxyData = await proxyRes.json();

    if (proxyData && proxyData.url) {
      return res.status(200).json({ videoUrl: proxyData.url });
    } else if (proxyData && proxyData.picker && proxyData.picker.length > 0) {
      return res.status(200).json({ videoUrl: proxyData.picker[0].url });
    }

    return res.status(404).json({ error: 'نەتوانرا لینکی ڤیدیۆکە لەم ستۆرییە بدۆزرێتەوە. دڵنیابەوە لەوەی ستۆرییەکە گشتییە (Public).' });

  } catch (error) {
    return res.status(500).json({ error: 'کێشەیەک لە سێرڤەر ڕووی دا' });
  }
}
