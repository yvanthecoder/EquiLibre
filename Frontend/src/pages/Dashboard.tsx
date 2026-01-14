import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { StudentDashboard } from '../components/dashboards/StudentDashboard';
import { InstructorDashboard } from '../components/dashboards/InstructorDashboard';
import { MaitreAppDashboard } from '../components/dashboards/MaitreAppDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Utilisateur non connecté</p>
        </div>
      </div>
    );
  }

  const getDashboardGreeting = (role: string) => {
    const greetings = {
      ALTERNANT: 'Bon retour sur votre espace alternant',
      ETUDIANT_CLASSIQUE: 'Bienvenue sur votre espace étudiant',
      TUTEUR_ECOLE: 'Bienvenue sur votre espace tuteur',
      MAITRE_APP: "Bienvenue sur votre espace maître d'apprentissage",
      ADMIN: 'Tableau de bord administrateur',
      JURY: 'Bienvenue sur votre espace jury',
      INTERVENANT: 'Bienvenue sur votre espace intervenant',
    };
    return greetings[role as keyof typeof greetings] || 'Bienvenue';
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'ALTERNANT':
      case 'ETUDIANT_CLASSIQUE':
        return <StudentDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'TUTEUR_ECOLE':
        return <InstructorDashboard />;
      case 'MAITRE_APP':
        return <MaitreAppDashboard />;
      case 'JURY':
      case 'INTERVENANT':
        return <InstructorDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Dashboard non disponible pour ce rôle</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getDashboardGreeting(user.role)}</h1>
        <p className="text-gray-600">
          {user.firstName} {user.lastName}
        </p>
      </div>

      {renderDashboard()}
    </div>
  );
};
