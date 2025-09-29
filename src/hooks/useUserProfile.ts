import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  display_name: string | null;
  company_id: string | null;
  role: string | null;
  ativo: boolean;
  especialidade: string[];
  max_atendimentos_simultaneos: number;
  horario_atendimento: any; // Changed from specific type to any to handle Json from DB
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data);
    } catch (e: any) {
      setError(e?.message || String(e));
      setProfile(null);
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

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner';

  return { 
    profile, 
    loading, 
    error, 
    isAdmin, 
    refresh: fetchProfile 
  };
}