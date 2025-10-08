# PRD - Product Requirements Document
## Plataforma BPO Financeiro com IA e WhatsApp

**Versão:** 1.0  
**Data:** 2025-10-08  
**Status:** Em Desenvolvimento

---

## 1. Visão Geral do Produto

### 1.1 Propósito
Plataforma de gestão financeira para empresas de BPO que automatiza a classificação, organização e processamento de demandas financeiras recebidas via WhatsApp, utilizando Inteligência Artificial para extrair contexto e classificar informações.

### 1.2 Problema Resolvido
- **Sobrecarga manual:** Equipes de BPO recebem grande volume de documentos e solicitações via WhatsApp que precisam ser classificados manualmente
- **Perda de contexto:** Documentos chegam sem contexto claro, exigindo ida e volta com clientes
- **Dispersão de informações:** Dados espalhados entre WhatsApp, planilhas e sistemas diversos
- **Falta de automação:** Processos repetitivos consomem tempo da equipe

### 1.3 Solução Proposta
Plataforma integrada que:
- Recebe mensagens e documentos via WhatsApp (Z-API)
- Classifica automaticamente usando IA (GPT-5-mini) em: Contas a Pagar, Cobranças, Faturamento, Reconciliação ou Tarefas
- Extrai dados contextuais de documentos (boletos, notas fiscais, comprovantes)
- Gerencia todo o ciclo de vida das demandas financeiras
- Aplica regras de negócio personalizadas por empresa cliente
- Mantém isolamento multi-tenant entre empresas

---

## 2. Objetivos de Negócio

### 2.1 Objetivos Primários
1. **Reduzir em 70% o tempo de classificação manual** de documentos financeiros
2. **Aumentar precisão de classificação para 90%+** através de aprendizado de regras por empresa
3. **Centralizar gestão financeira** em plataforma única, eliminando ferramentas dispersas
4. **Escalar operação** sem aumento proporcional de headcount

### 2.2 Métricas de Sucesso (KPIs)
- Tempo médio de processamento de documento: < 30 segundos
- Taxa de classificação automática correta: > 90%
- Redução de retrabalho: -60%
- NPS da equipe interna: > 8/10
- Adoção da plataforma: 100% da equipe em 3 meses

---

## 3. Stakeholders

### 3.1 Usuários Primários
- **Operadores Financeiros:** Processam contas a pagar, faturamento e cobranças
- **Supervisores:** Monitoram equipe, aprovam ações e geram relatórios
- **Administradores:** Configuram empresas, regras de negócio e usuários

### 3.2 Usuários Secundários
- **Clientes (Empresas):** Enviam demandas via WhatsApp
- **Contadores/Auditores:** Acessam relatórios e logs de auditoria

### 3.3 Stakeholders Técnicos
- **Time de Desenvolvimento:** Mantém e evolui a plataforma
- **Time de Suporte:** Auxilia usuários e resolve problemas

---

## 4. Arquitetura Técnica

### 4.1 Stack Tecnológico
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **IA:** OpenAI GPT-5-mini via Lovable AI Gateway
- **Integrações:** Z-API (WhatsApp), ClickUp (opcional)
- **Armazenamento:** Supabase Storage (documentos)

### 4.2 Estrutura de Dados Principal
```
companies (empresas cliente)
├── profiles (usuários do sistema)
├── contacts (contatos WhatsApp)
├── messages (mensagens WhatsApp)
├── suggested_actions (ações sugeridas pela IA)
├── contas_pagar (contas a pagar)
├── faturas (faturamento)
├── internal_tasks (tarefas internas)
├── transactions (reconciliação bancária)
├── document_analysis (análises de documentos)
└── transaction_rules (regras de negócio)
```

### 4.3 Multi-Tenancy
- **Chave:** `company_id` em todas as tabelas transacionais
- **Isolamento:** Row Level Security (RLS) com função `has_company_access()`
- **Perfil:** Cada usuário vinculado a uma empresa via `profiles.company_id`

