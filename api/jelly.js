export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const r = await fetch(
      'https://api.jellyjelly.com/v3/jelly/01KQ6H4E5AKW57QQTZ8JJN6ZSW',
      { headers: { Authorization: `Bearer ${process.env.JELLY_AUTH_TOKEN}` } }
    );
    const data = await r.json();
    const jelly = data.jelly || {};
    const video = jelly.video || {};
    return res.status(200).json({
      hls: video.hls_master || '',
      thumbnail: jelly.thumbnail_url || '',
      title: jelly.title || '',
      watch: 'https://jellyjelly.com/watch/01KQ6H4E5AKW57QQTZ8JJN6ZSW'
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch jelly' });
  }
}
