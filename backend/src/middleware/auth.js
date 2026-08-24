import jwt from 'jsonwebtoken';

// Middleware per verificare JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  console.log('🔐 Verifying token, JWT_SECRET is:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('✅ Token verified for user:', user.email);
    req.user = user;
    next();
  });
};

// Middleware per verificare se admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accesso negato. Admin richiesto.' });
  }

  next();
};

// Middleware per verificare se coach o admin
export const isCoach = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const allowedRoles = ['ADMIN', 'COACH'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accesso negato. Coach o Admin richiesto.' });
  }

  next();
};

// Middleware opzionale per autenticazione (non blocca se non autenticato)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};
