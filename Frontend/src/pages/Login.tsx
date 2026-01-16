import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types/user';
import { Button } from '../components/UI/Button';

const loginSchema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Minimum 6 caracteres').required('Mot de passe requis'),
});

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const brandStyles = {
    '--eq-ink': '#0f2a36',
    '--eq-slate': '#3b4a54',
    '--eq-accent': '#1f6f66',
    '--eq-gold': '#d2b16b',
  } as React.CSSProperties;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-[#f4f5f2] text-[var(--eq-ink)]"
      style={{ ...brandStyles, fontFamily: '"Manrope", "Segoe UI", sans-serif' }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');
          @keyframes eq-fade-up {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes eq-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 10% 10%, rgba(31, 111, 102, 0.12), transparent 40%), radial-gradient(circle at 80% 20%, rgba(210, 177, 107, 0.18), transparent 42%), linear-gradient(135deg, #f4f5f2 0%, #f9faf7 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 right-[-120px] h-72 w-72 rounded-full"
        style={{ background: 'rgba(15, 42, 54, 0.08)', filter: 'blur(12px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-140px] left-[-80px] h-80 w-80 rounded-full"
        style={{ background: 'rgba(31, 111, 102, 0.12)', filter: 'blur(16px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div
            className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur px-8 py-10 shadow-[0_20px_60px_rgba(15,42,54,0.12)]"
            style={{ animation: 'eq-fade-up 0.8s ease-out both', animationDelay: '60ms' }}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[var(--eq-ink)] text-white flex items-center justify-center text-xl font-semibold">
                E
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--eq-accent)] font-semibold">
                  Plateforme
                </p>
                <p className="text-sm text-[var(--eq-slate)]">Gestion academique et alternance</p>
              </div>
            </div>

            <h1
              className="mt-8 text-5xl sm:text-6xl font-semibold text-[var(--eq-ink)] tracking-tight"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Equilibre
            </h1>
            <div className="mt-4 h-px w-24 bg-[var(--eq-gold)]" />
            <p className="mt-4 text-lg text-[var(--eq-slate)] max-w-md">
              Un espace unique pour piloter le suivi des etudiants, des journaux et des
              soutenances avec une vision claire et partagee.
            </p>

            <div className="mt-8 grid gap-4 text-sm text-[var(--eq-slate)]">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--eq-accent)]" />
                <span>Suivi centralise des journaux et exigences</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--eq-accent)]" />
                <span>Calendrier et soutenances synchronises</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--eq-accent)]" />
                <span>Reporting clair pour equipes pedagogiques</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-xs font-semibold text-[var(--eq-ink)]">
              <span className="rounded-full border border-[var(--eq-ink)]/15 px-4 py-2">
                Acces securise
              </span>
              <span className="rounded-full border border-[var(--eq-ink)]/15 px-4 py-2">
                Donnees tracees
              </span>
              <span className="rounded-full border border-[var(--eq-ink)]/15 px-4 py-2">
                Collaboration equipe
              </span>
            </div>
          </div>

          <div
            className="rounded-3xl bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,42,54,0.18)] border border-slate-100"
            style={{ animation: 'eq-fade-up 0.8s ease-out both', animationDelay: '140ms' }}
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eq-accent)]">
                Connexion
              </p>
              <h2 className="text-2xl font-semibold text-[var(--eq-ink)]">Acces a votre espace</h2>
              <p className="text-sm text-[var(--eq-slate)]">
                Utilisez vos identifiants Equilibre pour continuer.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--eq-ink)]">
                    Email professionnel
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="mt-2 block w-full rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-sm focus:border-[var(--eq-accent)] focus:ring-[var(--eq-accent)] sm:text-sm"
                    placeholder="prenom.nom@equilibre.edu"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--eq-ink)]">
                    Mot de passe
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className="mt-2 block w-full rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-sm focus:border-[var(--eq-accent)] focus:ring-[var(--eq-accent)] sm:text-sm"
                    placeholder="********"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[var(--eq-ink)] hover:bg-[#0b202a] focus:ring-[#0b202a]"
                isLoading={isSubmitting}
              >
                Se connecter
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-[var(--eq-slate)]">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-[var(--eq-accent)] hover:text-[#195b54]">
                Creer un nouveau compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
