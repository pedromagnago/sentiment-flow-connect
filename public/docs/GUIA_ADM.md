# Guia do Administrador - FullBPO

## Visão Geral

Como **Owner** ou **Admin**, você tem acesso completo ao sistema FullBPO. Este guia cobre todas as funcionalidades administrativas.

---

## 1. Implantação de Novo Cliente

### Passo 1: Criar a Empresa

1. Acesse **Configurações → Empresas**
2. Clique em **Nova Empresa**
3. Preencha os dados:
   - CNPJ (obrigatório)
   - Razão Social
   - Endereço completo
   - Contato principal
4. Clique em **Salvar**

### Passo 2: Configurar Categorias

1. Acesse **Configurações → Categorias**
2. Selecione a empresa criada
3. Configure o plano de contas:
   - Use o modelo padrão ou
   - Importe do ERP do cliente

### Passo 3: Convidar o Cliente

1. Acesse **Equipe → Convidar Usuário**
2. Digite o email do cliente
3. Selecione a empresa criada
4. Defina role: **Viewer** (recomendado)
5. Envie o convite

### Passo 4: Atribuir Operadores

1. Acesse **Equipe**
2. Encontre o operador desejado
3. Clique em **Adicionar Empresa**
4. Selecione a nova empresa
5. Defina role: **Operator** ou **Supervisor**

---

## 2. Gerenciamento de Equipe

### Níveis de Acesso

| Role | Descrição | Permissões |
|------|-----------|------------|
| **Owner** | Proprietário | Acesso total + deletar empresa |
| **Admin** | Administrador | Acesso total |
| **Supervisor** | Supervisor BPO | Operações + aprovações |
| **Operator** | Operador BPO | Operações básicas |
| **Viewer** | Visualizador | Apenas consulta |

### Convidar Novo Membro

1. **Equipe → Convidar Usuário**
2. Digite email
3. Selecione uma ou mais empresas
4. Defina role para cada empresa
5. Envie convite

O convidado receberá um email com link de cadastro.

### Alterar Permissões

1. **Equipe → Localizar membro**
2. Clique no menu da empresa
3. Selecione nova role
4. Confirme alteração

### Remover Acesso

1. **Equipe → Localizar membro**
2. Clique no menu da empresa
3. Selecione **Remover acesso**
4. Confirme remoção

---

## 3. Configurações do Sistema

### Regras de IA

Configure regras automáticas para classificação:

1. **Configurações → Regras de IA**
2. Clique em **Nova Regra**
3. Defina condições (ex: descrição contém "ENERGIA")
4. Defina ações (ex: categoria = Energia Elétrica)
5. Defina prioridade
6. Ative a regra

### Integrações

#### ClickUp
- Sincronize tarefas com ClickUp
- Configure em **Configurações → ClickUp**

#### Omie
- Importe dados do Omie ERP
- Configure API Key e Secret

#### ZAPI (WhatsApp)
- Receba documentos via WhatsApp
- Configure token e instância

---

## 4. Auditoria e Segurança

### Logs de Auditoria

Monitore todas as ações do sistema:

1. **Configurações → Logs de Auditoria**
2. Filtre por:
   - Usuário
   - Tabela afetada
   - Período
   - Tipo de ação

### Períodos de Auditoria

Trave períodos após validação:

1. **Gestão Financeira → Auditoria BPO**
2. Selecione empresa e período
3. Revise transações
4. Clique em **Fechar Período**
5. Período fica somente-leitura

---

## 5. Troubleshooting

### Usuário não consegue acessar

1. Verifique se tem role ativa na empresa
2. Confira se convite foi aceito
3. Verifique permissões da página

### Dados não aparecem

1. Verifique empresa selecionada no filtro
2. Confira período de competência
3. Verifique se dados foram importados

### Erro de permissão

1. Usuário precisa role adequada
2. Admin pode alterar em **Equipe**

---

## Suporte

- Email: suporte@fullbpo.com.br
- WhatsApp: (XX) XXXXX-XXXX
