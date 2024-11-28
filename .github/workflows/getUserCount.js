const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function getUserCount() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('📊 Connected to MongoDB');
    
    const db = client.db("usersDB");

    const userCount = await db.collection('users').countDocuments({
      googleId: { $exists: true, $ne: null }
    });
    
    console.log(`Authenticated users count: ${userCount}`);

    const readmePath = path.join(process.cwd(), 'README.md');
    let readme = await fs.readFile(readmePath, 'utf8');

    const userCountRegex = /!\[.*?\]\(https:\/\/img\.shields\.io\/badge\/.*?\)/;
    if (readme.match(userCountRegex)) {
      readme = readme.replace(
        userCountRegex, 
        `![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-${userCount}-blue?logo=mongodb&logoColor=white)`
      );
    } else {
      readme = readme.replace(
        '# 🎮 QuestLog',
        `# 🎮 QuestLog\n\n![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-${userCount}-blue?logo=mongodb&logoColor=white)`
      );
    }

    await fs.writeFile(readmePath, readme);
    console.log(`Updated README with ${userCount} users`);

    return userCount;

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection');
  }
}

getUserCount().catch(console.error);