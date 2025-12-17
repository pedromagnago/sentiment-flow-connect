import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Paperclip, Upload, FileText, Image, X, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentUploaderProps {
  transactionId: string;
  companyId: string;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  transactionId,
  companyId,
  currentUrl,
  onUploadComplete,
  disabled = false,
  className
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 10MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não permitido',
        description: 'Use: JPG, PNG, PDF, Excel ou CSV',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transaction_id', transactionId);
      formData.append('company_id', companyId);
      formData.append('type', 'comprovante');

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://insncccrxgsvaxxkzjws.supabase.co/functions/v1/upload-attachment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      toast({
        title: 'Anexo enviado',
        description: file.name
      });

      onUploadComplete(result.attachment_url);
      setOpen(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (url?: string | null) => {
    if (!url) return Paperclip;
    if (url.includes('.pdf')) return FileText;
    if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return Image;
    return FileText;
  };

  const FileIcon = getFileIcon(currentUrl);

  if (currentUrl) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 px-2 text-green-600', className)}
                onClick={() => window.open(currentUrl, '_blank')}
                disabled={disabled}
              >
                <FileIcon className="h-4 w-4" />
              </Button>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Substituir anexo</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.xls,.xlsx,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar arquivo
                        </>
                      )}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => window.open(currentUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver anexo atual
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Anexo vinculado - clique para visualizar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 px-2 text-muted-foreground hover:text-foreground', className)}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Anexar comprovante</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, PDF, Excel ou CSV (máx. 10MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.xls,.xlsx,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar arquivo
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AttachmentUploader;
