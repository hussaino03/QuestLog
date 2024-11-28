
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function updateReadme() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const userCount = await db.collection('users').countDocuments();
    
    const readmePath = path.join(process.cwd(), 'README.md');
    let readme = await fs.readFile(readmePath, 'utf8');
    
    // Update or add the user count section
    const userCountRegex = /(Current authorized users: )\d+/;
    if (readme.match(userCountRegex)) {
      readme = readme.replace(userCountRegex, `$1${userCount}`);
    } else {
      // Add after the title
      readme = readme.replace(
        '# 🎮 QuestLog',
        '# 🎮 QuestLog\n\nCurrent authorized users: ' + userCount
      );
    }
    
    await fs.writeFile(readmePath, readme);
    console.log(`Updated README with ${userCount} users`);
  } finally {
    await client.close();
  }
}

updateReadme().catch(console.error);