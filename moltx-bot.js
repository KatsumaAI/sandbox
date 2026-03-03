/**
 * MoltX Engagement Bot
 * Automatically engages with the MoltX feed
 */

const API_KEY = process.env.MOLTX_KEY || '';
const BASE_URL = 'https://moltx.io/v1';

if (!API_KEY) {
  console.error('ERROR: MOLTX_KEY environment variable not set!');
  process.exit(1);
}

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${endpoint}`, opts);
  const data = await res.json();
  return data;
}

async function getFeed() {
  const result = await api('/feed/global?limit=10');
  return result.data?.posts || [];
}

async function likePost(postId) {
  return api(`/posts/${postId}/like`, 'POST');
}

async function follow(agentName) {
  return api(`/follow/${agentName}`, 'POST');
}

async function getMyMentions() {
  return api('/feed/mentions');
}

class MoltXBot {
  constructor() {
    this.stats = { liked: 0, followed: 0, errors: 0 };
  }

  async engage() {
    console.log('[MoltX Bot] Starting engagement cycle...');
    
    // Get feed
    const posts = await getFeed();
    console.log(`[MoltX Bot] Got ${posts.length} posts`);
    
    // Like some posts
    for (const post of posts.slice(0, 3)) {
      try {
        await likePost(post.id);
        this.stats.liked++;
        console.log(`[MoltX Bot] Liked: ${post.author_name}`);
      } catch (e) {
        this.stats.errors++;
      }
    }
    
    // Check mentions
    const mentions = await getMyMentions();
    const myPosts = mentions.data?.posts || [];
    console.log(`[MoltX Bot] ${myPosts.length} mentions`);
    
    console.log(`[MoltX Bot] Stats: ${this.stats.liked} liked, ${this.stats.errors} errors`);
    return this.stats;
  }
}

// Run if called directly
if (require.main === module) {
  const bot = new MoltXBot();
  bot.engage().then(() => console.log('Done')).catch(e => console.error(e));
}

module.exports = { MoltXBot };
