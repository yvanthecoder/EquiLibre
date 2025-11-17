import React, { useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*',
  maxSize = 10,
  disabled = false,
  label = 'Sélectionner un fichier',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Le fichier doit faire moins de ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {selectedFile ? selectedFile.name : label}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Taille maximale: {maxSize}MB
        </p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
