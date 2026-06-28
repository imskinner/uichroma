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

// Firestore stored timestamps two ways over the app's life: an ISO string (Express path) or a
// Firestore Timestamp object {_seconds,_nanoseconds} (older Cloud Function path). Normalize both.
function toIso(v) {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (typeof v._seconds === 'number') return new Date(v._seconds * 1000).toISOString();
  return null;
}

async function main() {
  initFirebase();
  const firestore = admin.firestore();
  const supabase = getSupabase();

  const snap = await firestore.collection('palettes').get();
  console.log(`Found ${snap.size} palettes in Firestore.`);

  const byPermalink = new Map(); // de-dup: last write wins
  let skipped = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    // The Express path stores a `permalink` field; the old Cloud Function used the permalink as
    // the document id. Fall back to the id so neither source is lost.
    const permalink = d.permalink || doc.id;
    if (!permalink || !d.colors) {
      skipped++;
      continue;
    }
    const row = {
      permalink,
      keywords: d.keywords ?? null,
      colors: d.colors,
      ai_response: d.ai_response ?? null,
    };
    // created_at is NOT NULL; always provide a value (PostgREST inserts explicit NULL for keys
    // omitted from a batch when other rows include them, which would bypass the column default).
    row.created_at = toIso(d.created_at) || new Date().toISOString();
    const updated = toIso(d.updated_at);
    if (updated) row.updated_at = updated;
    byPermalink.set(permalink, row);
  }

  const rows = [...byPermalink.values()];
  console.log(`Prepared ${rows.length} unique rows (${skipped} skipped).`);

  let upserted = 0;
  let failed = 0;
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(TABLE).upsert(chunk, { onConflict: 'permalink' });
    if (error) {
      console.error(`  ✗ chunk ${i}–${i + chunk.length}: ${error.message}`);
      failed += chunk.length;
    } else {
      upserted += chunk.length;
      process.stdout.write(`  ✓ ${upserted}/${rows.length}\r`);
    }
  }
  console.log(`\nDone. upserted=${upserted} failed=${failed} skipped=${skipped}`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
