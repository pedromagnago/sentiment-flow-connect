import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageCircle, ListTodo, Users } from 'lucide-react';
import { WhatsAppProvider, useWhatsApp } from '@/contexts/WhatsAppContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';

const WhatsAppLayoutContent = () => {
  const { unreadCount, queueCount, loading, error } = useWhatsApp();
  const { isCollapsed } = useSidebarContext();

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <LoadingSpinner />
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <ErrorState message={error} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">WhatsApp Business</h1>
                <p className="text-sm text-muted-foreground">Central de Atendimento</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                  ● Online
                </div>
              </div>
            </div>

            <nav className="flex gap-1">
              <NavLink
                to="/whatsapp/chats"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Chats</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </NavLink>

              <NavLink
                to="/whatsapp/fila"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <ListTodo className="w-4 h-4" />
                <span className="font-medium">Fila</span>
                {queueCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {queueCount}
                  </Badge>
                )}
              </NavLink>

              <NavLink
                to="/whatsapp/contatos"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Contatos</span>
              </NavLink>
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export const WhatsAppLayout = () => {
  return (
    <WhatsAppProvider>
      <WhatsAppLayoutContent />
    </WhatsAppProvider>
  );
};
