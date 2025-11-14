import { Router, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.config';
import { User } from '../models/user.model';
import { ResultSetHeader } from 'mysql2';
import { generateToken } from '../utils/jwt.utils';

const router = Router();

// Route de test
router.get('/test', (_req: Request, res: Response) => {
  res.json({ message: 'Auth routes fonctionnent' });
});

// Inscription
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe
    const [existing] = await pool.query<User[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Utiliser la fonction helper
    const token = generateToken({
      id: result.insertId,
      email,
      name
    });

    res.status(201).json({
      message: 'Utilisateur créé',
      token,
      user: { id: result.insertId, email, name }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const [rows] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(401).json({ message: 'Utilisez Google pour vous connecter' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Utiliser la fonction helper
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Google OAuth - Initiation
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false 
  })
);

// Google OAuth - Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: '/login' 
  }),
  (req: Request, res: Response) => {
    const user = req.user as User;
    
    // Utiliser la fonction helper
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Route protégée - Profil utilisateur
router.get('/me',
  passport.authenticate('jwt', { session: false }),
  (req: Request, res: Response) => {
    res.json(req.user);
  }
);

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Déconnexion réussie' });
});

export default router;
