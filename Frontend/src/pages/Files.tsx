import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { 
  FolderIcon, 
  DocumentIcon, 
  CloudArrowUpIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock files data
const mockFiles = [
  {
    id: '1',
    name: 'Projet React - Todo App.zip',
    type: 'application/zip',
    size: 2048576, // 2MB
    uploadedAt: '2024-01-20T14:30:00Z',
    category: 'projects',
  },
  {
    id: '2',
    name: 'Rapport Stage S1.pdf',
    type: 'application/pdf',
    size: 1536000, // 1.5MB
    uploadedAt: '2024-01-18T10:15:00Z',
    category: 'reports',
  },
  {
    id: '3',
    name: 'Présentation Finale.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 5242880, // 5MB
    uploadedAt: '2024-01-15T16:45:00Z',
    category: 'presentations',
  },
  {
    id: '4',
    name: 'Code Review Notes.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512000, // 500KB
    uploadedAt: '2024-01-12T09:30:00Z',
    category: 'documents',
  },
];

export const Files: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [files] = useState(mockFiles);

  const categories = [
    { id: 'all', name: 'Tous les fichiers', count: files.length },
    { id: 'projects', name: 'Projets', count: files.filter(f => f.category === 'projects').length },
    { id: 'reports', name: 'Rapports', count: files.filter(f => f.category === 'reports').length },
    { id: 'presentations', name: 'Présentations', count: files.filter(f => f.category === 'presentations').length },
    { id: 'documents', name: 'Documents', count: files.filter(f => f.category === 'documents').length },
  ];

  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => file.category === selectedCategory);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('presentation')) return ' ';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    return '📄';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Fichiers</h1>
          <p className="text-gray-600">
            Gérez vos documents et fichiers personnels
          </p>
        </div>
        <Button>
          <CloudArrowUpIcon className="h-4 w-4 mr-2" />
          Télécharger un fichier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h2>
          <nav className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {category.name}
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Espace utilisé</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <p className="mt-1 text-xs">3.5 GB / 10 GB</p>
            </div>
          </div>
        </Card>

        {/* Files List */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="flex items-center space-x-2">
                <select className="text-sm border-gray-300 rounded-md">
                  <option>Trier par date</option>
                  <option>Trier par nom</option>
                  <option>Trier par taille</option>
                </select>
              </div>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="space-y-3">
                {filteredFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>
                            Ajouté le {format(new Date(file.uploadedAt), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun fichier
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore téléchargé de fichiers dans cette catégorie.
                </p>
                <Button>
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Télécharger votre premier fichier
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};