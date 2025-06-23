
import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactBulkUpdateActions } from './ContactBulkUpdateActions';

interface ContactBulkActionsProps {
  selectedCount: number;
  selectedContactIds: string[];
  onBulkDelete: () => void;
  onBulkUpdateStatus: (contactIds: string[], status: boolean) => Promise<void>;
  onBulkUpdateFeedback: (contactIds: string[], feedback: boolean) => Promise<void>;
  onBulkUpdateIsGroup: (contactIds: string[], isGroup: boolean) => Promise<void>;
  onImport: () => void;
  onExport: () => void;
  onDownloadTemplate: () => void;
  disabled?: boolean;
}

export const ContactBulkActions = ({
  selectedCount,
  selectedContactIds,
  onBulkDelete,
  onBulkUpdateStatus,
  onBulkUpdateFeedback,
  onBulkUpdateIsGroup,
  onImport,
  onExport,
  onDownloadTemplate,
  disabled = false
}: ContactBulkActionsProps) => {
  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      <Button
        onClick={onDownloadTemplate}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        disabled={disabled}
      >
        <Download className="w-4 h-4" />
        <span>Template</span>
      </Button>

      <Button
        onClick={onImport}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        disabled={disabled}
      >
        <Upload className="w-4 h-4" />
        <span>Importar</span>
      </Button>

      <Button
        onClick={onExport}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        disabled={disabled}
      >
        <Download className="w-4 h-4" />
        <span>Exportar</span>
      </Button>

      <ContactBulkUpdateActions
        selectedContactIds={selectedContactIds}
        onBulkUpdateStatus={onBulkUpdateStatus}
        onBulkUpdateFeedback={onBulkUpdateFeedback}
        onBulkUpdateIsGroup={onBulkUpdateIsGroup}
        disabled={disabled}
      />

      {selectedCount > 0 && (
        <Button
          onClick={onBulkDelete}
          variant="destructive"
          size="sm"
          className="flex items-center space-x-1"
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
          <span>Excluir ({selectedCount})</span>
        </Button>
      )}
    </div>
  );
};
