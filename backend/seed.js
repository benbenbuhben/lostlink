import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Item from './src/models/Item.js';

// Load env vars from .env if present
dotenv.config();

async function seedDatabase() {
  // How many fake documents to generate – override via CLI args
  const numUsers = parseInt(process.argv[2], 10) || 5;
  const numItems = parseInt(process.argv[3], 10) || 20;

  try {
    // Connect to MongoDB
    await connectDB();

    console.log('🚀 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
    ]);

    console.log(`✨ Generating ${numUsers} users...`);
    const userDocs = Array.from({ length: numUsers }).map(() => ({
      email: faker.internet.email().toLowerCase(),
      auth0Id: faker.string.uuid(),
    }));

    const users = await User.insertMany(userDocs);

    console.log(`✨ Generating ${numItems} items...`);
    const itemDocs = Array.from({ length: numItems }).map(() => ({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      location: faker.address.city(),
      imageUrl: faker.image.urlPicsumPhotos({ width: 640, height: 640 }),
      createdBy: users[Math.floor(Math.random() * users.length)]._id,
    }));

    await Item.insertMany(itemDocs);

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    // Close the connection regardless of outcome
    await (await import('mongoose')).default.connection.close();
    process.exit(0);
  }
}

seedDatabase(); 