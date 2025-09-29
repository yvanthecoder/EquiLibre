import React, { useState } from 'react';
import { useThreads, useMessages, useSendMessage } from '../hooks/useMessages';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Messages: React.FC = () => {
  const { data: threads, isLoading: threadsLoading } = useThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedThreadId || '');
  const sendMessage = useSendMessage();

  const selectedThread = threads?.find(t => t.id === selectedThreadId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedThreadId) {
      sendMessage.mutate(
        { threadId: selectedThreadId, content: newMessage.trim() },
        {
          onSuccess: () => {
            setNewMessage('');
          },
        }
      );
    }
  };

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">
          Communiquez avec vos enseignants et camarades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Threads List */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <Button size="sm">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Nouveau
              </Button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {threads?.length ? (
              <div className="divide-y divide-gray-200">
                {threads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedThreadId === thread.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{thread.title}</h3>
                      {thread.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2">
                          {format(new Date(thread.updatedAt), 'dd/MM', { locale: fr })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {thread.participants.length} participant(s)
                    </div>
                    
                    {thread.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {thread.lastMessage.sender.firstName}: {thread.lastMessage.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune conversation</p>
              </div>
            )}
          </div>
        </Card>

        {/* Messages */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="h-full flex flex-col">
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{selectedThread.title}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {selectedThread.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : messages?.length ? (
                  messages.map(message => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {message.sender.firstName[0]}{message.sender.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-gray-900">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun message dans cette conversation</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    isLoading={sendMessage.isPending}
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-600">
                  Choisissez une conversation dans la liste pour commencer à échanger
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};