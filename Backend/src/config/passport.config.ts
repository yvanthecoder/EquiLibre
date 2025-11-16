import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { pool } from './db.config';
import { User } from '../models/user.model';
import { ResultSetHeader } from 'mysql2';

// Configuration JWT
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

// JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload: any, done) => {
    try {
      const [rows] = await pool.query<User[]>(
        'SELECT id, email, name, googleId FROM users WHERE id = ?',
        [payload.id]
      );
      
      if (rows.length > 0) {
        return done(null, rows[0]);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;

        if (!email) {
          return done(new Error('Email non fourni par Google'), undefined);
        }

        // Vérifier si l'utilisateur existe
        const [rows] = await pool.query<User[]>(
          'SELECT * FROM users WHERE googleId = ? OR email = ?',
          [googleId, email]
        );

        if (rows.length > 0) {
          return done(null, rows[0]);
        }

        // Créer un nouvel utilisateur
        const [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO users (email, googleId, name) VALUES (?, ?, ?)',
          [email, googleId, name]
        );

        const newUser: User = {
          id: result.insertId,
          email,
          googleId,
          name,
          created_at: new Date()
        } as User;

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
