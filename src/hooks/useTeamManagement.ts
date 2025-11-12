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
  companies: Array<{
    company_id: string;
    company_name: string;
    role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';
  }>;
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

  const listMembers = async (companyId?: string): Promise<TeamMember[]> => {
    try {
      setLoading(true);
      
      // Buscar user_roles com filtro opcional de empresa
      let query = supabase
        .from('user_roles')
        .select('user_id, role, is_active, granted_at, company_id')
        .eq('is_active', true)
        .is('revoked_at', null);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: userRoles, error } = await query;

      if (error) throw error;
      if (!userRoles || userRoles.length === 0) return [];

      // Buscar empresas
      const companyIds = [...new Set(userRoles.map(ur => ur.company_id))];
      const { data: companies } = await supabase
        .from('companies')
        .select('id, nome')
        .in('id', companyIds);

      // Buscar profiles e emails
      const userIds = [...new Set(userRoles.map(ur => ur.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);
      
      const authResponse = await supabase.auth.admin.listUsers();
      const authUsers = authResponse?.data?.users || [];
      
      // Agrupar por usuário
      const memberMap = new Map<string, TeamMember>();
      
      userRoles.forEach(ur => {
        const profile = profiles?.find(p => p.id === ur.user_id);
        const user = authUsers.find((u: any) => u.id === ur.user_id);
        const company = companies?.find(c => c.id === ur.company_id);
        
        if (!memberMap.has(ur.user_id)) {
          memberMap.set(ur.user_id, {
            id: ur.user_id,
            display_name: profile?.display_name || null,
            email: user?.email || '',
            role: ur.role,
            is_active: ur.is_active ?? true,
            granted_at: ur.granted_at || new Date().toISOString(),
            companies: [],
          });
        }
        
        memberMap.get(ur.user_id)!.companies.push({
          company_id: ur.company_id,
          company_name: company?.nome || 'Sem nome',
          role: ur.role,
        });
      });

      return Array.from(memberMap.values());
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
    role: 'admin' | 'supervisor' | 'operator' | 'viewer',
    companyId: string
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
          company_id: companyId,
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
    companyId: string,
    newRole: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer'
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('company_id', companyId);

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

  const addUserToCompany = async (
    userId: string,
    companyId: string,
    role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer'
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          company_id: companyId,
          role,
          granted_by: currentUser.user.id,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Acesso concedido',
        description: 'O usuário foi adicionado à empresa com sucesso',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar acesso',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromCompany = async (userId: string, companyId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: 'Acesso removido',
        description: 'O acesso do usuário à empresa foi removido',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao remover acesso',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserCompanies = async (userId: string): Promise<Array<{
    company_id: string;
    company_name: string;
    role: string;
  }>> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('company_id, role, companies(nome)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (error) throw error;
      
      return (data || []).map((ur: any) => ({
        company_id: ur.company_id,
        company_name: ur.companies?.nome || 'Sem nome',
        role: ur.role,
      }));
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar empresas do usuário',
        description: error.message,
        variant: 'destructive',
      });
      return [];
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
    addUserToCompany,
    removeUserFromCompany,
    getUserCompanies,
    revokeInvitation,
  };
};
