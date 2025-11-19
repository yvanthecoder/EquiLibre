import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageService } from '../services/api.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface MessageType {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender_firstname: string;
  sender_lastname: string;
  sender_email: string;
  sender_avatar: string | null;
  sender_role: string;
}

interface ConversationType {
  id: number;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants: Array<{
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    profile_picture: string | null;
    role: string;
  }>;
}

export const MessageThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchConversationAndMessages();
      markAsRead();

      // Auto-refresh messages every 5 seconds for near real-time updates
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversationAndMessages = async () => {
    try {
      setLoading(true);
      const [conversationData, messagesData] = await Promise.all([
        messageService.getConversationInfo(id!),
        messageService.getConversationMessages(id!)
      ]);
      setConversation(conversationData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Impossible de charger la conversation');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const messagesData = await messageService.getConversationMessages(id!);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await messageService.markConversationAsRead(id!);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await messageService.sendMessage(parseInt(id!), newMessage.trim());
      setNewMessage('');
      // Fetch updated messages immediately
      await fetchMessages();
      // Mark as read after sending
      await markAsRead();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Conversation non trouvée</p>
        <Link to="/messages" className="text-blue-600 hover:text-blue-800">
          Retour aux messages
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <Link
          to="/messages"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>

        <Card>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {conversation.participants.length === 1
                ? `${conversation.participants[0].firstname} ${conversation.participants[0].lastname}`
                : `Conversation avec ${conversation.participants.length} personne(s)`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {conversation.participants.map((p) => `${p.firstname} ${p.lastname}`).join(', ')}
            </p>
          </div>
        </Card>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === parseInt(user?.id || '0');

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className={`text-xs font-medium mb-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.sender_firstname} {message.sender_lastname}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucun message pour le moment. Soyez le premier à écrire !
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Message Input */}
      <Card>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};