---

## 5. Módulos Funcionais

### 5.1 WhatsApp Interface
**Status:** ✅ Implementado (90%)

**Funcionalidades:**
- Listagem de conversas ativas
- Chat em tempo real com histórico
- Fila de atendimento (queue)
- Envio de mensagens e arquivos
- Integração bidirecional com Z-API

**Fluxo:**
1. Cliente envia mensagem/documento via WhatsApp
2. Webhook Z-API chama `zapi-webhook` edge function
3. Mensagem armazenada em `messages`
4. IA analisa via `analyze-message` edge function
5. Ação sugerida criada em `suggested_actions`

**Pontos de Atenção:**
- Implementar indicadores de "digitando..."
- Adicionar notificações em tempo real
- Melhorar busca de conversas

---

### 5.2 Ações Sugeridas (IA)
**Status:** ⚠️ Parcialmente Implementado (40%)

**Objetivo:** Centralizar todas as sugestões da IA para revisão e aprovação

**Tipos de Ação:**
- `payment` → Contas a Pagar
- `invoice` → Faturamento
- `task` → Tarefas Internas
- `document_analysis` → Análise de Documento
- `collection` → Cobranças (futuro)

**Funcionalidades Necessárias:**
- ✅ Backend: `suggested_actions` table + hooks
- ✅ Backend: Edge functions de processamento
- ❌ **Frontend: Interface rica de revisão** (CRÍTICO)
  - Tabela com filtros (status, tipo, prioridade, data)
  - Modal de detalhes com dados extraídos
  - Botões de ação: Aprovar, Rejeitar, Ignorar, Editar
  - Operações em lote (múltiplas ações)
  - Contadores dinâmicos por categoria
- ❌ Edição de dados antes de aprovar
- ❌ Feedback visual de progresso
- ❌ Histórico de decisões

**Fluxo Ideal:**
1. IA gera ação sugerida (ex: detecta boleto em mensagem)
2. Operador visualiza na página `/suggested-actions`
3. Operador revisa dados extraídos (vencimento, valor, fornecedor)
4. Operador edita se necessário e aplica regras de negócio
5. Operador aprova → Sistema cria registro em `contas_pagar`
6. Ação marcada como `completed`

---

### 5.3 Contas a Pagar
**Status:** ✅ Implementado (80%)

**Funcionalidades:**
- Listagem de contas com filtros (status, vencimento, fornecedor)
- Criação manual de contas
- Upload de boletos/documentos
- Marcação de pagamento
- Histórico de alterações

**Integrações:**
- IA extrai dados de boletos via `process-document`
- Regras classificam automaticamente categoria/centro de custo
- Ações sugeridas alimentam contas

**Melhorias Necessárias:**
- ❌ Upload drag-and-drop de documentos
- ❌ Agendamento de pagamentos recorrentes
- ❌ Aprovações multi-nível (workflows)
- ❌ Exportação para sistemas contábeis

---

### 5.4 Faturamento (Cobranças)
**Status:** ✅ Implementado (75%)

**Funcionalidades:**
- Criação de faturas
- Envio de cobranças via WhatsApp
- Controle de status (pendente, pago, vencido)
- Relatórios de inadimplência

**Integrações:**
- IA identifica pedidos de fatura em mensagens
- Geração automática de PDFs
- Envio automatizado via WhatsApp

**Melhorias Necessárias:**
- ❌ Templates personalizáveis de fatura
- ❌ Integração com gateways de pagamento
- ❌ Lembretes automáticos de vencimento
- ❌ Portal do cliente para visualização

---

### 5.5 Reconciliação Bancária
**Status:** ✅ Implementado (70%)

**Funcionalidades:**
- Import de arquivos OFX
- Classificação automática de transações via IA
- Conciliação manual de lançamentos
- Regras de classificação personalizadas

**Edge Functions:**
- `ingest-ofx`: Processa arquivo OFX
- `classify-transaction`: Classifica transação via IA

