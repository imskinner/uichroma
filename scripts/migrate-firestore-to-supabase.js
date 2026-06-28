// One-time data migration: copy the `palettes` Firestore collection into the Supabase
// `themes` table. Idempotent — upserts on `permalink`, so it is safe to re-run.
//
// Prerequisites (env, e.g. via .env):
//   - Firestore read:  GOOGLE_APPLICATION_CREDENTIALS=<path to the *-adminsdk-*.json key>
//                      (or FIREBASE_SERVICE_ACCOUNT=<the JSON as a string>)
//   - Supabase write:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Run:  npm run migrate
require('dotenv').config();
const admin = require('firebase-admin');
const { getSupabase, TABLE } = require('../db');

function initFirebase() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    return;
  }
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS (a key-file path) or ambient credentials.
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

async function main() {
  initFirebase();
  const firestore = admin.firestore();
  const supabase = getSupabase();

  const snap = await firestore.collection('palettes').get();
  console.log(`Found ${snap.size} palettes in Firestore.`);

  let upserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    if (!d.permalink || !d.colors) {
      console.warn(`  - skipping doc ${doc.id} (missing permalink or colors)`);
      skipped++;
      continue;
    }
    const row = {
      permalink: d.permalink,
      keywords: d.keywords ?? null,
      colors: d.colors,
      ai_response: d.ai_response ?? null,
      created_at: d.created_at ?? new Date().toISOString(),
    };
    const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'permalink' });
    if (error) {
      console.error(`  ✗ ${d.permalink}: ${error.message}`);
      failed++;
    } else {
      upserted++;
    }
  }

  console.log(`Done. upserted=${upserted} skipped=${skipped} failed=${failed}`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
