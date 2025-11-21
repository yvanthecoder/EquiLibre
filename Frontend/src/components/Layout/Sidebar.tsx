import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Profil', href: '/profile', icon: UserIcon },
  { name: 'Ma Classe', href: '/class', icon: UserGroupIcon },
  { name: 'Exigences', href: '/requirements', icon: DocumentTextIcon },
  { name: 'Mes Fichiers', href: '/files', icon: FolderIcon },
  { name: 'Calendrier', href: '/calendar', icon: CalendarIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
];

const adminNavigation = [
  { name: 'Gestion Calendrier', href: '/admin/calendar', icon: CalendarIcon },
  { name: 'Gestion Utilisateurs', href: '/admin/users', icon: UserIcon },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';
  const isMaitre = user?.role === 'MAITRE_APP';

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">
          StudyPlatform
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation
          .filter((item) => {
            if (isAdmin && (item.name === 'Ma Classe' || item.name === 'Exigences')) {
              return false;
            }
            if (isMaitre && (item.name === 'Ma Classe' || item.name === 'Exigences' || item.name === 'Mes Fichiers')) {
              return false;
            }
            return true;
          })
          .map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === '/class' && location.pathname.startsWith('/class/'));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

        {isAdmin && (
          <>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Administration
              </p>
            </div>
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
