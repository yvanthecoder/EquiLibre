import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI/Button';
import axios from 'axios';

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  classId?: string;
}

interface Class {
  id: number;
  name: string;
  description?: string;
  year?: string;
  level?: string;
}

// Schema de validation de base
const baseSchema = {
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
  firstName: yup.string().required('Prénom requis'),
  lastName: yup.string().required('Nom requis'),
  role: yup.string().oneOf(['ALTERNANT', 'ETUDIANT_CLASSIQUE', 'TUTEUR_ECOLE', 'MAITRE_APP', 'ADMIN']).required('Rôle requis'),
  phone: yup.string(),
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Schema de validation dynamique
  const getValidationSchema = () => {
    let schema = baseSchema;

    if (selectedRole === 'ALTERNANT') {
      return yup.object({
        ...schema,
        company: yup.string().required('Entreprise requise'),
        jobTitle: yup.string().required('Poste requis'),
        classId: yup.string().required('Classe requise'),
      });
    }

    if (selectedRole === 'MAITRE_APP') {
      return yup.object({
        ...schema,
        company: yup.string().required('Entreprise requise'),
        jobTitle: yup.string().required('Poste requis'),
      });
    }

    if (selectedRole === 'ETUDIANT_CLASSIQUE') {
      return yup.object({
        ...schema,
        classId: yup.string().required('Classe requise'),
      });
    }

    return yup.object(schema);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(getValidationSchema()),
  });

  const role = watch('role');

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      setClassesError(null);

      try {
        const response = await axios.get(`${API_URL}/api/classes/available`);

        if (response.data.success) {
          setClasses(response.data.data);
        } else {
          setClassesError('Impossible de charger les classes');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        setClassesError('Erreur lors du chargement des classes');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    setSelectedRole(role || '');
  }, [role]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Téléphone (optionnel) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rôle *
              </label>
              <select
                {...register('role')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="ETUDIANT_CLASSIQUE">Étudiant en cycle classique</option>
                <option value="ALTERNANT">Étudiant en alternance</option>
                <option value="TUTEUR_ECOLE">Tuteur d'école</option>
                <option value="MAITRE_APP">Maître d'apprentissage</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Champs conditionnels selon le rôle */}

            {/* Pour ALTERNANT et MAITRE_APP: Entreprise et Poste */}
            {(selectedRole === 'ALTERNANT' || selectedRole === 'MAITRE_APP') && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700">Informations professionnelles</p>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Entreprise *
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Nom de l'entreprise"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Poste occupé *
                  </label>
                  <input
                    {...register('jobTitle')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Développeur, Chef de projet..."
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Pour ALTERNANT et ETUDIANT_CLASSIQUE: Classe */}
            {(selectedRole === 'ALTERNANT' || selectedRole === 'ETUDIANT_CLASSIQUE') && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700">Informations scolaires</p>

                <div>
                  <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                    Classe *
                  </label>
                  <select
                    {...register('classId')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    disabled={loadingClasses}
                  >
                    <option value="">
                      {loadingClasses
                        ? 'Chargement des classes...'
                        : 'Sélectionnez votre classe'}
                    </option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.year ? `(${cls.year})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
                  )}
                  {classesError && (
                    <p className="mt-1 text-sm text-red-600">{classesError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            Créer le compte
          </Button>
        </form>
      </div>
    </div>
  );
};
