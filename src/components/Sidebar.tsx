
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  UserCircle
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [whatsappExpanded, setWhatsappExpanded] = useState(location.pathname.startsWith('/whatsapp'));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sentiment', label: 'Análise de Sentimentos', icon: TrendingUp },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'reconciliation', label: 'Reconciliação (OFX)', icon: CreditCard },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'audit-logs', label: 'Logs de Auditoria', icon: Shield },
    { id: 'task-approvals', label: 'Aprovação de Tarefas', icon: ClipboardCheck },
    { id: 'tasks', label: 'Tarefas ClickUp', icon: CheckSquare },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const whatsappSubmenu = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/whatsapp/chats' },
    { id: 'fila', label: 'Fila', icon: ListTodo, path: '/whatsapp/fila' },
    { id: 'contatos', label: 'Contatos', icon: UserCircle, path: '/whatsapp/contatos' },
  ];

  const isWhatsAppActive = location.pathname.startsWith('/whatsapp');

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-10">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FullBPO</h1>
            <p className="text-sm text-gray-500">Analytics Platform</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* WhatsApp Submenu */}
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
        </nav>
      </div>
    </div>
  );
};
