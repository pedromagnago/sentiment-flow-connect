import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DRELine } from '@/hooks/useDREData';

interface DREHierarchyTableProps {
  data: DRELine[];
  showPercentage?: boolean;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

interface DRERowProps {
  line: DRELine;
  depth?: number;
  showPercentage?: boolean;
}

const DRERow: React.FC<DRERowProps> = ({ line, depth = 0, showPercentage }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = line.children && line.children.length > 0;

  const getRowStyle = () => {
    if (line.isTotal) {
      return 'bg-muted/50 font-semibold';
    }
    if (depth === 0) {
      return 'font-medium';
    }
    return '';
  };

  const getValueColor = () => {
    if (line.isTotal && line.valor >= 0) return 'text-green-600';
    if (line.isTotal && line.valor < 0) return 'text-red-600';
    if (line.valor > 0) return 'text-green-600';
    if (line.valor < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (line.valor > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (line.valor < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <>
      <TableRow className={cn(getRowStyle(), 'hover:bg-muted/30')}>
        <TableCell className="w-16 text-muted-foreground text-xs">
          {line.codigo}
        </TableCell>
        <TableCell>
          <div 
            className="flex items-center gap-1"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <span className="w-6" />
            )}
            <span className={cn(line.isTotal && 'text-primary')}>
              {line.nome}
            </span>
          </div>
        </TableCell>
        <TableCell className={cn('text-right font-mono', getValueColor())}>
          {formatCurrency(line.valor)}
        </TableCell>
        {showPercentage && (
          <TableCell className="text-right text-muted-foreground w-20">
            {formatPercent(Math.abs(line.percentual))}
          </TableCell>
        )}
        <TableCell className="w-10">
          {getTrendIcon()}
        </TableCell>
      </TableRow>
      {hasChildren && expanded && line.children.map((child) => (
        <DRERow 
          key={child.codigo} 
          line={child} 
          depth={depth + 1}
          showPercentage={showPercentage}
        />
      ))}
    </>
  );
};

export const DREHierarchyTable: React.FC<DREHierarchyTableProps> = ({ 
  data, 
  showPercentage = true,
  className 
}) => {
  const [expandAll, setExpandAll] = useState(true);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Demonstração do Resultado do Exercício
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? 'Recolher' : 'Expandir'} Tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cód.</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right w-36">Valor (R$)</TableHead>
                {showPercentage && (
                  <TableHead className="text-right w-20">% AV</TableHead>
                )}
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((line) => (
                <DRERow 
                  key={line.codigo} 
                  line={line}
                  showPercentage={showPercentage}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          % AV = Análise Vertical (percentual sobre Receita Bruta)
        </div>
      </CardContent>
    </Card>
  );
};

export default DREHierarchyTable;
