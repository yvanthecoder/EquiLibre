import * as jwt from 'jsonwebtoken';

export function generateToken(payload: object, expiresIn: string = "7d"): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET non défini dans les variables d'environnement (.env)"
    );
  }

  const options = { expiresIn };
  return (jwt as any).sign(payload, secret, options);
}

export function verifyToken<T = any>(token: string): T {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET non défini dans les variables d'environnement (.env)"
    );
  }
  return (jwt as any).verify(token, secret) as T;
}
