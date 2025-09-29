import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Clock, CheckCircle, Building, Crown } from 'lucide-react';
import type { Conversation } from './WhatsAppInterface';
import type { ConversationAssignment } from '@/hooks/useConversationAssignments';
import type { UserProfile } from '@/hooks/useUserProfile';

interface ConversationStatsProps {
  conversations: Conversation[];
  assignments: ConversationAssignment[];
  profile: UserProfile | null;
  isAdmin: boolean;
}

export const ConversationStats: React.FC<ConversationStatsProps> = ({
  conversations,
  assignments,
  profile,
  isAdmin
}) => {
  // Group conversations by empresa_id for admin view
  const conversationsByCompany = React.useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    conversations.forEach(conv => {
      const empresa_id = conv.contact.empresa_id || 'sem_empresa';
      if (!groups[empresa_id]) groups[empresa_id] = [];
      groups[empresa_id].push(conv);
    });
    return groups;
  }, [conversations]);

  const availableCount = conversations.filter(conv => 
    !assignments.find(a => a.contact_id === conv.contact.id_contact)
  ).length;

  const inProgressCount = assignments.filter(a => a.status === 'em_atendimento').length;
  const waitingCount = assignments.filter(a => a.status === 'aguardando').length;
  const finishedCount = assignments.filter(a => a.status === 'finalizado').length;

  const stats = [
    {
      icon: MessageSquare,
      label: 'Disponíveis',
      count: availableCount,
      color: 'bg-slate-100 text-slate-700'
    },
    {
      icon: Clock,
      label: 'Em Andamento',
      count: inProgressCount,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: Users,
      label: 'Aguardando',  
      count: waitingCount,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      icon: CheckCircle,
      label: 'Finalizados',
      count: finishedCount,
      color: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Fila de Atendimento</h2>
            {isAdmin && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">
              {profile?.display_name || 'Usuário'}
            </p>
            {isAdmin ? (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                Visualizando todas as empresas ({Object.keys(conversationsByCompany).length})
              </p>
            ) : profile?.company_id && (
              <p className="text-sm text-muted-foreground">
                Empresa: <Badge variant="outline">{profile.company_id}</Badge>
              </p>
            )}
          </div>
        </div>
        <Badge variant="secondary">
          {conversations.length} conversas ativas
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};