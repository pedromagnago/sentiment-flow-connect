
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
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
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
        </nav>
      </div>
    </div>
  );
};
