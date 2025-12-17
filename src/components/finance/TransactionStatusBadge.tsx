import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionStatus = 'pending' | 'classified' | 'audited' | null;

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

const statusConfig: Record<string, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ElementType;
  className: string;
}> = {
  pending: {
    label: 'Pendente',
    variant: 'outline',
    icon: Clock,
    className: 'border-yellow-500 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
  },
  classified: {
    label: 'Classificado',
    variant: 'secondary',
    icon: CheckCircle,
    className: 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100'
  },
  audited: {
    label: 'Auditado',
    variant: 'default',
    icon: Shield,
    className: 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
  }
};

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  showLabel = true
}) => {
  const config = statusConfig[status || 'pending'] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-normal border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {showLabel && config.label}
    </Badge>
  );
};

// Stats component for status counts
interface StatusStatsProps {
  pending: number;
  classified: number;
  audited: number;
}

export const TransactionStatusStats: React.FC<StatusStatsProps> = ({
  pending,
  classified,
  audited
}) => {
  const total = pending + classified + audited;

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-yellow-600" />
        <span className="text-muted-foreground">Pendentes:</span>
        <span className="font-medium">{pending}</span>
        <span className="text-muted-foreground">
          ({total > 0 ? Math.round((pending / total) * 100) : 0}%)
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <span className="text-muted-foreground">Classificados:</span>
        <span className="font-medium">{classified}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-muted-foreground">Auditados:</span>
        <span className="font-medium">{audited}</span>
      </div>
    </div>
  );
};

export default TransactionStatusBadge;
