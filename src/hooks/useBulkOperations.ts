
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/hooks/useCompanies';
import * as XLSX from 'xlsx';

interface BulkOperationsHook {
  importing: boolean;
  exporting: boolean;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  selectAll: (items: Company[]) => void;
  clearSelection: () => void;
  downloadTemplate: () => void;
  exportToExcel: (companies: Company[]) => void;
  handleFileImport: (file: File, onBulkCreate: (companies: Partial<Company>[]) => Promise<void>) => Promise<void>;
}

export const useBulkOperations = (): BulkOperationsHook => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const selectAll = (items: Company[]) => {
    setSelectedItems(items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([excelTemplate]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Adicionar instruções
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

  const handleFileImport = async (
    file: File, 
    onBulkCreate: (companies: Partial<Company>[]) => Promise<void>
  ) => {
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
          invalidRows.push(index + 2);
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
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro ao processar arquivo Excel",
        variant: "destructive",
      });
      throw error;
    } finally {
      setImporting(false);
    }
  };

  const exportToExcel = (companies: Company[]) => {
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

  return {
    importing,
    exporting,
    selectedItems,
    setSelectedItems,
    selectAll,
    clearSelection,
    downloadTemplate,
    exportToExcel,
    handleFileImport
  };
};
