
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LogAuditParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  tableName: string;
  recordId?: string;
  oldData?: any;
  newData?: any;
}

export const useAuditLog = () => {
  const logAction = async ({
    action,
    tableName,
    recordId,
    oldData,
    newData
  }: LogAuditParams) => {
    try {
      // Capturar informações do navegador
      const userAgent = navigator.userAgent;
      
      // Tentar obter IP (limitado no browser, mas podemos tentar)
      let ipAddress = null;
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip;
      } catch (error) {
        console.log('Could not fetch IP address:', error);
      }

      const logEntry = {
        user_id: 'anonymous', // Por enquanto, sem autenticação
        action,
        table_name: tableName,
        record_id: recordId || null,
        old_data: oldData || null,
        new_data: newData || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      console.log('Logging audit action:', logEntry);

      // Usar inserção direta na tabela audit_logs
      const { error } = await (supabase as any)
        .from('audit_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Error logging audit action:', error);
      }
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const fetchAuditLogs = async (filters?: {
    tableName?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    try {
      // Usar busca direta na tabela audit_logs
      let query = (supabase as any)
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.tableName) {
        query = query.eq('table_name', filters.tableName);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data as AuditLog[];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  };

  return {
    logAction,
    fetchAuditLogs
  };
};
