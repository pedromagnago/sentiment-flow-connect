import React from 'react';
import { MessageCircle, Users, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TabNavigationProps {
  activeTab: 'chats' | 'fila' | 'contatos';
  onTabChange: (tab: 'chats' | 'fila' | 'contatos') => void;
  unreadCount?: number;
  queueCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0,
  queueCount = 0
}) => {
  const tabs = [
    {
      id: 'chats' as const,
      label: 'Chats',
      icon: MessageCircle,
      count: unreadCount,
      description: 'Conversas ativas'
    },
    {
      id: 'fila' as const,
      label: 'Fila',
      icon: Clock,
      count: queueCount,
      description: 'Aguardando atendimento'
    },
    {
      id: 'contatos' as const,
      label: 'Contatos',
      icon: Users,
      description: 'Lista de contatos'
    }
  ];

  return (
    <div className="bg-card border-b border-border">
      {/* Header da aplicação */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">WhatsApp Business</h1>
            <p className="text-sm text-muted-foreground">Central de Atendimento</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex-1 h-auto px-6 py-4 rounded-none border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-transparent hover:bg-muted/50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count && tab.count > 0 && (
                  <Badge 
                    variant={activeTab === tab.id ? "default" : "secondary"} 
                    className="h-5 px-2 text-xs"
                  >
                    {tab.count}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {tab.description}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};