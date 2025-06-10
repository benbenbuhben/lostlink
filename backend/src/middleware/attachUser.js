// backend/src/middleware/attachUser.js
import User from '../models/User.js';

// Fires once at startup – quick sanity check that the file loaded
console.log('attachUser middleware loaded');

export async function attachUser(req, res, next) {
  // Skip unauthenticated requests
  if (!req.auth?.payload?.sub) return next();

  const payload   = req.auth.payload;
  const auth0Id   = payload.sub;
  const emailFrom = payload['https://lostlink.app/email'] || payload.email;

  try {
    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({
        auth0Id,
        email: emailFrom ?? `noemail+${auth0Id.replace('|', '_')}@lostlink.local`,
      });
      console.log(`👤 New user created: ${user.email}`);
    } else {
      console.log(`👤 Existing user loaded: ${user.email}`);
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('attachUser error:', err);
    next(err);
  }
}
