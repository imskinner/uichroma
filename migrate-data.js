require('dotenv').config();
const { Pool } = require('pg');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Get all palettes from PostgreSQL
    const { rows } = await pool.query('SELECT * FROM palettes');
    console.log(`Found ${rows.length} palettes to migrate`);

    const palettesRef = collection(db, 'palettes');
    let successCount = 0;
    let errorCount = 0;

    // Migrate each palette
    for (const palette of rows) {
      try {
        // Transform the data to match Firestore structure
        const firestorePalette = {
          keywords: palette.keywords,
          colors: JSON.parse(palette.colors), // Parse the JSON string
          ai_response: palette.ai_response,
          created_at: palette.created_at,
          permalink: palette.permalink
        };

        // Add to Firestore
        await addDoc(palettesRef, firestorePalette);
        successCount++;
        console.log(`Migrated palette with permalink: ${palette.permalink}`);
      } catch (error) {
        errorCount++;
        console.error(`Error migrating palette ${palette.permalink}:`, error.message);
      }
    }

    console.log('\nMigration completed!');
    console.log(`Successfully migrated: ${successCount} palettes`);
    console.log(`Failed to migrate: ${errorCount} palettes`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the PostgreSQL connection
    await pool.end();
    process.exit();
  }
}

// Run the migration
migrateData(); 