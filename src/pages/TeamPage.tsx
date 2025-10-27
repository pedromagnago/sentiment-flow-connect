import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Mail } from 'lucide-react';
import { InviteUserModal } from '@/components/team/InviteUserModal';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const TeamPage: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAdmin, isOwner, loading } = useUserProfile();

  const handleInviteSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p>Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOwner) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar esta página. Apenas Admins e Owners podem gerenciar a equipe.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe e seus acessos ao sistema
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os membros com acesso ao sistema
              </CardDescription>
            </div>
            <Button onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Membros Ativos
                </TabsTrigger>
                <TabsTrigger value="invites">
                  <Mail className="h-4 w-4 mr-2" />
                  Convites Pendentes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="mt-6">
                <TeamMemberList refresh={refreshKey} />
              </TabsContent>

              <TabsContent value="invites" className="mt-6">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Os convites pendentes serão listados aqui. Funcionalidade em desenvolvimento.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <InviteUserModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          onSuccess={handleInviteSuccess}
        />
      </div>
    </div>
  );
};

export default TeamPage;
