import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis l'assistant EquiLibre, votre guide pour naviguer sur la plateforme. Je peux vous aider à comprendre comment utiliser les différentes fonctionnalités, répondre à vos questions sur les exigences, les fichiers, les messages et bien plus encore. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeMessage = async (fullText: string, messageIndex: number) => {
    let currentText = '';
    const words = fullText.split(' ');

    for (let i = 0; i < words.length; i++) {
      // Ajouter le mot avec un espace
      currentText += (i > 0 ? ' ' : '') + words[i];

      // Mettre à jour le message avec le texte actuel
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: currentText,
          isTyping: true,
        };
        return newMessages;
      });

      // Délai variable pour un effet plus naturel (entre 30ms et 80ms par mot)
      const delay = Math.random() * 50 + 30;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Marquer le message comme terminé
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        isTyping: false,
      };
      return newMessages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Appel à l'API backend qui fait le proxy vers Ollama
      const response = await fetch('http://localhost:5001/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant');
      }

      const data = await response.json();
      const fullResponse = data.message || data.response || "Désolé, je n'ai pas pu générer une réponse.";

      // Créer un message vide pour l'assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Démarrer l'effet de typing
      const messageIndex = messages.length + 1; // +1 car on a ajouté le message utilisateur
      await typeMessage(fullResponse, messageIndex);

    } catch (error) {
      console.error('Erreur assistant:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés pour répondre. Veuillez réessayer dans quelques instants ou vérifier que le service Ollama est bien démarré (localhost:11434).",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const exampleQuestions = [
    "Comment soumettre une exigence ?",
    "Comment envoyer un message à mon tuteur ?",
    "Où puis-je voir mon calendrier ?",
    "Comment télécharger mes fichiers ?",
  ];

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">My Assistant</h1>
            <p className="text-sm text-gray-500">
              Votre assistant personnel pour EquiLibre
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Questions fréquentes :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  message.role === 'user' ? 'ml-3' : 'mr-3'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                  {message.isTyping && (
                    <span className="inline-block w-0.5 h-4 bg-blue-600 ml-1 animate-pulse" />
                  )}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          L'assistant utilise l'IA pour vous aider. Les réponses sont générées automatiquement.
        </p>
      </div>
    </div>
  );
};
