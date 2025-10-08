import { AuditLogs } from '@/components/AuditLogs';
import { Breadcrumb } from '@/components/common/Breadcrumb';

const AuditLogsPage = () => {
  const breadcrumbItems = [
    { label: 'Sistema', href: '#' },
    { label: 'Logs de Auditoria', href: '/audit' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <AuditLogs />
    </>
  );
};

export default AuditLogsPage;
