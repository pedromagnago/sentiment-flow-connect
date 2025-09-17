
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Trash2, Plus, AlertCircle, Settings, Activity, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Company } from '@/hooks/useCompanies';

interface BulkOperationsProps {
  onBulkCreate: (companies: Partial<Company>[]) => Promise<void>;
  onBulkDelete: (companyIds: string[]) => Promise<void>;
  onBulkUpdateStatus: (companyIds: string[], status: string) => Promise<void>;
  onBulkUpdateN8n: (companyIds: string[], active: boolean) => Promise<void>;
  onBulkUpdateFeedback: (companyIds: string[], feedback: boolean) => Promise<void>;
  companies: Company[];
  loading?: boolean;
}

export const BulkOperations = ({ onBulkCreate, onBulkDelete, onBulkUpdateStatus, onBulkUpdateN8n, onBulkUpdateFeedback, companies, loading = false }: BulkOperationsProps) => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingN8n, setUpdatingN8n] = useState(false);
  const [updatingFeedback, setUpdatingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const excelTemplate = {
    'Nome da Empresa': '',
    'CNPJ': '',
    'Segmento': '',
    'Status': 'Ativo',
    'Endereço': '',
    'Nome do Contato': '',
    'Email do Contato': '',
    'Whatsapp do Contato': '',
    'Cargo': '',
    'CPF do Representante': '',
    'Nome do Representante': '',
    'Email do Representante': '',
    'Nome da Testemunha': '',
    'Email da Testemunha': '',
    'Tipo de Contrato': '',
    'Fonte do Lead': '',
    'Valor da Mensalidade': '',
    'Desconto %': '',
    'Prazo do Desconto': '',
    'Atividade': '',
    'Task ID': '',
    'Task Name': '',
    'Assignee': '',
    'Priority': '',
    'Task Status': '',
    'Client ID': '',
    'Companies ID': '',
    'Envelope ID': ''
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([excelTemplate]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Adicionar instruções em uma segunda aba
    const instructions = [
      { Campo: 'Nome da Empresa', Descrição: 'Nome completo da empresa (obrigatório)', Exemplo: 'Empresa ABC Ltda' },
      { Campo: 'CNPJ', Descrição: 'CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)', Exemplo: '12.345.678/0001-90' },
      { Campo: 'Status', Descrição: 'Status da empresa (Ativo/Inativo)', Exemplo: 'Ativo' },
      { Campo: 'Segmento', Descrição: 'Segmento de atuação da empresa', Exemplo: 'Tecnologia' },
      { Campo: 'Valor da Mensalidade', Descrição: 'Valor numérico da mensalidade', Exemplo: '1500.00' },
      { Campo: 'Desconto %', Descrição: 'Percentual de desconto (0-100)', Exemplo: '10' },
      { Campo: 'Priority', Descrição: 'Prioridade (Alta/Média/Baixa)', Exemplo: 'Alta' }
    ];
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');
    
    XLSX.writeFile(wb, 'template_empresas.xlsx');
    
    toast({
      title: "Template baixado",
      description: "O template Excel foi baixado com sucesso.",
    });
  };

  const mapExcelDataToCompany = (row: any): Partial<Company> => {
    return {
      nome: row['Nome da Empresa'] || '',
      cnpj: row['CNPJ'] || '',
      segmento: row['Segmento'] || '',
      status: row['Status'] || 'Ativo',
      endereco: row['Endereço'] || '',
      nome_contato: row['Nome do Contato'] || '',
      email_contato: row['Email do Contato'] || '',
      whatsapp_contato: row['Whatsapp do Contato'] || '',
      cargo: row['Cargo'] || '',
      cpf_representante: row['CPF do Representante'] || '',
      nome_representante: row['Nome do Representante'] || '',
      email_representante: row['Email do Representante'] || '',
      nome_testemunha: row['Nome da Testemunha'] || '',
      email_testemunha: row['Email da Testemunha'] || '',
      tipo_contrato: row['Tipo de Contrato'] || '',
      fonte_lead: row['Fonte do Lead'] || '',
      valor_mensalidade: row['Valor da Mensalidade'] ? parseFloat(row['Valor da Mensalidade']) : null,
      desconto_percentual: row['Desconto %'] ? parseFloat(row['Desconto %']) : null,
      prazo_desconto: row['Prazo do Desconto'] ? parseInt(row['Prazo do Desconto']) : null,
      atividade: row['Atividade'] || '',
      task_id: row['Task ID'] || '',
      task_name: row['Task Name'] || '',
      assignee: row['Assignee'] || '',
      priority: row['Priority'] || '',
      task_status: row['Task Status'] || '',
      client_id: row['Client ID'] || '',
      companies_id: row['Companies ID'] || '',
      envelope_id: row['Envelope ID'] || '',
      aceitar_politica_privacidade: false,
      clickup_integration_status: 'Inativo',
      omie_integration_status: 'Inativo'
    };
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('O arquivo Excel está vazio');
      }

      // Validar dados obrigatórios
      const invalidRows: number[] = [];
      const validData = jsonData.map((row: any, index: number) => {
        if (!row['Nome da Empresa']) {
          invalidRows.push(index + 2); // +2 porque Excel começa em 1 e tem header
        }
        return mapExcelDataToCompany(row);
      });

      if (invalidRows.length > 0) {
        throw new Error(`Linhas com dados inválidos: ${invalidRows.join(', ')}. Nome da Empresa é obrigatório.`);
      }

      await onBulkCreate(validData);
      
      toast({
        title: "Importação concluída",
        description: `${validData.length} empresas foram importadas com sucesso.`,
      });

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro ao processar arquivo Excel",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    
    try {
      const exportData = companies.map(company => ({
        'Nome da Empresa': company.nome || '',
        'CNPJ': company.cnpj || '',
        'Segmento': company.segmento || '',
        'Status': company.status || '',
        'Endereço': company.endereco || '',
        'Nome do Contato': company.nome_contato || '',
        'Email do Contato': company.email_contato || '',
        'Whatsapp do Contato': company.whatsapp_contato || '',
        'Cargo': company.cargo || '',
        'CPF do Representante': company.cpf_representante || '',
        'Nome do Representante': company.nome_representante || '',
        'Email do Representante': company.email_representante || '',
        'Nome da Testemunha': company.nome_testemunha || '',
        'Email da Testemunha': company.email_testemunha || '',
        'Tipo de Contrato': company.tipo_contrato || '',
        'Fonte do Lead': company.fonte_lead || '',
        'Valor da Mensalidade': company.valor_mensalidade || '',
        'Desconto %': company.desconto_percentual || '',
        'Prazo do Desconto': company.prazo_desconto || '',
        'Atividade': company.atividade || '',
        'Task ID': company.task_id || '',
        'Task Name': company.task_name || '',
        'Assignee': company.assignee || '',
        'Priority': company.priority || '',
        'Task Status': company.task_status || '',
        'Client ID': company.client_id || '',
        'Companies ID': company.companies_id || '',
        'Envelope ID': company.envelope_id || '',
        'Data de Cadastro': company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
      
      const fileName = `empresas_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Exportação concluída",
        description: `${companies.length} empresas foram exportadas para ${fileName}`,
      });
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Erro ao gerar arquivo Excel",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Nenhuma empresa selecionada",
        description: "Selecione pelo menos uma empresa para excluir.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedCompanies.length} empresa(s) selecionada(s)? Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      try {
        await onBulkDelete(selectedCompanies);
        setSelectedCompanies([]);
        toast({
          title: "Empresas excluídas",
          description: `${selectedCompanies.length} empresa(s) foram excluídas com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro na exclusão",
          description: "Erro ao excluir empresas selecionadas.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Nenhuma empresa selecionada",
        description: "Selecione pelo menos uma empresa para alterar o status.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingStatus(true);
    
    try {
      await onBulkUpdateStatus(selectedCompanies, newStatus);
      toast({
        title: "Status atualizado",
        description: `Status de ${selectedCompanies.length} empresa(s) alterado para ${newStatus}.`,
      });
      setSelectedCompanies([]);
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Erro ao atualizar status das empresas selecionadas.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBulkN8nUpdate = async (active: boolean) => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Nenhuma empresa selecionada",
        description: "Selecione pelo menos uma empresa para alterar a integração N8n.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingN8n(true);
    
    try {
      await onBulkUpdateN8n(selectedCompanies, active);
      toast({
        title: "Integração N8n atualizada",
        description: `N8n ${active ? 'ativado' : 'desativado'} para ${selectedCompanies.length} empresa(s).`,
      });
      setSelectedCompanies([]);
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Erro ao atualizar integração N8n das empresas selecionadas.",
        variant: "destructive",
      });
    } finally {
      setUpdatingN8n(false);
    }
  };

  const handleBulkFeedbackUpdate = async (feedback: boolean) => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Nenhuma empresa selecionada",
        description: "Selecione pelo menos uma empresa para alterar o feedback.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingFeedback(true);
    
    try {
      await onBulkUpdateFeedback(selectedCompanies, feedback);
      toast({
        title: "Feedback atualizado",
        description: `Feedback ${feedback ? 'ativado' : 'desativado'} para ${selectedCompanies.length} empresa(s).`,
      });
      setSelectedCompanies([]);
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Erro ao atualizar feedback das empresas selecionadas.",
        variant: "destructive",
      });
    } finally {
      setUpdatingFeedback(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        Operações em Massa
        {(loading || importing || exporting || updatingStatus || updatingN8n || updatingFeedback) && (
          <span className="ml-2 text-sm text-blue-600 flex items-center">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
            Processando...
          </span>
        )}
      </h3>
      
      {/* Importação/Exportação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Baixar Template</span>
        </Button>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={importing}
          />
          <Button
            disabled={importing}
            className="w-full flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Importando...' : 'Importar Excel'}</span>
          </Button>
        </div>

        <Button
          onClick={exportToExcel}
          disabled={exporting || companies.length === 0}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Exportando...' : 'Exportar Excel'}</span>
        </Button>
      </div>

      {/* Seleção em massa */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCompanies.length === companies.length && companies.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCompanies(companies.map(c => c.id));
                  } else {
                    setSelectedCompanies([]);
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                Selecionar todas ({companies.length})
              </span>
            </label>
            
            {selectedCompanies.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                {selectedCompanies.length} empresa(s) selecionada(s)
              </span>
            )}
          </div>

          {selectedCompanies.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </Button>
            </div>
          )}
        </div>

        {/* Operações em massa para empresas selecionadas */}
        {selectedCompanies.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              Operações para {selectedCompanies.length} empresa(s) selecionada(s)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Alterar Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-blue-800">Alterar Status:</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleBulkStatusUpdate('Ativo')}
                    disabled={updatingStatus}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Ativar
                  </Button>
                  <Button
                    onClick={() => handleBulkStatusUpdate('Inativo')}
                    disabled={updatingStatus}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Desativar
                  </Button>
                </div>
              </div>

              {/* N8n Integration */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-blue-800">Integração N8n:</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleBulkN8nUpdate(true)}
                    disabled={updatingN8n}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Ativar
                  </Button>
                  <Button
                    onClick={() => handleBulkN8nUpdate(false)}
                    disabled={updatingN8n}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Desativar
                  </Button>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-blue-800">Feedback:</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleBulkFeedbackUpdate(true)}
                    disabled={updatingFeedback}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Ativar
                  </Button>
                  <Button
                    onClick={() => handleBulkFeedbackUpdate(false)}
                    disabled={updatingFeedback}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Desativar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de empresas para seleção */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {companies.map((company) => (
            <label key={company.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCompanies([...selectedCompanies, company.id]);
                  } else {
                    setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                  }
                }}
                className="rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {company.nome || 'Sem nome'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {company.cnpj || 'CNPJ não informado'} • {company.status || 'Status não definido'}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    company.n8n_integration_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    N8n: {company.n8n_integration_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    company.feedback_ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Feedback: {company.feedback_ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhuma empresa cadastrada para seleção.</p>
          </div>
        )}
      </div>
    </div>
  );
};
