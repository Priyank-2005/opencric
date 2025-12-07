// filepath: backend/seed.js
const mongoose = require('mongoose');
const Match = require('./models/Match');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opencric';
const BATCH_SIZE = 100; // Process 100 files at a time to save memory

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // 1. Clear existing data
    console.log('Clearing existing matches...');
    await Match.deleteMany({});
    console.log('Database cleared.');

    const dataDir = path.join(__dirname, 'data');
    
    // Get list of all filenames (low memory usage compared to file contents)
    console.log('Scanning data directory...');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    const totalFiles = files.length;

    if (totalFiles === 0) {
      console.log('No JSON files found in backend/data/. Please add files.');
      process.exit(1);
    }

    console.log(`Found ${totalFiles} files. Starting batch processing...`);

    let batch = [];
    let processedCount = 0;

    // 2. Loop through files one by one
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      
      try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const matchData = JSON.parse(rawData);
        
        // Basic check to ensure valid data
        if (matchData.info) {
            batch.push(matchData);
        }
      } catch (err) {
        console.error(`Skipping ${file}: Invalid JSON or read error.`);
      }

      // 3. When batch is full, insert into DB and clear memory
      if (batch.length >= BATCH_SIZE) {
        await Match.insertMany(batch);
        processedCount += batch.length;
        batch = []; // Clear array to free memory
        
        // Log progress
        process.stdout.write(`\rProgress: ${processedCount} / ${totalFiles} matches seeded...`);
      }
    }

    // 4. Insert any remaining files in the final batch
    if (batch.length > 0) {
      await Match.insertMany(batch);
      processedCount += batch.length;
    }

    console.log(`\n\nSuccess! Seeded ${processedCount} matches.`);
    process.exit(0);
  } catch (err) {
    console.error('\nSeeding failed:', err);
    process.exit(1);
  }
};

seedData();