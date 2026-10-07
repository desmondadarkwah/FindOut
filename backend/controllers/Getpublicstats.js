const UserModel = require('../models/UserModel');
const GroupModel = require('../models/GroupModel');

// Public, read-only counts for the landing page.
// - Returns ONLY totals (no names, emails or any personal data).
// - Cached in memory for 5 minutes so a busy landing page doesn't hit the
//   database on every visit.
const CACHE_MS = 5 * 60 * 1000;
let cache = { data: null, expires: 0 };

const GetPublicStats = async (req, res) => {
  try {
    if (cache.data && Date.now() < cache.expires) {
      return res.status(200).json({ success: true, stats: cache.data });
    }

    const [users, groups, verifiedTeachers, subjectList] = await Promise.all([
      UserModel.countDocuments({}),
      // secret groups are hidden everywhere, so they are not advertised either
      GroupModel.countDocuments({ privacy: { $ne: 'secret' } }),
      UserModel.countDocuments({ isVerified: true }),
      UserModel.distinct('subjects'),
    ]);

    // "Maths", "maths " and "MATHS" count as one subject
    const subjects = new Set(
      subjectList
        .filter((s) => typeof s === 'string')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    ).size;

    const stats = { users, groups, subjects, verifiedTeachers };
    cache = { data: stats, expires: Date.now() + CACHE_MS };

    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error fetching public stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};

module.exports = GetPublicStats;