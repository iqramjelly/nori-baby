export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const GIST_ID = process.env.VOTE_GIST_ID;
  const TOKEN = process.env.GITHUB_TOKEN;

  async function getVotes() {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'nori-baby-site' }
    });
    const data = await r.json();
    const content = data.files?.['votes.json']?.content || '{"brother":0,"sister":0}';
    return JSON.parse(content);
  }

  async function saveVotes(votes) {
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'nori-baby-site'
      },
      body: JSON.stringify({ files: { 'votes.json': { content: JSON.stringify(votes) } } })
    });
  }

  if (req.method === 'GET') {
    try {
      const votes = await getVotes();
      return res.status(200).json(votes);
    } catch (e) {
      return res.status(200).json({ brother: 0, sister: 0 });
    }
  }

  if (req.method === 'POST') {
    const { choice } = req.body;
    if (choice !== 'brother' && choice !== 'sister') {
      return res.status(400).json({ error: 'Invalid choice' });
    }
    try {
      const votes = await getVotes();
      votes[choice] = (votes[choice] || 0) + 1;
      await saveVotes(votes);
      return res.status(200).json(votes);
    } catch (e) {
      return res.status(200).json({ brother: 0, sister: 0, error: 'storage_error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
