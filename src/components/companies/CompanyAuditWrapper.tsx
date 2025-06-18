
import React from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Company } from '@/hooks/useCompanies';

interface CompanyAuditWrapperProps {
  children: React.ReactNode;
  company?: Company;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  oldData?: Company;
  newData?: Company;
}

export const CompanyAuditWrapper = ({ 
  children, 
  company, 
  action, 
  oldData, 
  newData 
}: CompanyAuditWrapperProps) => {
  const { logAction } = useAuditLog();

  React.useEffect(() => {
    if (company || newData) {
      const recordId = company?.id || newData?.id;
      
      logAction({
        action,
        tableName: 'companies',
        recordId,
        oldData,
        newData: newData || company
      });
    }
  }, [company, action, oldData, newData, logAction]);

  return <>{children}</>;
};
