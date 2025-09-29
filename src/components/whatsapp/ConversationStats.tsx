import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import type { Conversation } from './WhatsAppInterface';
import type { ConversationAssignment } from '@/hooks/useConversationAssignments';

interface ConversationStatsProps {
  conversations: Conversation[];
  assignments: ConversationAssignment[];
  companyId?: string | null;
}

export const ConversationStats: React.FC<ConversationStatsProps> = ({
  conversations,
  assignments,
  companyId
}) => {
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
          <h2 className="text-lg font-semibold">Fila de Atendimento</h2>
          {companyId && (
            <p className="text-sm text-muted-foreground">
              Filtrando por empresa: <Badge variant="outline">{companyId}</Badge>
            </p>
          )}
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