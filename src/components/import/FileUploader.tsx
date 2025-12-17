import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ERPConfig } from '@/hooks/useERPImport';

interface FileUploaderProps {
  selectedERP: ERPConfig;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function FileUploader({ selectedERP, file, onFileSelect, error }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = selectedERP.supportedFormats;
    
    if (!extension || !validExtensions.includes(extension)) {
      onFileSelect(null);
      return;
    }
    
    onFileSelect(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Upload do Arquivo</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Formatos aceitos: {selectedERP.supportedFormats.map(f => f.toUpperCase()).join(', ')}
        </p>
      </div>

      {!file ? (
        <Card
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/30 hover:border-primary/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className={cn(
              'p-4 rounded-full mb-4 transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}>
              <Upload className={cn(
                'h-8 w-8',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            
            <p className="text-foreground font-medium mb-1">
              Arraste e solte seu arquivo aqui
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              ou clique para selecionar
            </p>
            
            <input
              type="file"
              accept={selectedERP.supportedFormats.map(f => `.${f}`).join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Selecionar Arquivo
              </label>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFileSelect(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
