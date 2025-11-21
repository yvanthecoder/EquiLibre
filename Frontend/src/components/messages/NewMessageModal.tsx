import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classService, messageService } from '../../services/api.service';
import { User } from '../../types/api';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import toast from 'react-hot-toast';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [classMembers, setClassMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchClasses();
      setSelectedUser(null);
      setSelectedClassId('');
      setClassMembers([]);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const data = await messageService.getAllUsers();
      console.log('Users fetched:', data);
      setUsers(data);
      if (data.length === 0) {
        toast.error('Aucun utilisateur disponible');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Impossible de charger les utilisateurs: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getMyClasses();
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes', err);
    }
  };

  const fetchClassMembers = async (classId: string) => {
    if (!classId) return;
    try {
      setLoadingClass(true);
      const members = await classService.getClassMembers(classId);
      setClassMembers(members || []);
    } catch (err) {
      console.error('Error fetching class members', err);
      toast.error('Impossible de charger les membres de la classe');
    } finally {
      setLoadingClass(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      setSending(true);

      if (selectedClassId && !selectedUser) {
        const ids = (classMembers || []).map((m) => parseInt(m.id));
        if (ids.length === 0) {
          toast.error('Aucun membre dans cette classe');
          return;
        }
        const conversation = await messageService.createConversation(ids);
        await messageService.sendMessage(conversation.id, message.trim());
        toast.success('Message envoyé au groupe classe');
        navigate(`/messages/${conversation.id}`);
        onClose();
        setMessage('');
        setSearchTerm('');
        setSelectedClassId('');
        setClassMembers([]);
        return;
      }

      if (!selectedUser || !message.trim()) {
        toast.error('Veuillez sélectionner un utilisateur ou une classe et écrire un message');
        return;
      }

      // Create or get conversation with this user
      const conversation = await messageService.createConversation([parseInt(selectedUser.id)]);

      // Send the message
      await messageService.sendMessage(conversation.id, message.trim());

      toast.success('Message envoyé avec succès');

      // Navigate to the conversation
      navigate(`/messages/${conversation.id}`);

      // Close modal and reset
      onClose();
      setSelectedUser(null);
      setMessage('');
      setSearchTerm('');
      setSelectedClassId('');
      setClassMembers([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = (selectedClassId ? classMembers : users).filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      ADMIN: 'bg-red-100 text-red-800',
      ALTERNANT: 'bg-blue-100 text-blue-800',
      ETUDIANT_CLASSIQUE: 'bg-green-100 text-green-800',
      MAITRE_APP: 'bg-purple-100 text-purple-800',
      TUTEUR_ECOLE: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      ADMIN: 'Admin',
      ALTERNANT: 'Alternant',
      ETUDIANT_CLASSIQUE: 'Étudiant',
      MAITRE_APP: 'Maître d\'apprentissage',
      TUTEUR_ECOLE: 'Tuteur',
    };
    return labels[role] || role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Nouveau Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4">
          {!selectedUser ? (
            <>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedUser(null);
                      setSearchTerm('');
                      if (e.target.value) {
                        fetchClassMembers(e.target.value);
                      } else {
                        setClassMembers([]);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Destinataire direct</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Classe : {cls.name}
                      </option>
                    ))}
                  </select>
                  {selectedClassId && (
                    <span className="text-xs text-gray-600">
                      {loadingClass ? 'Chargement...' : `${classMembers.length} membre(s)`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={selectedClassId ? 'Rechercher un membre de la classe...' : 'Rechercher un utilisateur...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* User List */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>

                          {/* User Info */}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </button>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected User & Message Form */}
              <div className="space-y-4">
                {/* Selected User Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Changer
                    </button>
                  </div>
                </Card>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setSelectedUser(null);
              setMessage('');
              setSearchTerm('');
            }}
            disabled={sending}
          >
            Annuler
          </Button>

          {selectedUser && (
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
            >
              {sending ? 'Envoi...' : 'Envoyer'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
