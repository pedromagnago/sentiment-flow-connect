import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  display_name: string | null;
  ativo: boolean;
  especialidade: string[];
  max_atendimentos_simultaneos: number;
  horario_atendimento: any;
}

export interface UserRole {
  role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';
  company_id: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  hasRole: (role: string) => boolean;
  refresh: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, ativo, especialidade, max_atendimentos_simultaneos, horario_atendimento")
        .maybeSingle();
      
      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Buscar roles do usuário da nova tabela user_roles
      if (profileData?.id) {
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("role, company_id")
          .eq("user_id", profileData.id)
          .eq("is_active", true)
          .is("revoked_at", null);
        
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
      setProfile(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const hasRole = (role: string) => {
    return roles.some(r => r.role === role);
  };

  const isAdmin = hasRole('admin') || hasRole('owner');
  const isOwner = hasRole('owner');

  return { 
    profile, 
    roles,
    loading, 
    error, 
    isAdmin,
    isOwner,
    hasRole,
    refresh: fetchProfile 
  };
}