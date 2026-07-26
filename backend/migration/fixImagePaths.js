/**
 * fixImagePaths.js
 *
 * Repairs image paths that were stored as filesystem paths instead of URL
 * paths, which made profile pictures and post images fail to load.
 *
 * The client builds image URLs as `${BACKEND_URL}${storedValue}`, so the stored
 * value must be root-relative and begin with a slash — e.g. `/uploads/x.png`.
 *
 * Two broken shapes existed:
 *   RegisterUser.js  stored multer's absolute `file.path`
 *                    e.g. /home/user/FindOut/backend/uploads/123-a.png
 *   PostController   stored a CWD-relative path
 *                    e.g. uploads/posts/123-a.png   (no leading slash)
 *
 * Both are normalised to everything from `/uploads` onward.
 *
 * Usage:
 *   node backend/migration/fixImagePaths.js           # dry run, changes nothing
 *   node backend/migration/fixImagePaths.js --apply   # writes the changes
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const GroupModel = require('../models/GroupModel');

const APPLY = process.argv.includes('--apply');

/**
 * Normalise one stored value to a root-relative /uploads/... path.
 * Returns null when the value is absent or already correct.
 */
function normalise(value) {
  if (!value || typeof value !== 'string') return null;

  // Windows separators to POSIX
  let v = value.replace(/\\/g, '/');

  // Already correct
  if (/^\/uploads\//.test(v)) return null;

  // Keep remote URLs untouched
  if (/^https?:\/\//i.test(v)) return null;

  // Take everything from the last `uploads/` onward
  const idx = v.lastIndexOf('uploads/');
  if (idx === -1) return null;

  const fixed = '/' + v.slice(idx);
  return fixed === value ? null : fixed;
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Check backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected. Mode: ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`);

  let userCount = 0;
  let postCount = 0;
  let groupCount = 0;

  // ---- Users -------------------------------------------------------------
  const users = await UserModel.find({ profilePicture: { $ne: null } })
    .select('_id name profilePicture');
  for (const u of users) {
    const fixed = normalise(u.profilePicture);
    if (!fixed) continue;
    console.log(`USER  ${u.name}`);
    console.log(`      ${u.profilePicture}`);
    console.log(`   -> ${fixed}\n`);
    if (APPLY) await UserModel.updateOne({ _id: u._id }, { profilePicture: fixed });
    userCount++;
  }

  // ---- Posts -------------------------------------------------------------
  const posts = await PostModel.find({ image: { $ne: null } }).select('_id image');
  for (const p of posts) {
    const fixed = normalise(p.image);
    if (!fixed) continue;
    console.log(`POST  ${p._id}`);
    console.log(`      ${p.image}`);
    console.log(`   -> ${fixed}\n`);
    if (APPLY) await PostModel.updateOne({ _id: p._id }, { image: fixed });
    postCount++;
  }

  // ---- Groups ------------------------------------------------------------
  const groups = await GroupModel.find({ groupProfile: { $ne: null } })
    .select('_id groupName groupProfile');
  for (const g of groups) {
    const fixed = normalise(g.groupProfile);
    if (!fixed) continue;
    console.log(`GROUP ${g.groupName}`);
    console.log(`      ${g.groupProfile}`);
    console.log(`   -> ${fixed}\n`);
    if (APPLY) await GroupModel.updateOne({ _id: g._id }, { groupProfile: fixed });
    groupCount++;
  }

  console.log('─'.repeat(52));
  console.log(`Users needing repair:  ${userCount}`);
  console.log(`Posts needing repair:  ${postCount}`);
  console.log(`Groups needing repair: ${groupCount}`);
  console.log(
    APPLY
      ? '\nChanges written.'
      : '\nNothing written. Re-run with --apply to write these changes.'
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
