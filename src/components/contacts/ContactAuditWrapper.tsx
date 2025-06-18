
import React from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Contact } from '@/hooks/useContacts';

interface ContactAuditWrapperProps {
  children: React.ReactNode;
  contact?: Contact;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  oldData?: Contact;
  newData?: Contact;
}

export const ContactAuditWrapper = ({ 
  children, 
  contact, 
  action, 
  oldData, 
  newData 
}: ContactAuditWrapperProps) => {
  const { logAction } = useAuditLog();

  React.useEffect(() => {
    if (contact || newData) {
      const recordId = contact?.id_contact || newData?.id_contact;
      
      logAction({
        action,
        tableName: 'contacts',
        recordId,
        oldData,
        newData: newData || contact
      });
    }
  }, [contact, action, oldData, newData, logAction]);

  return <>{children}</>;
};
