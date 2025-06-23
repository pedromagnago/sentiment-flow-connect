
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, MessageSquare, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactBulkUpdateActionsProps {
  selectedContactIds: string[];
  onBulkUpdateStatus: (contactIds: string[], status: boolean) => Promise<void>;
  onBulkUpdateFeedback: (contactIds: string[], feedback: boolean) => Promise<void>;
  onBulkUpdateIsGroup: (contactIds: string[], isGroup: boolean) => Promise<void>;
  disabled?: boolean;
}

export const ContactBulkUpdateActions = ({
  selectedContactIds,
  onBulkUpdateStatus,
  onBulkUpdateFeedback,
  onBulkUpdateIsGroup,
  disabled = false
}: ContactBulkUpdateActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusValue, setStatusValue] = useState(true);
  const [feedbackValue, setFeedbackValue] = useState(true);
  const [isGroupValue, setIsGroupValue] = useState(false);
  const { toast } = useToast();

  const handleBulkUpdateStatus = async () => {
    if (selectedContactIds.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkUpdateStatus(selectedContactIds, statusValue);
      toast({
        title: "Status atualizado",
        description: `${selectedContactIds.length} contato(s) foram ${statusValue ? 'ativados' : 'desativados'}.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status dos contatos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdateFeedback = async () => {
    if (selectedContactIds.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkUpdateFeedback(selectedContactIds, feedbackValue);
      toast({
        title: "Feedback atualizado",
        description: `Feedback ${feedbackValue ? 'ativado' : 'desativado'} para ${selectedContactIds.length} contato(s).`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar feedback dos contatos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdateIsGroup = async () => {
    if (selectedContactIds.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkUpdateIsGroup(selectedContactIds, isGroupValue);
      toast({
        title: "Tipo atualizado",
        description: `${selectedContactIds.length} contato(s) marcados como ${isGroupValue ? 'grupo' : 'individual'}.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tipo dos contatos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedContactIds.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
          disabled={disabled}
        >
          <Settings className="w-4 h-4" />
          <span>Atualizar ({selectedContactIds.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Contatos em Massa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            {selectedContactIds.length} contato(s) selecionado(s)
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Status do Contato</p>
                  <p className="text-sm text-gray-500">Ativar ou desativar contatos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={statusValue} 
                  onCheckedChange={setStatusValue}
                />
                <Button
                  onClick={handleBulkUpdateStatus}
                  disabled={isProcessing}
                  size="sm"
                >
                  {statusValue ? 'Ativar' : 'Desativar'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Feedback</p>
                  <p className="text-sm text-gray-500">Ativar ou desativar feedback</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={feedbackValue} 
                  onCheckedChange={setFeedbackValue}
                />
                <Button
                  onClick={handleBulkUpdateFeedback}
                  disabled={isProcessing}
                  size="sm"
                >
                  {feedbackValue ? 'Ativar' : 'Desativar'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Tipo de Contato</p>
                  <p className="text-sm text-gray-500">Definir como grupo ou individual</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isGroupValue} 
                  onCheckedChange={setIsGroupValue}
                />
                <Button
                  onClick={handleBulkUpdateIsGroup}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isGroupValue ? 'Grupo' : 'Individual'}
                </Button>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Processando atualizações...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
