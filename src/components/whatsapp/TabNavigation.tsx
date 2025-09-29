import React from 'react';
import { MessageCircle, Users, Calendar } from 'lucide-react';
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
      count: unreadCount
    },
    {
      id: 'fila' as const,
      label: 'Fila',
      icon: Calendar,
      count: queueCount
    },
    {
      id: 'contatos' as const,
      label: 'Contatos',
      icon: Users
    }
  ];

  return (
    <div className="flex border-b border-border bg-card">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className="flex-1 justify-start gap-2 rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
          data-active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
          {tab.count && tab.count > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {tab.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};