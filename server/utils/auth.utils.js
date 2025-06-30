import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function createTokens(userId, sessionId) {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ sub: userId, sid: sessionId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY });
  return { accessToken, refreshToken };
}