**Melhorias Necessárias:**
- ❌ Sugestões de conciliação (matching)
- ❌ Dashboard de saldos em tempo real
- ❌ Alertas de divergências

---

### 5.6 Tarefas Internas
**Status:** ✅ Implementado (85%)

**Funcionalidades:**
- Kanban de tarefas (Backlog, Em Progresso, Revisão, Concluído)
- Atribuição de responsáveis
- Priorização (baixa, média, alta)
- Criação via WhatsApp (IA identifica solicitações)
- Integração opcional com ClickUp

**Fluxo IA:**
1. Cliente envia: "Preciso de ajuda com relatório fiscal"
2. IA classifica como `task`
3. Ação sugerida criada
4. Operador aprova → Task criada no kanban
5. Task vinculada à conversa do WhatsApp

---

### 5.7 Análise de Documentos
**Status:** ✅ Implementado (90%)

**Funcionalidades:**
- Análise automática de PDFs, imagens e áudios
- Extração de texto via OCR (OpenAI Vision)
- Transcrição de áudios (Whisper)
- Armazenamento de análises em `document_analysis`

**Edge Function:**
- `process-document`: Processa múltiplos formatos

**Melhorias Necessárias:**
- ❌ UI para upload manual em todos os módulos
- ❌ Preview de documentos analisados
- ❌ Versionamento de análises

---

### 5.8 Empresas & Contatos
**Status:** ✅ Implementado (60%)

**Funcionalidades Atuais:**
- CRUD de empresas cliente
- CRUD de contatos
- Vinculação `contact → company`

**Problemas Identificados:**
- ⚠️ Falta Foreign Key: `contacts.empresa_id` não referencia `companies.id`
- ⚠️ Inconsistência: algumas tabelas usam `empresa_id`, outras `company_id`

**Melhorias Necessárias:**
- ❌ Configuração de regras de negócio por empresa
- ❌ Templates de classificação por segmento
- ❌ Dashboard de uso por empresa (multi-tenant admin)
- ❌ Importação em lote de contatos

---

### 5.9 Configurações & Administração
**Status:** ✅ Implementado (50%)

**Funcionalidades Atuais:**
- Perfil de usuário
- Configurações de IA (temperatura, modelo)
- Integração ClickUp

**Melhorias Necessárias:**
- ❌ **Sistema de Roles Seguro** (CRÍTICO)
  - Criar `user_roles` table com enum `app_role`
  - Migrar de `profiles.role` (inseguro)
  - Implementar função `has_role()` com SECURITY DEFINER
  - Atualizar RLS policies
- ❌ Gestão de permissões granulares
- ❌ Configuração de webhooks e integrações
- ❌ Gerenciamento de regras de negócio (UI)

---

### 5.10 Relatórios & Auditoria
**Status:** ✅ Implementado (65%)

**Funcionalidades:**
- Relatórios de IA (métricas de uso)
- Geração de PDFs customizados
- Logs de auditoria (`audit_logs`)

**Melhorias Necessárias:**
- ❌ Filtros avançados em audit logs
- ❌ Exportação de relatórios (Excel, CSV)
- ❌ Dashboards executivos
- ❌ Rastreabilidade completa (quem fez o quê, quando)

---

## 6. Inteligência Artificial

### 6.1 Modelo Utilizado
- **Atual:** OpenAI GPT-5-mini
- **Gateway:** Lovable AI Gateway
- **Custo:** Gratuito (Gemini models até 13/10/2025)

### 6.2 Casos de Uso
1. **Classificação de Mensagens:** Identifica tipo de demanda (payment/invoice/task/document)
2. **Extração de Dados:** Captura informações estruturadas de documentos
3. **Análise de Contexto:** Relaciona mensagens com empresas e contatos
4. **Classificação de Transações Bancárias:** Categoriza lançamentos OFX
5. **Sugestão de Ações:** Propõe ações baseadas em regras e histórico

