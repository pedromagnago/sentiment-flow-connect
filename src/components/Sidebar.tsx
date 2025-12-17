import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Settings as SettingsIcon, 
  Home,
  Building2,
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
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Shield,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { CompanyMultiSelect } from '@/components/layout/CompanyMultiSelect';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebarContext();
  
  // Estados para controlar expansão das seções
  const [whatsappExpanded, setWhatsappExpanded] = useState(false);
  const [financialExpanded, setFinancialExpanded] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);

  // Detectar seções ativas
  const isWhatsAppActive = location.pathname.startsWith('/whatsapp');
  const isFinancialActive = location.pathname.startsWith('/payables') || 
                            location.pathname.startsWith('/receivables') ||
                            location.pathname.startsWith('/invoices') ||
                            location.pathname.startsWith('/reconciliation') ||
                            location.pathname.startsWith('/dre') ||
                            location.pathname.startsWith('/bpo-audit');
  const isTasksActive = location.pathname.startsWith('/tasks');
  const isAIActive = location.pathname.startsWith('/suggested-actions') ||
                     location.pathname.startsWith('/reports') ||
                     location.pathname.startsWith('/analysis');
  const isConfigActive = location.pathname.startsWith('/companies') ||
                         location.pathname.startsWith('/contacts') ||
                         location.pathname.startsWith('/audit') ||
                         location.pathname.startsWith('/settings');

  // Auto-expansão inteligente
  useEffect(() => {
    if (!isCollapsed) {
      setWhatsappExpanded(isWhatsAppActive);
      setFinancialExpanded(isFinancialActive);
      setTasksExpanded(isTasksActive);
      setAiExpanded(isAIActive);
      setConfigExpanded(isConfigActive);
    }
  }, [location.pathname, isWhatsAppActive, isFinancialActive, isTasksActive, isAIActive, isConfigActive, isCollapsed]);

  // Menu items do Core
  const coreMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  ];

  // Submenu Gestão Financeira
  const financialSubmenu = [
    { id: 'payables', label: 'Contas a Pagar', icon: Receipt, path: '/payables' },
    { id: 'receivables', label: 'Contas a Receber', icon: Receipt, path: '/receivables' },
    { id: 'invoices', label: 'Faturamento', icon: FileStack, path: '/invoices' },
    { id: 'reconciliation', label: 'Reconciliação Bancária', icon: Scale, path: '/reconciliation' },
    { id: 'dre', label: 'DRE Gerencial', icon: TrendingUp, path: '/dre' },
    { id: 'bpo-audit', label: 'Auditoria BPO', icon: ClipboardCheck, path: '/bpo-audit' },
  ];

  // Submenu Tarefas
  const tasksSubmenu = [
    { id: 'internal-tasks', label: 'Tarefas Internas', icon: FolderKanban, path: '/tasks' },
  ];

  // Submenu IA & Análise
  const aiSubmenu = [
    { id: 'suggested-actions', label: 'Ações Sugeridas', icon: Lightbulb, path: '/suggested-actions' },
    { id: 'reports', label: 'Relatórios de IA', icon: BarChart3, path: '/reports' },
    { id: 'document-analysis', label: 'Análise', icon: FileSearch, path: '/analysis' },
  ];

  // Submenu WhatsApp
  const whatsappSubmenu = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/whatsapp/chats' },
    { id: 'fila', label: 'Fila', icon: ListTodo, path: '/whatsapp/fila' },
    { id: 'contatos', label: 'Contatos', icon: UserCircle, path: '/whatsapp/contatos' },
  ];

  // Submenu Configurações
  const configSubmenu = [
    { id: 'team', label: 'Equipe', icon: Users, path: '/team' },
    { id: 'companies', label: 'Empresas', icon: Building2, path: '/companies' },
    { id: 'contacts', label: 'Contatos', icon: UserCircle, path: '/contacts' },
    { id: 'audit', label: 'Logs de Auditoria', icon: Shield, path: '/audit' },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, path: '/settings' },
  ];

  // Handler de navegação
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const renderMenuItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => handleMenuClick(item.path)}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </button>
    );
  };

  const renderSubmenuItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    if (isCollapsed) return null;
    
    return (
      <button
        key={item.id}
        onClick={() => handleMenuClick(item.path)}
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
  };

  const renderSection = (
    title: string,
    icon: any,
    expanded: boolean,
    setExpanded: (val: boolean) => void,
    isActive: boolean,
    submenu: any[]
  ) => {
    const Icon = icon;
    
    return (
      <div className="space-y-1">
        <button
          onClick={() => !isCollapsed && setExpanded(!expanded)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} py-3 rounded-lg text-left transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          title={isCollapsed ? title : undefined}
        >
          {isCollapsed ? (
            <Icon className="w-5 h-5" />
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{title}</span>
              </div>
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        
        {!isCollapsed && expanded && (
          <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
            {submenu.map((item) => 
              renderSubmenuItem(item, location.pathname === item.path)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-10 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with toggle */}
      <div className={`flex-shrink-0 ${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FullBPO</h1>
                <p className="text-sm text-gray-500">Analytics</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {/* Company Multi-Select */}
        {!isCollapsed && (
          <div className="mb-4">
            <CompanyMultiSelect />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`w-full ${isCollapsed ? 'px-0 justify-center' : ''}`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5 mr-2" />
              Minimizar
            </>
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-2 pb-6">
          {/* Core Menu Items */}
          {coreMenuItems.map((item) => 
            renderMenuItem(item, location.pathname === item.path)
          )}
          
          {/* Gestão Financeira Section */}
          <div className="mt-4">
            {renderSection(
              'Gestão Financeira',
              Wallet,
              financialExpanded,
              setFinancialExpanded,
              isFinancialActive,
              financialSubmenu
            )}
          </div>

          {/* Tarefas Section */}
          {renderSection(
            'Tarefas',
            FolderKanban,
            tasksExpanded,
            setTasksExpanded,
            isTasksActive,
            tasksSubmenu
          )}

          {/* IA & Análise Section */}
          {renderSection(
            'IA & Análise',
            Sparkles,
            aiExpanded,
            setAiExpanded,
            isAIActive,
            aiSubmenu
          )}
          
          {/* WhatsApp Section */}
          {renderSection(
            'WhatsApp',
            MessageCircle,
            whatsappExpanded,
            setWhatsappExpanded,
            isWhatsAppActive,
            whatsappSubmenu
          )}

          {/* Configurações Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {renderSection(
              'Configurações',
              SettingsIcon,
              configExpanded,
              setConfigExpanded,
              isConfigActive,
              configSubmenu
            )}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};
