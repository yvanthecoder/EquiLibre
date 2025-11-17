import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../services/api.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { NewMessageModal } from '../components/messages/NewMessageModal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_read_at: string;
  participants: Array<{
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    profile_picture: string | null;
    role: string;
  }>;
  last_message: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    sender_firstname: string;
    sender_lastname: string;
  } | null;
  unread_count: number;
}

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchConversations();

    // Auto-refresh every 10 seconds for near real-time updates
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants || [];
  };

  const getConversationTitle = (conversation: Conversation) => {
    const participants = getOtherParticipants(conversation);
    if (participants.length === 0) return 'Conversation';
    if (participants.length === 1) {
      return `${participants[0].firstname} ${participants[0].lastname}`;
    }
    return `${participants[0].firstname} ${participants[0].lastname} et ${participants.length - 1} autre(s)`;
  };

  const getInitials = (conversation: Conversation) => {
    const participants = getOtherParticipants(conversation);
    if (participants.length === 0) return '?';
    const first = participants[0];
    return `${first.firstname.charAt(0)}${first.lastname.charAt(0)}`;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr
      });
    } catch {
      return '';
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
          <p className="text-gray-600 mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsNewMessageModalOpen(true)}>
          <span className="mr-2">+</span>
          Nouveau message
        </Button>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune conversation
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez une nouvelle conversation en cliquant sur le bouton ci-dessus
          </p>
          <Button onClick={() => setIsNewMessageModalOpen(true)}>
            Démarrer une conversation
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {getInitials(conversation)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>

                    {conversation.last_message ? (
                      <p className={`text-sm truncate ${
                        conversation.unread_count > 0
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600'
                      }`}>
                        {conversation.last_message.sender_id === parseInt(user?.id || '0')
                          ? 'Vous: '
                          : `${conversation.last_message.sender_firstname}: `}
                        {conversation.last_message.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Aucun message
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {conversation.unread_count > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => {
          setIsNewMessageModalOpen(false);
          // Refresh conversations after modal closes
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
};
