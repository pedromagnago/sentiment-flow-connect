import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receivable } from '@/hooks/useReceivables';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceivableModalProps {
  receivable: Receivable | null;
  open: boolean;
  onClose: () => void;
}

export const ReceivableModal: React.FC<ReceivableModalProps> = ({
  receivable,
  open,
  onClose,
}) => {
  if (!receivable) return null;

  const currency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Conta a Receber</DialogTitle>
          <DialogDescription>
            Informações completas sobre a conta a receber
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente Info */}
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Nome:</span> {receivable.cliente}</p>
              {receivable.cpf_cnpj_cliente && (
                <p><span className="text-muted-foreground">CPF/CNPJ:</span> {receivable.cpf_cnpj_cliente}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div>
            <h3 className="font-semibold mb-2">Valores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-lg font-semibold">{currency(receivable.valor_total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Recebido</p>
                <p className="text-lg font-semibold text-green-600">
                  {currency(receivable.valor_recebido)}
                </p>
              </div>
              {receivable.saldo_devedor && (
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Devedor</p>
                  <p className="text-lg font-semibold text-red-600">
                    {currency(receivable.saldo_devedor)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Datas */}
          <div>
            <h3 className="font-semibold mb-2">Datas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {receivable.data_emissao && (
                <div>
                  <p className="text-muted-foreground">Emissão</p>
                  <p>{format(new Date(receivable.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Vencimento</p>
                <p>{format(new Date(receivable.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Competência</p>
                <p>{format(new Date(receivable.data_competencia), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              {receivable.recebido_em && (
                <div>
                  <p className="text-muted-foreground">Recebido em</p>
                  <p>{format(new Date(receivable.recebido_em), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Documento */}
          <div>
            <h3 className="font-semibold mb-2">Documento</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Tipo:</span> {receivable.tipo_documento}</p>
              <p><span className="text-muted-foreground">Descrição:</span> {receivable.descricao}</p>
              {receivable.chave_nfe && (
                <p><span className="text-muted-foreground">Chave NF-e:</span> {receivable.chave_nfe}</p>
              )}
              {receivable.numero_recibo && (
                <p><span className="text-muted-foreground">Número Recibo:</span> {receivable.numero_recibo}</p>
              )}
            </div>
          </div>

          {/* Classificação */}
          {(receivable.categoria || receivable.centro_custo || receivable.projeto) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Classificação</h3>
                <div className="flex flex-wrap gap-2">
                  {receivable.categoria && (
                    <Badge variant="outline">Categoria: {receivable.categoria}</Badge>
                  )}
                  {receivable.subcategoria && (
                    <Badge variant="outline">Subcategoria: {receivable.subcategoria}</Badge>
                  )}
                  {receivable.centro_custo && (
                    <Badge variant="outline">Centro de Custo: {receivable.centro_custo}</Badge>
                  )}
                  {receivable.projeto && (
                    <Badge variant="outline">Projeto: {receivable.projeto}</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          {receivable.observacoes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-muted-foreground">{receivable.observacoes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
