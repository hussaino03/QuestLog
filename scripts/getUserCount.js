const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function updateReadme() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('📊 Connected to MongoDB, fetching user count...');
    
    const db = client.db();
    console.log('📊 Connected to MongoDB, fetching user count...');

    const users = await db.collection('users').find({}).toArray();
    console.log(users);

    
    // Only count users who have authenticated (have googleId)
    const userCount = await db.collection('users').countDocuments({
      googleId: { $exists: true, $ne: null }  // Only count users with a valid googleId
    });
    
    console.log(`Database query: Found ${userCount} authenticated users`);
    console.log(`Collection total documents: ${await db.collection('users').countDocuments()}`);
    
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
  } catch (error) {
    console.error('❌ Error fetching user count:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection');
  }
}

updateReadme().catch(console.error);