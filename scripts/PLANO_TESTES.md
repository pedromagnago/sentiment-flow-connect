# Plano de Testes - FullBPO

## Objetivo
Popular dados de teste para validação completa do sistema na empresa **Full BPO** para o usuário `pedromagnago0@gmail.com`.

## Dados do Ambiente de Teste

| Item | Valor |
|------|-------|
| **Usuário** | pedromagnago0@gmail.com |
| **User ID** | ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2 |
| **Empresa** | Full BPO |
| **Company ID** | 371f6e9f-31e2-4ef4-bf00-65495f0688a2 |
| **Role** | owner |

---

## Checklist de Dados a Popular

### 1. Contatos (contacts) ✅
- [ ] 5 contatos de fornecedores (WhatsApp)
- [ ] 5 contatos de clientes (WhatsApp)
- [ ] 2 grupos de WhatsApp

### 2. Transações Bancárias (bank_transactions) ✅
- [ ] 20 transações de entrada (receitas)
- [ ] 30 transações de saída (despesas)
- [ ] 5 transferências entre contas
- [ ] 3 tarifas bancárias
- [ ] 2 rendimentos

### 3. Contas a Pagar (contas_pagar) ✅
- [ ] 10 contas pendentes
- [ ] 5 contas pagas
- [ ] 3 contas vencidas

### 4. Contas a Receber (contas_receber) ✅
- [ ] 8 contas pendentes
- [ ] 4 contas recebidas
- [ ] 2 contas vencidas

### 5. Faturas (faturas) ✅
- [ ] 5 faturas emitidas
- [ ] 3 faturas pendentes
- [ ] 2 faturas pagas

### 6. Categorias (categories) ✅
- [ ] Usar categorias globais existentes
- [ ] Criar categorias específicas da empresa se necessário

### 7. Conta Bancária (bank_accounts) ✅
- [ ] 1 conta corrente principal
- [ ] 1 conta poupança

---

## Cenários de Teste

### Cenário 1: Dashboard
- Verificar métricas de receitas e despesas
- Confirmar totais de contas a pagar/receber
- Validar gráficos de tendência

### Cenário 2: Reconciliação
- Transações bancárias não conciliadas devem aparecer
- Possibilidade de vincular transação com conta a pagar/receber
- Transações de tarifa/transferência devem ser ignoráveis

### Cenário 3: DRE
- Categorias devem agrupar corretamente
- Receitas e despesas por período
- Comparativo mensal

### Cenário 4: Auditoria BPO
- Criação de período
- Fechamento de período
- Bloqueio de edições em período fechado

### Cenário 5: WhatsApp (se habilitado)
- Contatos aparecem na lista
- Classificação de contatos funciona
- Mensagens são exibidas

---

## Scripts de População

Os scripts SQL estão em `/scripts/populate_test_data.sql`

### Execução
1. Acesse o SQL Editor do Supabase
2. Execute os scripts na ordem indicada
3. Valide os dados no sistema

---

## Validação Final

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Login | ⏳ | |
| Dashboard | ⏳ | |
| Contas a Pagar | ⏳ | |
| Contas a Receber | ⏳ | |
| Faturamento | ⏳ | |
| Reconciliação | ⏳ | |
| DRE | ⏳ | |
| Auditoria BPO | ⏳ | |
| Importação | ⏳ | |
| Equipe | ⏳ | |
| Dashboard BPO | ⏳ | |
| Ajuda | ⏳ | |

---

## Notas
- Dados gerados são fictícios para fins de teste
- CNPJ/CPF são fictícios e inválidos
- Valores monetários são exemplos
