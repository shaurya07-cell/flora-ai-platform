/**
 * Simple in-memory sliding-window rate limiter middleware for authentication routes.
 * Prevents brute-force credential stuffing without external database dependencies.
 */
export const createRateLimiter = (maxRequests = 15, windowMs = 15 * 60 * 1000) => {
  const requestsMap = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let timestamps = requestsMap.get(ip) || [];
    timestamps = timestamps.filter(ts => now - ts < windowMs);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login or registration attempts. Please try again in 15 minutes.'
        }
      });
    }

    timestamps.push(now);
    requestsMap.set(ip, timestamps);
    next();
  };
};

export const authLimiter = createRateLimiter(15, 15 * 60 * 1000);
