
import React from 'react';
import { CompanyCard } from './CompanyCard';
import { CompanyEmptyState } from './CompanyEmptyState';
import { Company } from '@/hooks/useCompanies';

interface CompanyListProps {
  companies: Company[];
  hasSearch: boolean;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompanyList = ({ 
  companies, 
  hasSearch, 
  onEdit, 
  onDelete 
}: CompanyListProps) => {
  if (companies.length === 0) {
    return <CompanyEmptyState hasSearch={hasSearch} />;
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