### 6.3 Regras de Negócio
**Localização:** `transaction_rules` table

**Estrutura:**
- `company_id`: Empresa cliente
- `rule_name`: Nome da regra
- `rule_type`: Tipo (classification, routing, validation)
- `conditions`: JSON com condições
- `actions`: JSON com ações a executar
- `priority`: Ordem de aplicação

**Exemplo de Regra:**
```json
{
  "conditions": {
    "message_contains": ["boleto", "conta de luz"],
    "sender_company": "Empresa X"
  },
  "actions": {
    "classify_as": "payment",
    "category": "Utilities",
    "cost_center": "Administrativo",
    "priority": "high"
  }
}
```

**Melhorias Necessárias:**
- ❌ UI para criação/edição de regras
- ❌ Templates pré-definidos por segmento
- ❌ Importação/exportação de regras
- ❌ Teste de regras antes de ativar
- ❌ Histórico de aplicação de regras

---

## 7. Segurança & Compliance

### 7.1 Autenticação
- **Sistema:** Supabase Auth
- **Métodos:** Email/senha (atual)
- **Melhorias Necessárias:**
  - ❌ Autenticação via Google/Microsoft
  - ❌ 2FA (Two-Factor Authentication)
  - ❌ SSO para clientes enterprise

### 7.2 Autorização (CRÍTICO - VULNERABILIDADE ATUAL)
**Problema Identificado:**
- ⚠️ `profiles.role` armazena roles diretamente (inseguro)
- ⚠️ Sujeito a ataques de escalação de privilégios
- ⚠️ Não utiliza SECURITY DEFINER para bypass de RLS

**Solução Requerida (Fase 1 - Prioridade MÁXIMA):**
1. Criar enum `app_role` ('owner', 'admin', 'operator', 'viewer')
2. Criar table `user_roles` com FK para `auth.users`
3. Criar função `has_role(_user_id, _role)` com SECURITY DEFINER
4. Migrar dados existentes
5. Atualizar todas as RLS policies
6. Remover `profiles.role`

### 7.3 Multi-Tenancy (Isolamento de Dados)
**Status:** ✅ Implementado (85%)

**Mecanismo:**
- `company_id` em todas as tabelas críticas
- RLS policies com `has_company_access(auth.uid(), company_id)`
- Função `get_current_company_id()` retorna empresa do usuário logado

**Tabelas Protegidas:**
- ✅ `profiles`, `contacts`, `messages`, `suggested_actions`
- ✅ `contas_pagar`, `faturas`, `internal_tasks`
- ✅ `document_analysis`, `transactions`

**Melhorias Necessárias:**
- ❌ Adicionar FK: `contacts.empresa_id` → `companies.id`
- ❌ Validação em edge functions (verificar company_id nos payloads)
- ❌ Auditoria de acessos cross-company

### 7.4 LGPD/GDPR Compliance
**Status:** ⚠️ Parcial

**Implementado:**
- ✅ Logs de auditoria (`audit_logs`)
- ✅ Soft delete em alguns módulos

**Necessário:**
- ❌ Anonimização de dados de contatos inativos
- ❌ Exportação de dados pessoais (direito do usuário)
- ❌ Exclusão completa de dados (direito ao esquecimento)
- ❌ Consentimento explícito para processamento de dados
- ❌ Política de retenção de dados

---

## 8. Fluxos Críticos

### 8.1 Fluxo: Recebimento de Boleto via WhatsApp

**Atores:** Cliente, Sistema (IA), Operador

**Passos:**
1. Cliente envia foto/PDF de boleto via WhatsApp
2. Z-API webhook entrega mensagem → `zapi-webhook` edge function
3. Mensagem armazenada em `messages` table
4. `analyze-message` edge function é invocada
5. IA detecta tipo: `document_analysis`
6. `process-document` edge function é invocada
   - OpenAI Vision extrai: código de barras, valor, vencimento, beneficiário
