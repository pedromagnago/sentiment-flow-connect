import { Card, CardContent } from '@/components/ui/card';
import { Users, Users2, User, MessageSquare } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface UnclassifiedStatsProps {
  contacts: Contact[];
  messageCount: Record<string, number>;
}

export const UnclassifiedStats = ({ contacts, messageCount }: UnclassifiedStatsProps) => {
  const groupCount = contacts.filter(c => c.is_group).length;
  const individualCount = contacts.filter(c => !c.is_group).length;
  const withMessagesCount = contacts.filter(c => (messageCount[c.id_contact] || 0) > 0).length;

  const stats = [
    {
      icon: Users,
      label: 'Total',
      value: contacts.length,
      color: 'text-primary'
    },
    {
      icon: Users2,
      label: 'Grupos',
      value: groupCount,
      color: 'text-blue-600'
    },
    {
      icon: User,
      label: 'Individuais',
      value: individualCount,
      color: 'text-purple-600'
    },
    {
      icon: MessageSquare,
      label: 'Com Mensagens',
      value: withMessagesCount,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
