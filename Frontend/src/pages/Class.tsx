import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  EnvelopeIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import { mockClasses, mockUsers } from '../lib/mockData';

export const Class: React.FC = () => {
  const { user } = useAuth();
  
  // Get current user's class
  const userClass = mockClasses.find(c => c.id === user?.classId);
  const classMembers = mockUsers.filter(u => u.classId === user?.classId);
  const instructors = classMembers.filter(u => u.role === 'TUTEUR' || u.role === 'MAITRE_APP');
  const students = classMembers.filter(u => u.role === 'ETUDIANT' || u.role === 'ALTERNANT');

  const getRoleLabel = (role: string) => {
    const roles = {
      ALTERNANT: 'Alternant',
      ETUDIANT: 'Étudiant',
      TUTEUR: 'Tuteur',
      MAITRE_APP: 'Maître d\'apprentissage',
      RESP_PLATEFORME: 'Responsable plateforme',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      ALTERNANT: 'bg-purple-100 text-purple-800',
      ETUDIANT: 'bg-blue-100 text-blue-800',
      TUTEUR: 'bg-green-100 text-green-800',
      MAITRE_APP: 'bg-orange-100 text-orange-800',
      RESP_PLATEFORME: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!userClass) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ma Classe</h1>
          <p className="text-gray-600">Vous n'êtes assigné à aucune classe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ma Classe</h1>
        <p className="text-gray-600">
          Découvrez les membres de votre classe et vos encadrants
        </p>
      </div>

      {/* Class Info */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {userClass.name}
            </h2>
            {userClass.description && (
              <p className="text-gray-600 mb-4">{userClass.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {classMembers.length} membres
              </div>
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                {instructors.length} encadrant(s)
              </div>
            </div>
          </div>
          <Button variant="outline">
            Contacter la classe
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructors */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Encadrants ({instructors.length})
          </h3>
          <div className="space-y-4">
            {instructors.map(instructor => (
              <div key={instructor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {instructor.firstName} {instructor.lastName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(instructor.role)}`}>
                        {getRoleLabel(instructor.role)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <EnvelopeIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Students */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Étudiants ({students.length})
          </h3>
          <div className="space-y-3">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(student.role)}`}>
                      {getRoleLabel(student.role)}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <EnvelopeIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Class Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statistiques de la classe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.role === 'ETUDIANT').length}
            </div>
            <div className="text-sm text-gray-600">Étudiants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {students.filter(s => s.role === 'ALTERNANT').length}
            </div>
            <div className="text-sm text-gray-600">Alternants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {instructors.filter(i => i.role === 'TUTEUR').length}
            </div>
            <div className="text-sm text-gray-600">Tuteurs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {instructors.filter(i => i.role === 'MAITRE_APP').length}
            </div>
            <div className="text-sm text-gray-600">Maîtres d'apprentissage</div>
          </div>
        </div>
      </Card>
    </div>
  );
};