import React, { useState } from 'react';
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
import { MoreVertical, Shield, UserCog, Eye, Users, Crown, Building2, Plus, X } from 'lucide-react';
import type { TeamMember } from '@/hooks/useTeamManagement';
import { AddCompanyAccessModal } from './AddCompanyAccessModal';

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdateRole: (userId: string, companyId: string, newRole: string) => void;
  onRemoveFromCompany: (userId: string, companyId: string) => void;
  onAddToCompany: () => void;
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
  onRemoveFromCompany,
  onAddToCompany,
}) => {
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  
  const initials = member.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || member.email[0].toUpperCase();

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header com avatar e nome */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-primary/70 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.display_name || 'Sem nome'}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCompanyModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Empresa
              </Button>
            </div>

            {/* Lista de empresas */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Empresas ({member.companies.length})</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {member.companies.map((company) => {
                  const RoleIcon = roleIcons[company.role];
                  return (
                    <div
                      key={company.company_id}
                      className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{company.company_name}</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[company.role]}
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Alterar Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, company.company_id, 'owner')}>
                            <Crown className="h-3 w-3 mr-2" />
                            Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, company.company_id, 'admin')}>
                            <Shield className="h-3 w-3 mr-2" />
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, company.company_id, 'supervisor')}>
                            <UserCog className="h-3 w-3 mr-2" />
                            Supervisor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, company.company_id, 'operator')}>
                            <Users className="h-3 w-3 mr-2" />
                            Operador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, company.company_id, 'viewer')}>
                            <Eye className="h-3 w-3 mr-2" />
                            Visualizador
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onRemoveFromCompany(member.id, company.company_id)}
                            className="text-destructive"
                          >
                            <X className="h-3 w-3 mr-2" />
                            Remover desta empresa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddCompanyAccessModal
        open={showAddCompanyModal}
        onOpenChange={setShowAddCompanyModal}
        userId={member.id}
        userName={member.display_name || member.email}
        userCompanies={member.companies.map(c => c.company_id)}
        onSuccess={onAddToCompany}
      />
    </>
  );
};
