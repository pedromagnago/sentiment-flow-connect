
import React, { useState, useRef } from 'react';
import { ContactBulkActions } from './ContactBulkActions';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/hooks/useContacts';
import * as XLSX from 'xlsx';

interface ContactBulkOperationsProps {
  contacts: Contact[];
  onBulkCreate: (contactsData: Partial<Contact>[]) => Promise<void>;
  onBulkDelete: (contactIds: string[]) => Promise<void>;
}

export const ContactBulkOperations = ({
  contacts,
  onBulkCreate,
  onBulkDelete
}: ContactBulkOperationsProps) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id_contact));
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        nome: 'João Silva',
        id_contact: '5511999999999',
        status: true,
        feedback: true,
        is_group: false,
        empresa_id: ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contatos');
    XLSX.writeFile(wb, 'template_contatos.xlsx');

    toast({
      title: "Template baixado",
      description: "O template foi baixado com sucesso.",
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const contactsData = jsonData.map((row: any) => ({
        nome: row.nome || '',
        id_contact: row.id_contact || '',
        status: row.status === true || row.status === 'true' || row.status === 1,
        feedback: row.feedback === true || row.feedback === 'true' || row.feedback === 1,
        is_group: row.is_group === true || row.is_group === 'true' || row.is_group === 1,
        empresa_id: row.empresa_id || ''
      }));

      await onBulkCreate(contactsData);
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    if (contacts.length === 0) {
      toast({
        title: "Nenhum contato",
        description: "Não há contatos para exportar.",
        variant: "destructive",
      });
      return;
    }

    const exportData = contacts.map(contact => ({
      nome: contact.nome,
      id_contact: contact.id_contact,
      status: contact.status,
      feedback: contact.feedback,
      is_group: contact.is_group,
      empresa_id: contact.empresa_id,
      data_criacao: contact.data_criacao
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contatos');
    XLSX.writeFile(wb, `contatos_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${contacts.length} contatos foram exportados.`,
    });
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir PERMANENTEMENTE ${selectedContacts.length} contato(s)? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await onBulkDelete(selectedContacts);
      setSelectedContacts([]);
      toast({
        title: "Contatos excluídos",
        description: `${selectedContacts.length} contato(s) foram excluídos permanentemente.`,
      });
    } catch (error) {
      console.error('Erro na exclusão em massa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir contatos em massa.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Operações em Massa
        </h3>
        <ContactBulkActions
          selectedCount={selectedContacts.length}
          onBulkDelete={handleBulkDelete}
          onImport={handleImport}
          onExport={handleExport}
          onDownloadTemplate={handleDownloadTemplate}
          disabled={isProcessing}
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
      />

      {contacts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedContacts.length === contacts.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              Selecionar todos os contatos ({contacts.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id_contact}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id_contact)}
                  onChange={() => handleSelectContact(contact.id_contact)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {contact.nome || 'Nome não informado'}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {contact.id_contact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Processando operação...</p>
        </div>
      )}
    </div>
  );
};
