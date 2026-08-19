import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id: number | string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-jwt-secret', {
    expiresIn: '30d',
  });
};

export default generateToken;