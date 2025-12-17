# Guia do Operador BPO - FullBPO

## Visão Geral

Como **Operador** ou **Supervisor** BPO, você é responsável pela execução das rotinas financeiras dos clientes. Este guia cobre seu fluxo de trabalho diário.

---

## 1. Dashboard BPO

Acesse **Dashboard BPO** para ver todos os clientes:

### Indicadores

- 🟢 **Verde (Em dia)**: Cliente sem pendências críticas
- 🟡 **Amarelo (Atenção)**: Pendências acumulando
- 🔴 **Vermelho (Crítico)**: Ação imediata necessária

### Métricas por Cliente

- **Contas a Pagar**: Pendentes de pagamento
- **Contas a Receber**: Pendentes de recebimento
- **Reconciliação**: Transações não conciliadas
- **Ações IA**: Sugestões pendentes de revisão

---

## 2. Rotina Diária

### Manhã: Verificar Pendências

1. Acesse **Dashboard BPO**
2. Identifique clientes críticos (vermelho)
3. Priorize ações urgentes

### Durante o dia: Processar Documentos

1. Verifique **WhatsApp** para novos documentos
2. Classifique contatos não identificados
3. Processe notas e comprovantes

### Fim do dia: Reconciliação

1. Importe extratos bancários
2. Concilie transações
3. Classifique itens pendentes

---

## 3. Importação de Dados

### Importar Extrato Bancário

1. **Gestão Financeira → Importar Dados**
2. Selecione a empresa
3. Escolha tipo: **Transações Bancárias**
4. Selecione formato: **OFX** ou **CSV**
5. Faça upload do arquivo
6. Revise preview
7. Confirme importação

### Importar de ERP

1. **Gestão Financeira → Importar Dados**
2. Selecione ERP do cliente (Bling, Omie, etc.)
3. Escolha tipo de dados
4. Faça upload
5. Mapeie colunas se necessário
6. Confirme

### Formatos Suportados

| Formato | Uso |
|---------|-----|
| OFX | Extratos bancários |
| CSV | Dados tabulares |
| XLSX | Planilhas Excel |
| PDF | Notas fiscais (via IA) |

---

## 4. Reconciliação Bancária

### Processo Básico

1. **Gestão Financeira → Reconciliação Bancária**
2. Selecione empresa e período
3. Veja transações não conciliadas à esquerda
4. Veja contas a pagar/receber à direita
5. Vincule transações correspondentes

### Tipos de Vínculo

- **1:1** - Uma transação para uma conta
- **N:1** - Várias transações para uma conta (pagamento parcelado)
- **1:N** - Uma transação para várias contas (pagamento agrupado)

### Transações Automáticas

Algumas transações são ignoradas automaticamente:
- Transferências entre contas
- Tarifas bancárias
- Rendimentos de aplicação

### Classificação

Para cada transação, defina:
- **Categoria**: Plano de contas
- **Centro de Custo**: Se aplicável
- **Projeto**: Se aplicável
- **Data de Competência**: Mês de referência

---

## 5. Ações Sugeridas pela IA

### Revisar Sugestões

1. **IA & Análise → Ações Sugeridas**
2. Filtre por empresa ou status
3. Analise cada sugestão:
   - Origem (documento, mensagem)
   - Dados extraídos
   - Ação proposta

### Aprovar/Rejeitar

- ✅ **Aprovar**: Ação será executada
- ❌ **Rejeitar**: Ação descartada
- ✏️ **Editar**: Ajuste dados antes de aprovar

### Tipos de Ações

- Criar conta a pagar
- Criar conta a receber
- Classificar transação
- Criar fatura
- Vincular documentos

---

## 6. WhatsApp (se habilitado)

### Classificar Contatos

1. **WhatsApp → Não Classificados**
2. Identifique o contato
3. Vincule à empresa correta
4. Use filtros para agilizar

### Atender Conversas

1. **WhatsApp → Fila**
2. Selecione conversa
3. Veja histórico e documentos
4. Responda ou processe documentos

### Documentos Recebidos

Documentos enviados pelo WhatsApp são:
1. Salvos automaticamente
2. Analisados pela IA
3. Convertidos em ações sugeridas

---

## 7. Auditoria BPO

### Fechar Período

1. **Gestão Financeira → Auditoria BPO**
2. Selecione empresa
3. Crie ou selecione período
4. Revise:
   - Todas transações classificadas?
   - Reconciliação completa?
   - Saldo bate com extrato?
5. Clique em **Fechar Período**

### Período Fechado

Após fechamento:
- Transações ficam somente-leitura
- Cliente pode visualizar relatório final
- Alterações requerem reabertura por admin

---

## 8. Dicas de Produtividade

### Atalhos

- Use seleção em massa para classificar múltiplos itens
- Configure regras de IA para classificações recorrentes
- Use filtros para focar em pendências

### Priorização

1. Clientes críticos primeiro
2. Vencimentos próximos
3. Documentos aguardando processamento
4. Reconciliação pendente

---

## Suporte

Em caso de dúvidas:
- Consulte seu supervisor
- Acesse a **Central de Ajuda** no sistema
- Contate suporte técnico
