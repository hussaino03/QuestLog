const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function getUserCount() {
  let client;
  try {
    // Validate environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('📊 Connected to MongoDB');
    
    const db = client.db("usersDB");
    const userCount = await db.collection('users').countDocuments({
      googleId: { $exists: true, $ne: null }
    });
    
    // Calculate total XP across all users
    const xpResult = await db.collection('users').aggregate([
      { $group: { _id: null, totalXP: { $sum: "$xp" } } }
    ]).toArray();
    
    const totalXP = xpResult[0]?.totalXP || 0;
    console.log("the total user xp is: ", totalXP)

    const readmePath = path.join(__dirname, '..', '..', 'README.md');    
    // Verify file exists
    try {
      await fs.access(readmePath);
    } catch {
      throw new Error('README.md not found');
    }

    // Read file
    let readme = await fs.readFile(readmePath, 'utf8');

    const statsRegex = /!\[Current Authorized Users\].*?\) !\[Total User XP\].*?\)/;
    const newBadges = 
      `![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-${userCount}-blue?logo=mongodb&logoColor=white) ` +
      `![Total User XP](https://img.shields.io/badge/Total%20User%20XP-${totalXP.toLocaleString()}-red?logo=zap&logoColor=white)`;

    if (readme.match(statsRegex)) {
      readme = readme.replace(statsRegex, newBadges);
    } else {
      readme = readme.replace(
        '# 🎮 QuestLog',
        `# 🎮 QuestLog\n\n${newBadges}`
      );
    }

    // Write atomically
    const tempPath = `${readmePath}.tmp`;
    await fs.writeFile(tempPath, readme);
    await fs.rename(tempPath, readmePath);

    console.log(`Updated README with ${userCount} users and ${totalXP.toLocaleString()} total XP`);
    return { userCount, totalXP };

  } catch (error) {
    // Sanitize error message
    console.error('Error:', error.message);
    throw new Error('Failed to update user count');
  } finally {
    if (client) {
      await client.close().catch(() => {});
      console.log('🔌 Closed MongoDB connection');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  getUserCount().catch(() => process.exit(1));
}

module.exports = getUserCount;