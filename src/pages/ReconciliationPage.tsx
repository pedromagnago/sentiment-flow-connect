import { Reconciliation } from '@/components/finance/Reconciliation';
import { Breadcrumb } from '@/components/common/Breadcrumb';

const ReconciliationPage = () => {
  const breadcrumbItems = [
    { label: 'Gestão Financeira', href: '#' },
    { label: 'Reconciliação Bancária', href: '/reconciliation' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Reconciliation />
    </>
  );
};

export default ReconciliationPage;
