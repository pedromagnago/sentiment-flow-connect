
import React, { useState } from 'react';
import { FileText, Download, Calendar, Users, Building2 } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { generateContactsPDF, generateCompaniesPDF, downloadPDF } from '@/utils/pdfGenerator';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';
import { Breadcrumb } from '../common/Breadcrumb';

export const ReportsPage = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies();

  const handleGenerateContactsReport = async () => {
    try {
      setGenerating('contacts');
      const doc = generateContactsPDF(contacts);
      downloadPDF(doc, 'relatorio_contatos');
    } catch (error) {
      console.error('Erro ao gerar relatório de contatos:', error);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateCompaniesReport = async () => {
    try {
      setGenerating('companies');
      const doc = generateCompaniesPDF(companies);
      downloadPDF(doc, 'relatorio_empresas');
    } catch (error) {
      console.error('Erro ao gerar relatório de empresas:', error);
    } finally {
      setGenerating(null);
    }
  };

  const breadcrumbItems = [
    { label: 'Relatórios', active: true }
  ];

  if (contactsLoading || companiesLoading) {
    return <LoadingSpinner message="Carregando dados para relatórios..." />;
  }

  if (contactsError || companiesError) {
    return <ErrorState message={contactsError || companiesError || ''} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Gere relatórios detalhados dos seus dados</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg">
          <FileText className="w-4 h-4 inline mr-2" />
          <span className="text-sm font-medium">Sistema de Relatórios</span>
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relatório de Contatos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Contatos</h3>
              <p className="text-sm text-gray-500">Lista completa com estatísticas</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de contatos:</span>
              <span className="font-medium">{contacts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contatos ativos:</span>
              <span className="font-medium">{contacts.filter(c => c.status).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Grupos:</span>
              <span className="font-medium">{contacts.filter(c => c.is_group).length}</span>
            </div>
          </div>

          <button
            onClick={handleGenerateContactsReport}
            disabled={generating === 'contacts'}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating === 'contacts' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Gerar Relatório PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Relatório de Empresas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Empresas</h3>
              <p className="text-sm text-gray-500">Dados completos e métricas financeiras</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de empresas:</span>
              <span className="font-medium">{companies.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Empresas ativas:</span>
              <span className="font-medium">{companies.filter(c => c.status === 'Ativa').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Receita mensal:</span>
              <span className="font-medium">
                R$ {companies.reduce((sum, c) => sum + (Number(c.valor_mensalidade) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerateCompaniesReport}
            disabled={generating === 'companies'}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating === 'companies' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Gerar Relatório PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sobre os Relatórios</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Os relatórios são gerados em tempo real com os dados mais atuais</li>
              <li>• Incluem estatísticas detalhadas e análises dos dados</li>
              <li>• Formato PDF otimizado para impressão e compartilhamento</li>
              <li>• Data de geração incluída em cada relatório</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
