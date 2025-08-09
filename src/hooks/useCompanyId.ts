import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseCompanyIdResult {
  companyId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCompanyId(): UseCompanyIdResult {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("profiles").select("company_id").maybeSingle();
      if (error) throw error;
      setCompanyId(data?.company_id ? String(data.company_id) : null);
    } catch (e: any) {
      setError(e?.message || String(e));
      setCompanyId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchCompany();
    });
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { companyId, loading, error, refresh: fetchCompany };
}
