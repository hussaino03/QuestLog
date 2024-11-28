import { connectToDatabase } from '../server/db.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function updateReadme() {
  try {
    const db = await connectToDatabase();
    console.log('📊 Connected to MongoDB, fetching user count...');

    const userCount = await db.collection('users').countDocuments({
      googleId: { 
        $exists: true, 
        $ne: null,
        $ne: "" 
      }
    });

    console.log(`Database query: Found ${userCount} authenticated users`);
    console.log(`Collection total documents: ${await db.collection('users').countDocuments()}`);

    const readmePath = join(__dirname, '..', '..', 'README.md');
    let readme = await fs.readFile(readmePath, 'utf8');

    // Update or add the user count section
    const userCountRegex = /(Current authorized users: )\d+/;
    if (readme.match(userCountRegex)) {
      readme = readme.replace(userCountRegex, `$1${userCount}`);
    } else {
      readme = readme.replace(
        '# 🎮 QuestLog',
        `# 🎮 QuestLog\n\nCurrent authorized users: ${userCount}`
      );
    }

    await fs.writeFile(readmePath, readme);
    console.log(`Updated README with ${userCount} users`);
    return userCount;

  } catch (error) {
    console.error('Error updating user count:', error);
    throw error;
  }
}