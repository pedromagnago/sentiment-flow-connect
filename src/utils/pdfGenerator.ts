
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Contact } from '@/hooks/useContacts';
import { Company } from '@/hooks/useCompanies';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generateContactsPDF = (contacts: Contact[]) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Relatório de Contatos', 20, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Tabela de contatos
  const tableData = contacts.map(contact => [
    contact.id_contact,
    contact.nome || 'N/A',
    contact.status ? 'Ativo' : 'Inativo',
    contact.is_group ? 'Grupo' : 'Individual',
    contact.feedback ? 'Sim' : 'Não',
    new Date(contact.data_criacao).toLocaleDateString('pt-BR')
  ]);

  doc.autoTable({
    head: [['ID', 'Nome', 'Status', 'Tipo', 'Feedback', 'Data Criação']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });

  // Estatísticas
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.status).length;
  const groupContacts = contacts.filter(c => c.is_group).length;
  const feedbackEnabled = contacts.filter(c => c.feedback).length;

  const finalY = doc.lastAutoTable.finalY + 20;
  
  doc.setFontSize(12);
  doc.text('Estatísticas:', 20, finalY);
  doc.setFontSize(10);
  doc.text(`Total de Contatos: ${totalContacts}`, 20, finalY + 10);
  doc.text(`Contatos Ativos: ${activeContacts}`, 20, finalY + 20);
  doc.text(`Grupos: ${groupContacts}`, 20, finalY + 30);
  doc.text(`Com Feedback: ${feedbackEnabled}`, 20, finalY + 40);

  return doc;
};

export const generateCompaniesPDF = (companies: Company[]) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Relatório de Empresas', 20, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Tabela de empresas
  const tableData = companies.map(company => [
    company.nome || 'N/A',
    company.cnpj || 'N/A',
    company.segmento || 'N/A',
    company.status || 'N/A',
    company.valor_mensalidade ? `R$ ${company.valor_mensalidade}` : 'N/A',
    company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : 'N/A'
  ]);

  doc.autoTable({
    head: [['Nome', 'CNPJ', 'Segmento', 'Status', 'Mensalidade', 'Data Cadastro']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
    },
  });

  // Estatísticas
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'Ativa').length;
  const totalRevenue = companies.reduce((sum, c) => sum + (Number(c.valor_mensalidade) || 0), 0);

  const finalY = doc.lastAutoTable.finalY + 20;
  
  doc.setFontSize(12);
  doc.text('Estatísticas:', 20, finalY);
  doc.setFontSize(10);
  doc.text(`Total de Empresas: ${totalCompanies}`, 20, finalY + 10);
  doc.text(`Empresas Ativas: ${activeCompanies}`, 20, finalY + 20);
  doc.text(`Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, finalY + 30);

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
