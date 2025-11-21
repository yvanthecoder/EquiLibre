import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import {
  FolderIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  usePersonalFiles,
  useClassFiles,
  useSharedFiles,
  useUploadFile,
  useDeleteFile,
} from '../hooks/useFiles';
import { useAuth } from '../hooks/useAuth';
import { classService, fileService } from '../services/api.service';
import { Modal } from '../components/UI/Modal';
import toast from 'react-hot-toast';

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const deriveCategory = (fileType: string, hasClass: boolean) => {
  if (hasClass) return 'class';
  if (fileType.includes('presentation')) return 'presentations';
  if (fileType.includes('zip') || fileType.includes('archive')) return 'projects';
  return 'documents';
};

export const Files: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeClassId, setActiveClassId] = useState<string | undefined>(user?.classId);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [sharedRole, setSharedRole] = useState<string>(user?.role || 'ALTERNANT');
  const [requiresSignature, setRequiresSignature] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const { files: personalFiles } = usePersonalFiles();
  const { files: classFiles } = useClassFiles(activeClassId);
  const { files: sharedFiles } = useSharedFiles();
  const { uploadFile, isUploading } = useUploadFile();
  const { deleteFile, isDeleting } = useDeleteFile();

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const cls = await classService.getMyClasses();
        setClasses(cls);
        if (!activeClassId && cls.length > 0) {
          setActiveClassId(cls[0].id);
        }
      } catch (err) {
        console.error('Impossible de charger les classes', err);
      }
    };
    loadClasses();
  }, [activeClassId]);

  const filesWithCategory = useMemo(() => {
    const combined = [
      ...(personalFiles || []).map((f: any) => ({
        ...f,
        _category: deriveCategory(f.fileType || '', false),
      })),
      ...(classFiles || []).map((f: any) => ({
        ...f,
        _category: deriveCategory(f.fileType || '', true),
      })),
      ...(sharedFiles || []).map((f: any) => ({
        ...f,
        _category: 'shared',
      })),
    ];
    return combined;
  }, [personalFiles, classFiles, sharedFiles]);

  const categories = useMemo(() => {
    const base = [
      { id: 'all', name: 'Tous les fichiers' },
      { id: 'projects', name: 'Projets' },
      { id: 'reports', name: 'Rapports' },
      { id: 'presentations', name: 'Présentations' },
      { id: 'documents', name: 'Documents' },
      { id: 'class', name: 'Fichiers de classe' },
      { id: 'shared', name: 'Partagés (rôle)' },
    ];
    return base.map((c) => ({
      ...c,
      count: c.id === 'all' ? filesWithCategory.length : filesWithCategory.filter((f) => f._category === c.id).length,
    }));
  }, [filesWithCategory]);

  const filteredFiles =
    selectedCategory === 'all'
      ? filesWithCategory
      : filesWithCategory.filter((file) => file._category === selectedCategory);

  const handleUploadClick = () => uploadInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (selectedCategory === 'class' && !activeClassId) {
      toast.error('Sélectionnez une classe avant de téléverser');
      e.target.value = '';
      return;
    }
    const isShared = selectedCategory === 'shared';
    uploadFile(
      {
        file: file as any,
        classId: selectedCategory === 'class' ? activeClassId : undefined,
        visibilityRole: isShared ? sharedRole : undefined,
        requiresSignature: isShared ? requiresSignature : false,
      } as any,
      {
        onSuccess: () => {
          toast.success('Fichier téléversé');
          e.target.value = '';
        },
        onError: () => {
          e.target.value = '';
        },
      }
    );
  };

  const handleDelete = (fileId: string) => {
    deleteFile(fileId, {
      onSuccess: () => toast.success('Fichier supprimé'),
    });
  };

  const handlePreview = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewName(fileName);
    } catch (err) {
      toast.error('Prévisualisation impossible, téléchargement…');
      handleDownload(fileId, fileName);
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    fileService
      .downloadFile(fileId)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Erreur lors du téléchargement'));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Fichiers</h1>
          <p className="text-gray-600">Gérez vos documents et fichiers personnels</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedCategory === 'class' && classes.length > 1 && (
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}
          {selectedCategory === 'shared' && (
            <>
              <select
                value={sharedRole}
                onChange={(e) => setSharedRole(e.target.value)}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="ALTERNANT">Alternants</option>
                <option value="ETUDIANT_CLASSIQUE">Étudiants</option>
                <option value="TUTEUR_ECOLE">Tuteurs</option>
                <option value="MAITRE_APP">Maîtres</option>
                <option value="ADMIN">Admins</option>
              </select>
              <label className="text-sm flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={requiresSignature}
                  onChange={(e) => setRequiresSignature(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Signature requise
              </label>
            </>
          )}
          <Button onClick={handleUploadClick} isLoading={isUploading}>
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Télécharger un fichier
          </Button>
          <input type="file" ref={uploadInputRef} className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h2>
          <nav className="space-y-2">
            {categories.map((category) => (
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

        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="space-y-3">
                {filteredFiles.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">📄</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.fileName || file.name}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 flex-wrap">
                      <span>{formatFileSize(file.fileSize || file.file_size || 0)}</span>
                      <span>v{file.version || 1}</span>
                      {file.visibilityRole && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          Rôle {file.visibilityRole}
                        </span>
                      )}
                      {file.requiresSignature && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Signature requise
                        </span>
                      )}
                      <span>
                        Ajouté le{' '}
                        {file.uploadedAt
                          ? format(new Date(file.uploadedAt), 'dd/MM/yyyy', { locale: fr })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.requiresSignature && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fileService
                          .signFile(file.id.toString())
                          .then(() => {
                            toast.success('Signé');
                          })
                          .catch(() => toast.error('Erreur signature'))
                      }
                    >
                      Signer
                    </Button>
                  )}
                  {file.visibilityRole && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        uploadFile(
                          {
                            file: file as any,
                            visibilityRole: file.visibilityRole,
                            requiresSignature: file.requiresSignature,
                            parentFileId: file.id,
                            version: (file.version || 1) + 1,
                          } as any,
                          { onSuccess: () => toast.success('Nouvelle version envoyée') }
                        )
                      }
                    >
                      Nouvelle version
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handlePreview(file.id.toString(), file.fileName || file.name)}>
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(file.id.toString(), file.fileName || file.name)}>
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(file.id.toString())}
                        disabled={isDeleting}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fichier</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore téléchargé de fichiers dans cette catégorie.
                </p>
                <Button onClick={handleUploadClick}>
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Télécharger votre premier fichier
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!previewUrl}
        onClose={() => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
        title={previewName || 'Aperçu du fichier'}
        size="xl"
      >
        {previewUrl ? (
          <iframe src={previewUrl} className="w-full h-[70vh]" title="Aperçu" />
        ) : (
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        )}
      </Modal>
    </div>
  );
};
