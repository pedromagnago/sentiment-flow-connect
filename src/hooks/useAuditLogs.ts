
import { useState, useEffect } from 'react';
import { useAuditLog, AuditLog } from './useAuditLog';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchAuditLogs } = useAuditLog();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuditLogs({ limit: 100 });
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  };
};
