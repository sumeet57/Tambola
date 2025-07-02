import jwt from 'jsonwebtoken';

export default function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