7. `suggested_action` criada com `action_type = 'payment'`
8. Operador visualiza em `/suggested-actions`
9. Operador revisa dados, aplica regra de negócio (categoria, centro de custo)
10. Operador aprova → `create-payment` edge function cria registro em `contas_pagar`
11. Ação marcada como `completed`
12. Sistema envia confirmação via WhatsApp ao cliente

**Tempo Esperado:** < 2 minutos (do envio até aprovação)

---

### 8.2 Fluxo: Criação de Tarefa via Mensagem

**Atores:** Cliente, Sistema (IA), Operador

**Passos:**
1. Cliente: "Preciso enviar declaração de IR até sexta"
2. Z-API → `zapi-webhook` → `messages`
3. `analyze-message` detecta tipo: `task`
4. `suggested_action` criada com:
   - `action_type = 'task'`
   - `extracted_data = { title, description, deadline, priority }`
5. Operador visualiza e aprova
6. `create-task` edge function cria task em `internal_tasks`
7. Task aparece no kanban
8. Responsável é notificado
9. Cliente recebe confirmação via WhatsApp

---

### 8.3 Fluxo: Reconciliação Bancária

**Atores:** Contador, Sistema (IA)

**Passos:**
1. Contador faz upload de arquivo OFX em `/reconciliation`
2. `ingest-ofx` edge function processa arquivo
3. Transações inseridas em `transactions` table
4. Para cada transação não classificada:
   - `classify-transaction` edge function invoca IA
   - IA aplica regras de negócio da empresa
   - IA sugere categoria/centro de custo
5. Contador revisa classificações sugeridas
6. Contador aprova ou corrige manualmente
7. Sistema aprende com correções (futuro: ajuste de regras)

---

## 9. Roadmap

### 🔴 Fase 1: Segurança & Fundação (CRÍTICO)
**Prazo:** 1 semana  
**Esforço:** 3-4 horas

**Entregas:**
- [ ] Sistema de roles seguro (`user_roles` + `has_role()`)
- [ ] Foreign Keys corrigidas (`contacts.empresa_id` → `companies.id`)
- [ ] Validação de `company_id` em edge functions

**Bloqueador:** Sem isso, sistema vulnerável a escalação de privilégios

---

### 🟡 Fase 2: Completar Ações Sugeridas (Alta Prioridade)
**Prazo:** 1-2 semanas  
**Esforço:** 4-5 horas

**Entregas:**
- [ ] Interface rica: tabela com filtros, modal detalhado
- [ ] Botões de ação: Aprovar, Rejeitar, Ignorar, Editar
- [ ] Operações em lote (múltiplas ações)
- [ ] Contadores dinâmicos por status/tipo
- [ ] Edição de `extracted_data` antes de aprovar

**Impacto:** Torna o módulo de IA 100% funcional e utilizável

---

### 🟢 Fase 3: Regras de Negócio & Automação (Média Prioridade)
**Prazo:** 2-3 semanas  
**Esforço:** 3-4 horas

**Entregas:**
- [ ] UI para gerenciar regras em Configurações → Empresa
- [ ] Templates de classificação por segmento
- [ ] Integração de regras com `analyze-message`
- [ ] Logs de aplicação de regras
- [ ] Importar/exportar regras

**Impacto:** Aumenta precisão de classificação automática para 90%+

---

### 🔵 Fase 4: UX de Upload de Documentos (Baixa Prioridade)
**Prazo:** 1 semana  
**Esforço:** 2-3 horas

**Entregas:**
- [ ] Storage bucket `documents` com RLS
- [ ] Componente `DocumentUploader.tsx` reutilizável
- [ ] Integração em Contas a Pagar e Faturamento
- [ ] Preview de documentos

**Impacto:** Melhora experiência de uso, reduz fricção

---

### 📈 Fase 5: Performance & Escalabilidade (Contínuo)
**Prazo:** Ongoing  
**Esforço:** 1-2 horas/mês

