
import { Building2, CheckCircle, Settings } from 'lucide-react';
import { Company } from '@/hooks/useCompanies';

interface CompanyStatsProps {
  companies: Company[];
}

export const CompanyStats = ({ companies }: CompanyStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-2">{companies.length}</p>
          </div>
          <Building2 className="w-8 h-8 text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Ativas</p>
            <p className="text-3xl font-bold mt-2">
              {companies.filter(c => c.status === 'Ativo').length}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">Com ClickUp</p>
            <p className="text-3xl font-bold mt-2">
              {companies.filter(c => c.clickup_integration_status === 'Ativo').length}
            </p>
          </div>
          <Settings className="w-8 h-8 text-yellow-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Com Omie</p>
            <p className="text-3xl font-bold mt-2">
              {companies.filter(c => c.omie_integration_status === 'Ativo').length}
            </p>
          </div>
          <Settings className="w-8 h-8 text-purple-200" />
        </div>
      </div>
    </div>
  );
};
