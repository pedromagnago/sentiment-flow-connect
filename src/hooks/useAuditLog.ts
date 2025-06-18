
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

      // Usar supabase.rpc para inserir dados em tabelas que não estão nos tipos
      const { error } = await supabase.rpc('insert_audit_log', {
        p_user_id: logEntry.user_id,
        p_action: logEntry.action,
        p_table_name: logEntry.table_name,
        p_record_id: logEntry.record_id,
        p_old_data: logEntry.old_data,
        p_new_data: logEntry.new_data,
        p_ip_address: logEntry.ip_address,
        p_user_agent: logEntry.user_agent
      });

      if (error) {
        console.error('Error logging audit action:', error);
        // Fallback: tentar inserção direta se a função RPC não existir
        try {
          const { error: directError } = await (supabase as any)
            .from('audit_logs')
            .insert([logEntry]);
          
          if (directError) {
            console.error('Error with direct insert:', directError);
          }
        } catch (fallbackError) {
          console.error('Fallback insert also failed:', fallbackError);
        }
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
      // Usar RPC para buscar logs
      const { data, error } = await supabase.rpc('fetch_audit_logs', {
        p_table_name: filters?.tableName,
        p_action: filters?.action,
        p_date_from: filters?.dateFrom,
        p_date_to: filters?.dateTo,
        p_limit: filters?.limit || 1000
      });

      if (error) {
        console.error('Error fetching audit logs via RPC:', error);
        
        // Fallback: tentar busca direta
        try {
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

          const { data: fallbackData, error: fallbackError } = await query;

          if (fallbackError) {
            console.error('Fallback fetch also failed:', fallbackError);
            throw fallbackError;
          }

          return fallbackData as AuditLog[];
        } catch (fallbackError) {
          console.error('Failed to fetch audit logs:', fallbackError);
          throw fallbackError;
        }
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