**Entregas:**
- [ ] Índices de banco otimizados
- [ ] Caching de perfis e dados frequentes
- [ ] Dashboard de monitoramento de IA (tokens, custos)
- [ ] Alertas de falhas em edge functions
- [ ] Testes de carga

---

## 10. Perguntas Abertas (Decisões Necessárias)

### 10.1 Autenticação & Onboarding
**Pergunta:** Como novos usuários e empresas entram na plataforma?

**Opções:**
- A) Admin master cria empresas e usuários (modelo atual)
- B) Self-service: empresas se cadastram e convidam usuários
- C) Híbrido: onboarding assistido + gestão interna

**Decisão Necessária:** Definir fluxo de onboarding

---

### 10.2 Roles & Permissões
**Pergunta:** Quais papéis devem existir?

**Proposta Inicial:**
- `owner`: Dono da empresa BPO (acesso total, multi-tenant)
- `admin`: Administrador de empresa cliente (gerencia sua empresa)
- `operator`: Operador financeiro (processa demandas)
- `viewer`: Apenas visualização (contadores, auditores)

**Decisão Necessária:** Validar roles e permissões por módulo

---

### 10.3 Billing & Limites
**Pergunta:** Existe cobrança por empresa? Como controlar uso?

**Cenários:**
- A) Modelo SaaS: cobrança por empresa (planos: básico, pro, enterprise)
- B) Uso interno: sem cobrança, mas controle de limites (mensagens/mês, storage)
- C) Híbrido: gratuito para clientes internos, pago para externos

**Decisão Necessária:** Definir modelo de monetização

---

### 10.4 Prioridade Imediata
**Pergunta:** O que é mais urgente AGORA?

**Opções:**
- A) Fase 1 (Segurança) - Resolver vulnerabilidades críticas
- B) Fase 2 (Ações Sugeridas) - Tornar IA 100% funcional
- C) Ambas em paralelo (2 desenvolvedores)

**Decisão Necessária:** Definir o que atacar primeiro

---

## 11. Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Escalação de privilégios (role inseguro) | Alta | Crítico | Implementar Fase 1 imediatamente |
| IA classificar incorretamente | Média | Médio | Sistema de revisão + regras de negócio |
| Perda de mensagens WhatsApp | Baixa | Alto | Retry mechanism + logs detalhados |
| Sobrecarga de custos com IA | Média | Médio | Monitoramento + limites por empresa |
| Vazamento de dados entre empresas | Baixa | Crítico | Auditoria de RLS + testes automatizados |

---

## 12. Definição de Sucesso

### Curto Prazo (1 mês)
- [ ] Sistema de roles seguro implementado
- [ ] Interface de Ações Sugeridas 100% funcional
- [ ] 100% da equipe usando a plataforma diariamente
- [ ] 70% das mensagens classificadas automaticamente

### Médio Prazo (3 meses)
- [ ] 90% de precisão na classificação automática
- [ ] Redução de 60% no tempo de processamento
- [ ] 5+ empresas cliente gerenciadas simultaneamente
- [ ] Zero incidentes de segurança

### Longo Prazo (6 meses)
- [ ] 20+ empresas cliente ativas
- [ ] ROI positivo (economia de tempo > custo da plataforma)
- [ ] Módulo de cobranças automatizado
- [ ] Portal do cliente para self-service

---

## 13. Anexos

### 13.1 Glossário
- **BPO:** Business Process Outsourcing
- **RLS:** Row Level Security (Supabase)
- **Edge Function:** Função serverless (Deno)
- **Multi-tenant:** Múltiplas empresas isoladas na mesma aplicação
- **Z-API:** Serviço de integração com WhatsApp

### 13.2 Links Úteis
- Repositório: [Interno]
- Documentação Técnica: `DOCUMENTACAO_TECNICA.md`
- Supabase Dashboard: [Link]
- Z-API Dashboard: [Link]

---

**Documento criado por:** IA Assistant  
**Última atualização:** 2025-10-08  
**Próxima revisão:** Após definição de decisões abertas (seção 10)
