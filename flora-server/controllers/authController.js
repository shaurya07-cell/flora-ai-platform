import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Register a new customer user.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, email, and password are required.'
        }
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address.'
        }
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long.'
        }
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email address already exists.'
        }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
      provider: 'local',
      role: 'user'
    });

    await user.save();
    console.log(`[USER] Registered new user id: ${user._id}, email: ${user.email}, database: ${User.db.name}`);
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Customer Login endpoint.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required.'
        }
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'This account has been disabled. Please contact support.'
        }
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Login endpoint (enforces role === 'admin').
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Admin email and password are required.'
        }
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid admin credentials.'
        }
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Account does not have administrator privileges.'
        }
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid admin credentials.'
        }
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get OAuth Client configuration status for Google and GitHub.
 */
export const getOAuthConfig = async (req, res, next) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || null;
    const githubClientId = process.env.GITHUB_CLIENT_ID || null;

    return res.status(200).json({
      success: true,
      data: {
        googleConfigured: Boolean(googleClientId && process.env.GOOGLE_CLIENT_SECRET),
        githubConfigured: Boolean(githubClientId && process.env.GITHUB_CLIENT_SECRET),
        googleClientId,
        githubClientId
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Google OAuth endpoint boundary handler.
 */
export const googleAuth = async (req, res, next) => {
  try {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      return res.status(501).json({
        success: false,
        error: {
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth environment variables (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured on the server.'
        }
      });
    }

    // Process token payload if present
    let { token: idToken, userProfile } = req.body || {};
    if (!idToken && !userProfile) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OAUTH_PAYLOAD',
          message: 'Google OAuth authentication token is missing from request.'
        }
      });
    }

    // If userProfile is missing or incomplete, but token is present, fetch profile from Google API
    if ((!userProfile || !userProfile.email) && idToken) {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (googleRes.ok) {
          const profileData = await googleRes.json();
          if (profileData && profileData.email) {
            userProfile = {
              id: profileData.sub || profileData.email,
              name: profileData.name || profileData.given_name || profileData.email.split('@')[0],
              email: profileData.email,
              avatar: profileData.picture
            };
          }
        } else {
          console.warn(`[OAUTH] Google UserInfo fetch returned status ${googleRes.status}`);
        }
      } catch (fetchErr) {
        console.error('[OAUTH] Server-side Google UserInfo fetch failed:', fetchErr.message);
      }
    }

    // Provision or update user from OAuth payload
    const email = userProfile?.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OAUTH_PAYLOAD',
          message: 'User email missing from Google OAuth profile.'
        }
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: userProfile.name || 'Google User',
        email,
        provider: 'google',
        providerId: userProfile.id || idToken,
        role: 'user'
      });
    } else {
      user.provider = 'google';
      user.lastLoginAt = new Date();
    }
    await user.save();

    const jwtToken = generateToken(user);
    return res.status(200).json({
      success: true,
      data: { token: jwtToken, user: user.toJSON() }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GitHub OAuth endpoint boundary handler.
 */
export const githubAuth = async (req, res, next) => {
  try {
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      return res.status(501).json({
        success: false,
        error: {
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'GitHub OAuth environment variables (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) are not configured on the server.'
        }
      });
    }

    const { code, userProfile } = req.body || {};
    if (!code && !userProfile) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OAUTH_PAYLOAD',
          message: 'GitHub OAuth authorization code is missing from request.'
        }
      });
    }

    const email = userProfile?.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OAUTH_PAYLOAD',
          message: 'User email missing from GitHub OAuth profile.'
        }
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: userProfile.name || 'GitHub User',
        email,
        provider: 'github',
        providerId: userProfile.id || code,
        role: 'user'
      });
    } else {
      user.provider = 'github';
      user.lastLoginAt = new Date();
    }
    await user.save();

    const jwtToken = generateToken(user);
    return res.status(200).json({
      success: true,
      data: { token: jwtToken, user: user.toJSON() }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Return current authenticated user profile.
 * Only safe, non-sensitive fields are returned. Never passwordHash, providerId, or secrets.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout session invalidation endpoint.
 */
export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change Password for currently authenticated user.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Both current password and new password are required.'
        }
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_PASSWORD_SET',
          message: 'OAuth accounts cannot change password directly.'
        }
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Current password is incorrect.'
        }
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SAME_PASSWORD',
          message: 'New password must be different from current password.'
        }
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long.'
        }
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Profile for currently authenticated user.
 * Whitelists editable fields (name, avatar). Role, email, and passwordHash cannot be modified here.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body || {};

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_NAME',
            message: 'Name cannot be empty.'
          }
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found.'
        }
      });
    }

    if (name !== undefined) {
      user.name = String(name).trim();
    }
    if (avatar !== undefined) {
      user.avatar = avatar ? String(avatar).trim() : null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.toJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};
