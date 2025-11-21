import React from 'react';
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const { data: notifications } = useNotifications();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {/* Page title will be set by individual pages */}
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
            onClick={() => {
              localStorage.setItem('open_notifications', 'true');
              navigate('/profile');
            }}
            title="Notifications"
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
            title="Se déconnecter"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
