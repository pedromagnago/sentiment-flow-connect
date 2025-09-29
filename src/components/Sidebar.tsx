
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  Settings as SettingsIcon, 
  TrendingUp,
  Home,
  Building2,
  ClipboardCheck,
  FileText,
  Shield,
  CreditCard,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ListTodo,
  UserCircle,
  Wallet,
  Receipt,
  FileStack,
  Sparkles,
  Lightbulb,
  FileSearch,
  FolderKanban
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para controlar expansão das seções
  const [whatsappExpanded, setWhatsappExpanded] = useState(false);
  const [financialExpanded, setFinancialExpanded] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  // Detectar seções ativas
  const isWhatsAppActive = location.pathname.startsWith('/whatsapp');
  const isFinancialActive = location.pathname.startsWith('/payables') || 
                            location.pathname.startsWith('/invoices') ||
                            activeSection === 'reconciliation';
  const isTasksActive = location.pathname.startsWith('/tasks') ||
                        activeSection === 'tasks' ||
                        activeSection === 'task-approvals';
  const isAIActive = location.pathname.startsWith('/suggested-actions') ||
                     location.pathname.startsWith('/reports') ||
                     location.pathname.startsWith('/analysis');

  // Auto-expansão inteligente
  useEffect(() => {
    setWhatsappExpanded(isWhatsAppActive);
    setFinancialExpanded(isFinancialActive);
    setTasksExpanded(isTasksActive);
    setAiExpanded(isAIActive);
  }, [location.pathname, activeSection, isWhatsAppActive, isFinancialActive, isTasksActive, isAIActive]);

  // Menu items do Core
  const coreMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'dashboard' },
    { id: 'sentiment', label: 'Análise de Sentimentos', icon: TrendingUp, section: 'sentiment' },
    { id: 'contacts', label: 'Contatos', icon: Users, section: 'contacts' },
    { id: 'companies', label: 'Empresas', icon: Building2, section: 'companies' },
  ];

  // Submenu Gestão Financeira
  const financialSubmenu = [
    { id: 'payables', label: 'Contas a Pagar', icon: Receipt, path: '/payables' },
    { id: 'invoices', label: 'Faturamento', icon: FileStack, path: '/invoices' },
    { id: 'reconciliation', label: 'Reconciliação (OFX)', icon: CreditCard, section: 'reconciliation' },
  ];

  // Submenu Tarefas
  const tasksSubmenu = [
    { id: 'internal-tasks', label: 'Tarefas Internas', icon: FolderKanban, path: '/tasks' },
    { id: 'clickup-tasks', label: 'Tarefas ClickUp', icon: CheckSquare, section: 'tasks' },
    { id: 'task-approvals', label: 'Aprovação de Tarefas', icon: ClipboardCheck, section: 'task-approvals' },
  ];

  // Submenu IA & Análise
  const aiSubmenu = [
    { id: 'suggested-actions', label: 'Ações Sugeridas', icon: Lightbulb, path: '/suggested-actions' },
    { id: 'reports', label: 'Relatórios de IA', icon: BarChart3, path: '/reports' },
    { id: 'document-analysis', label: 'Análise de Documentos', icon: FileSearch, path: '/analysis' },
  ];

  // Submenu WhatsApp
  const whatsappSubmenu = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/whatsapp/chats' },
    { id: 'fila', label: 'Fila', icon: ListTodo, path: '/whatsapp/fila' },
    { id: 'contatos', label: 'Contatos', icon: UserCircle, path: '/whatsapp/contatos' },
  ];

  // Menu items finais
  const bottomMenuItems = [
    { id: 'audit-logs', label: 'Logs de Auditoria', icon: Shield, section: 'audit-logs' },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, section: 'settings' },
  ];

  // Handler de navegação híbrida
  const handleMenuClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.section) {
      setActiveSection(item.section);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-10 flex flex-col">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FullBPO</h1>
            <p className="text-sm text-gray-500">Analytics Platform</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-6">
        <nav className="space-y-2 pb-6">
          {/* Core Menu Items */}
          {coreMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.section
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* Gestão Financeira Section */}
          <div className="space-y-1 mt-4">
            <button
              onClick={() => setFinancialExpanded(!financialExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isFinancialActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Gestão Financeira</span>
              </div>
              {financialExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {financialExpanded && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {financialSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path ? location.pathname === item.path : activeSection === item.section;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tarefas Section */}
          <div className="space-y-1">
            <button
              onClick={() => setTasksExpanded(!tasksExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isTasksActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FolderKanban className="w-5 h-5" />
                <span className="font-medium">Tarefas</span>
              </div>
              {tasksExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {tasksExpanded && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {tasksSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path ? location.pathname === item.path : activeSection === item.section;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* IA & Análise Section */}
          <div className="space-y-1">
            <button
              onClick={() => setAiExpanded(!aiExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isAIActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">IA & Análise</span>
              </div>
              {aiExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {aiExpanded && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {aiSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* WhatsApp Section */}
          <div className="space-y-1">
            <button
              onClick={() => setWhatsappExpanded(!whatsappExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isWhatsAppActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
              </div>
              {whatsappExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {whatsappExpanded && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {whatsappSubmenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Menu Items */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.section
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};
