import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreVertical, Shield, UserCog, Eye, Users, Crown } from 'lucide-react';
import type { TeamMember } from '@/hooks/useTeamManagement';

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdateRole: (userId: string, newRole: string) => void;
  onDeactivate: (userId: string) => void;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  supervisor: UserCog,
  operator: Users,
  viewer: Eye,
};

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  supervisor: 'Supervisor',
  operator: 'Operador',
  viewer: 'Visualizador',
};

const roleColors = {
  owner: 'bg-gradient-to-r from-yellow-500 to-orange-600',
  admin: 'bg-gradient-to-r from-red-500 to-pink-600',
  supervisor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  operator: 'bg-gradient-to-r from-green-500 to-teal-600',
  viewer: 'bg-gradient-to-r from-gray-500 to-slate-600',
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onUpdateRole,
  onDeactivate,
}) => {
  const RoleIcon = roleIcons[member.role];
  const initials = member.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || member.email[0].toUpperCase();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={roleColors[member.role] + ' text-white'}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.display_name || 'Sem nome'}</h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <RoleIcon className="h-3 w-3" />
              {roleLabels[member.role]}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                  Promover para Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'supervisor')}>
                  Tornar Supervisor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'operator')}>
                  Tornar Operador
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'viewer')}>
                  Tornar Visualizador
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeactivate(member.id)}
                  className="text-destructive"
                >
                  Desativar Usuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
