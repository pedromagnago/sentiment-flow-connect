import React from 'react';
import { useBPOMetrics, ClientMetrics } from '@/hooks/useBPOMetrics';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Receipt, 
  Scale, 
  Lightbulb, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  FileSearch,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatusBadge: React.FC<{ status: ClientMetrics['status'] }> = ({ status }) => {
  const config = {
    ok: { label: 'Em dia', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-800' },
    attention: { label: 'Atenção', variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
    critical: { label: 'Crítico', variant: 'destructive' as const, icon: AlertTriangle, className: 'bg-red-100 text-red-800' },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

const ClientCard: React.FC<{ client: ClientMetrics; onNavigate: (companyId: string, path: string) => void }> = ({ client, onNavigate }) => {
  const totalPending = client.pendingPayables + client.pendingReceivables + client.pendingReconciliation;

  return (
    <Card className={`transition-all hover:shadow-lg ${
      client.status === 'critical' ? 'border-red-200 bg-red-50/30' :
      client.status === 'attention' ? 'border-yellow-200 bg-yellow-50/30' :
      'border-border'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{client.companyName}</CardTitle>
          </div>
          <StatusBadge status={client.status} />
        </div>
        {client.lastActivity && (
          <CardDescription>
            Última atividade: {formatDistanceToNow(new Date(client.lastActivity), { addSuffix: true, locale: ptBR })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Receipt className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Contas a Pagar</p>
              <p className="font-semibold">{client.pendingPayables}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Receipt className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Contas a Receber</p>
              <p className="font-semibold">{client.pendingReceivables}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Scale className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Reconciliação</p>
              <p className="font-semibold">{client.pendingReconciliation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Lightbulb className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Ações IA</p>
              <p className="font-semibold">{client.pendingSuggestedActions}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate(client.companyId, '/payables')}
          >
            <Receipt className="h-3 w-3 mr-1" />
            Pagar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate(client.companyId, '/reconciliation')}
          >
            <Scale className="h-3 w-3 mr-1" />
            Reconciliar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate(client.companyId, '/import')}
          >
            <Upload className="h-3 w-3 mr-1" />
            Importar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function BPODashboardPage() {
  const { clients, summary, loading, error, refresh } = useBPOMetrics();
  const navigate = useNavigate();

  const handleNavigate = (companyId: string, path: string) => {
    // Store selected company and navigate
    localStorage.setItem('selectedCompanyId', companyId);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard BPO</h1>
          <p className="text-muted-foreground">Visão geral dos clientes e pendências</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={() => navigate('/help')}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Ajuda
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary.totalClients}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPendingPayables}</p>
                <p className="text-xs text-muted-foreground">A Pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPendingReceivables}</p>
                <p className="text-xs text-muted-foreground">A Receber</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPendingReconciliation}</p>
                <p className="text-xs text-muted-foreground">Reconciliar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPendingActions}</p>
                <p className="text-xs text-muted-foreground">Ações IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={summary.clientsNeedingAttention > 0 ? 'border-red-200 bg-red-50/30' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${summary.clientsNeedingAttention > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-2xl font-bold">{summary.clientsNeedingAttention}</p>
                <p className="text-xs text-muted-foreground">Precisam Atenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não tem acesso a nenhuma empresa.
            </p>
            <Button onClick={() => navigate('/companies')}>
              Gerenciar Empresas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard 
              key={client.companyId} 
              client={client} 
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
