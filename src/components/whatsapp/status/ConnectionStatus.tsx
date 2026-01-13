import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate: string | null;
  onRefresh: () => void;
  loading?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  lastUpdate,
  onRefresh,
  loading
}) => {
  return (
    <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isConnected ? 'ZAPI Conectado' : 'ZAPI Desconectado'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lastUpdate ? `Última atualização: ${new Date(lastUpdate).toLocaleString('pt-BR')}` : 'Sem dados recentes'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
