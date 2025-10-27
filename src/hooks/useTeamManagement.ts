import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  display_name: string | null;
  email: string;
  role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';
  is_active: boolean;
  granted_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
}

export const useTeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const listMembers = async (): Promise<TeamMember[]> => {
    try {
      setLoading(true);
      
      // Buscar user_roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, role, is_active, granted_at, company_id')
        .eq('is_active', true)
        .is('revoked_at', null);

      if (error) throw error;
      if (!userRoles || userRoles.length === 0) return [];

      // Buscar profiles e emails
      const userIds = userRoles.map(ur => ur.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);
      
      const { data: { users } } = await supabase.auth.admin.listUsers();
      
      const members: TeamMember[] = userRoles.map(ur => {
        const profile = profiles?.find(p => p.id === ur.user_id);
        const user = users?.find(u => u.id === ur.user_id);
        return {
          id: ur.user_id,
          display_name: profile?.display_name || null,
          email: user?.email || '',
          role: ur.role,
          is_active: ur.is_active ?? true,
          granted_at: ur.granted_at || new Date().toISOString(),
        };
      });

      return members;
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar membros',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const listInvitations = async (): Promise<TeamInvitation[]> => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((inv: any) => ({
        ...inv,
        status: inv.status as 'pending' | 'accepted' | 'expired' | 'revoked',
      }));
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar convites',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const inviteUser = async (
    email: string,
    role: 'admin' | 'supervisor' | 'operator' | 'viewer'
  ): Promise<{ success: boolean; token?: string }> => {
    try {
      setLoading(true);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          email,
          role,
          invited_by: currentUser.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Convite criado',
        description: `Convite enviado para ${email}`,
      });

      return { success: true, token: data.token };
    } catch (error: any) {
      toast({
        title: 'Erro ao criar convite',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (
    userId: string,
    newRole: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer'
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role atualizada',
        description: 'A role do usuário foi atualizada com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar role',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário desativado',
        description: 'O usuário foi desativado com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao desativar usuário',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const revokeInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Convite revogado',
        description: 'O convite foi revogado com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao revogar convite',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    listMembers,
    listInvitations,
    inviteUser,
    updateRole,
    deactivateUser,
    revokeInvitation,
  };
};
