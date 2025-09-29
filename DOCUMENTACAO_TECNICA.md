# Documentação Técnica - FullBPO Analytics

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Setup e Instalação](#setup-e-instalação)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Componentes Principais](#componentes-principais)
6. [Edge Functions](#edge-functions)
7. [Banco de Dados](#banco-de-dados)
8. [Fluxos de Negócio](#fluxos-de-negócio)
9. [Integrações](#integrações)
10. [Deploy](#deploy)

---

## 🎯 Visão Geral

**FullBPO Analytics** é uma plataforma SaaS de gestão empresarial com automação via IA, desenvolvida com React + Supabase.

### Stack Tecnológico

**Frontend:**
- React 18.3.1 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router 6.26.2
- TanStack Query 5.56.2
- React Hook Form + Zod

**Backend:**
- Supabase (PostgreSQL + Edge Functions)
- Deno runtime para Edge Functions
- Row Level Security (RLS)

**Integrações:**
- OpenAI (GPT-4o, Whisper)
- Z-API (WhatsApp Business)
- ClickUp (gestão de tarefas)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │ WhatsApp │  │Financial │  │  Tasks  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓ (Supabase Client SDK)
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │PostgreSQL│  │   Auth   │  │ Storage  │  │   Edge  │ │
│  │   + RLS  │  │          │  │          │  │Functions│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              External Integrations                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  OpenAI  │  │  Z-API   │  │ ClickUp  │              │
│  │(GPT-4o)  │  │(WhatsApp)│  │  (Tasks) │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Usuário interage** com o frontend React
2. **Frontend** faz chamadas ao Supabase via SDK
3. **RLS policies** validam permissões
4. **Edge Functions** processam lógica complexa/integrações
5. **Webhooks externos** (Z-API) chamam Edge Functions
6. **PostgreSQL** persiste os dados

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js 18+ ou Bun
- Conta Supabase
- Conta OpenAI (para IA)
- Conta Z-API (para WhatsApp)
- Conta ClickUp (opcional)

### Variáveis de Ambiente

**Frontend** (não precisa de .env, usa valores diretos):
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://insncccrxgsvaxxkzjws.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGci...";
```

**Edge Functions** (Supabase Secrets):
```bash
# Obrigatórios
OPENAI_API_KEY=sk-...
ZAPI_INSTANCE_ID=...
ZAPI_TOKEN=...

# Opcionais
CLICKUP_API_KEY=...
OMIE_APP_KEY=...
OMIE_APP_SECRET=...
```

### Instalação

```bash
# Clone o projeto (via GitHub export do Lovable)
git clone <repo-url>
cd fullbpo-analytics

# Instale dependências
npm install
# ou
bun install

# Execute em desenvolvimento
npm run dev
# ou
bun dev
```

### Deploy Edge Functions

```bash
# Instale Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref insncccrxgsvaxxkzjws

# Deploy todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy analyze-message
```

---

## 📁 Estrutura de Pastas

```
fullbpo-analytics/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # shadcn/ui components
│   │   ├── common/         # Componentes reutilizáveis
│   │   ├── dashboard/      # Widgets do dashboard
│   │   ├── whatsapp/       # Interface WhatsApp
│   │   ├── companies/      # Gestão de empresas
│   │   ├── contacts/       # Gestão de contatos
│   │   ├── finance/        # Módulo financeiro
│   │   ├── tasks/          # Gestão de tarefas
│   │   ├── settings/       # Configurações
│   │   ├── reports/        # Relatórios
│   │   └── layout/         # Layouts (Sidebar, MainLayout)
│   ├── contexts/           # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── SidebarContext.tsx
│   │   └── WhatsAppContext.tsx
│   ├── hooks/              # Custom Hooks
│   │   ├── handlers/       # Event handlers
│   │   ├── useAuth.ts
│   │   ├── useCompanies.ts
│   │   ├── useContacts.ts
│   │   ├── useMessages.ts
│   │   ├── useSuggestedActions.ts
│   │   ├── useDocumentAnalysis.ts
│   │   └── ...
│   ├── pages/              # Páginas/Rotas
│   │   ├── Index.tsx       # Dashboard
│   │   ├── Auth.tsx        # Login/Signup
│   │   ├── PayablesPage.tsx
│   │   ├── InvoicesPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── AnalysisPage.tsx
│   │   ├── SuggestedActionsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── whatsapp/       # Rotas WhatsApp
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts   # Cliente Supabase
│   │       └── types.ts    # Types auto-gerados
│   ├── lib/
│   │   └── utils.ts        # Utilidades
│   ├── utils/
│   │   └── pdfGenerator.ts # Geração de PDFs
│   ├── App.tsx             # App principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── analyze-message/
│   │   ├── process-document/
│   │   ├── zapi-webhook/
│   │   ├── send-whatsapp-message/
│   │   ├── create-task/
│   │   ├── clickup-sync/
│   │   ├── ingest-ofx/
│   │   └── classify-transaction/
│   ├── migrations/         # Migrações SQL
│   └── config.toml         # Config do Supabase
├── public/                 # Assets estáticos
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🧩 Componentes Principais

### Layout e Navegação

#### `MainLayout.tsx`
Wrapper principal que inclui Sidebar e lógica de logout.

```typescript
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebarContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Top bar com logout */}
        {/* Content */}
        {children}
      </main>
    </div>
  );
};
```

#### `Sidebar.tsx`
Menu lateral colapsável com navegação principal.

**Features:**
- Modo expandido (w-64) e mini (w-20)
- Seções expansíveis (Gestão Financeira, IA, WhatsApp)
- Detecção de rota ativa
- Toggle de collapse

**Estrutura de menu:**
```typescript
const coreMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'companies', label: 'Empresas', icon: Building2, path: '/' },
];

const financialSubmenu = [
  { id: 'payables', label: 'Contas a Pagar', icon: Receipt, path: '/payables' },
  { id: 'invoices', label: 'Faturamento', icon: FileStack, path: '/invoices' },
];

const aiSubmenu = [
  { id: 'suggested-actions', label: 'Ações Sugeridas', icon: Lightbulb, path: '/suggested-actions' },
  { id: 'reports', label: 'Relatórios de IA', icon: BarChart3, path: '/reports' },
  { id: 'document-analysis', label: 'Análise', icon: FileSearch, path: '/analysis' },
];

const whatsappSubmenu = [
  { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/whatsapp/chats' },
  { id: 'fila', label: 'Fila', icon: ListTodo, path: '/whatsapp/fila' },
  { id: 'contatos', label: 'Contatos', icon: UserCircle, path: '/whatsapp/contatos' },
];
```

### Dashboard

#### `Dashboard.tsx`
Página principal com métricas e gráficos.

```typescript
export const Dashboard = () => {
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { sentimentStats } = useSentimentAnalysis();
  const { messages } = useMessages();
  const { taskGroups } = useTaskGroups();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* AI Metrics Cards */}
      <AIMetricsCards />
      
      {/* Business Widgets */}
      <DashboardWidgets
        contacts={contacts}
        companies={companies}
        sentimentStats={sentimentStats}
        messages={messages}
        taskGroups={taskGroups}
      />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIActionsChart />
        <SentimentChart />
        <RecentContacts />
      </div>
    </div>
  );
};
```

#### `AIMetricsCards.tsx`
Cards de métricas da IA.

```typescript
export const AIMetricsCards = () => {
  const { data: metrics, isLoading } = useAIMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Ações Sugeridas Hoje"
        value={metrics?.todaySuggestions || 0}
        icon={Lightbulb}
        trend={+12}
      />
      <MetricCard
        title="Taxa de Aprovação"
        value={`${metrics?.approvalRate || 0}%`}
        icon={CheckCircle}
      />
      <MetricCard
        title="Tempo Economizado"
        value={`${metrics?.timeSaved || 0}h`}
        icon={Clock}
      />
      <MetricCard
        title="Total de Ações"
        value={metrics?.totalActions || 0}
        icon={Zap}
      />
    </div>
  );
};
```

### WhatsApp

#### `WhatsAppLayout.tsx`
Layout específico para rotas do WhatsApp.

```typescript
export const WhatsAppLayout = () => {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <div className="p-6">
          <Outlet /> {/* Renderiza ChatsPage, QueuePage ou ContactsPage */}
        </div>
      </main>
    </div>
  );
};
```

#### `ChatsPage.tsx`
Interface de chat com conversas.

**Estrutura:**
- Lista de conversas (esquerda)
- Janela de chat (centro)
- Informações do contato (direita, opcional)

#### `QueuePage.tsx`
Kanban de atendimento por status.

**Colunas:**
- Aguardando
- Em Atendimento
- Resolvido
- Arquivado

#### `MessageInput.tsx`
Input de mensagem com envio.

```typescript
export const MessageInput = ({ contactId }: { contactId: string }) => {
  const { sendMessage, isSending } = useSendMessage();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage({ contactId, message });
    setMessage('');
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Digite sua mensagem..."
      />
      <Button onClick={handleSend} disabled={isSending}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

### Financeiro

#### `PayablesPage.tsx`
Gestão de contas a pagar.

**Features:**
- Tabela com filtros
- Criação manual ou via IA
- Upload de comprovante
- Categorização
- Dashboard de métricas

#### `InvoicesPage.tsx`
Gestão de faturas/NF-e.

**Features:**
- Geração de PDF
- Upload de XML/PDF da NF-e
- Vinculação com ações sugeridas

#### `TransactionsTable.tsx`
Tabela de transações bancárias importadas.

### Análise

#### `AnalysisPage.tsx`
Interface de análise de documentos.

```typescript
export default function AnalysisPage() {
  const { analyses, isLoading, processDocument, isProcessing } = useDocumentAnalysis();
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'audio'>('image');

  const handleProcess = () => {
    processDocument({ file_url: fileUrl, file_type: fileType, file_name: fileName });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>Total: {analyses.length}</Card>
        <Card>PDFs: {analyses.filter(a => a.file_type === 'pdf').length}</Card>
        <Card>Imagens: {analyses.filter(a => a.file_type === 'image').length}</Card>
        <Card>Áudios: {analyses.filter(a => a.file_type === 'audio').length}</Card>
      </div>

      {/* Upload Form */}
      <Card>
        <Input placeholder="Nome do arquivo" value={fileName} onChange={...} />
        <Input placeholder="URL do arquivo" value={fileUrl} onChange={...} />
        <Select value={fileType} onChange={...}>
          <option value="image">Imagem</option>
          <option value="pdf">PDF</option>
          <option value="audio">Áudio</option>
        </Select>
        <Button onClick={handleProcess}>Processar</Button>
      </Card>

      {/* Analyses Table */}
      <Card>
        <Table>
          {analyses.map(analysis => (
            <TableRow key={analysis.id}>
              <TableCell>{analysis.file_name}</TableCell>
              <TableCell>{analysis.summary}</TableCell>
              <TableCell>{analysis.created_at}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  );
}
```

---

## 🔌 Edge Functions

### 1. `analyze-message`

**Rota:** `/functions/v1/analyze-message`

**Objetivo:** Analisa mensagens do WhatsApp e cria ações sugeridas.

**Input:**
```typescript
{
  message: string;
  contact_id: string;
  message_id: string;
  has_media?: boolean;
  media_type?: 'image' | 'audio' | 'document' | 'video';
  media_url?: string;
  media_mime_type?: string;
  media_caption?: string;
}
```

**Lógica:**
1. Chama OpenAI GPT-4o-mini para analisar a mensagem
2. Identifica tipo de ação necessária (create_payable, create_invoice, create_task, etc.)
3. Extrai dados estruturados (valor, data, descrição, etc.)
4. Cria registro em `suggested_actions`
5. Se anexo detectado, cria `document_analysis` action
6. Se auto-processamento ativo, chama `process-document`

**Output:**
```typescript
{
  success: boolean;
  action_id?: string;
  action_type?: string;
  confidence?: number;
  extracted_data?: object;
}
```

**Prompt da IA:**
```typescript
const systemPrompt = `Você é um assistente que analisa mensagens de clientes e identifica ações necessárias.

Tipos de ação disponíveis:
- create_payable: Cliente enviou conta/boleto para pagar
- create_invoice: Cliente solicitou NF ou precisa faturar
- create_task: Cliente solicitou tarefa/atividade
- schedule_meeting: Cliente quer agendar reunião
- document_analysis: Cliente enviou documento para analisar
- general_inquiry: Pergunta geral

Extraia sempre:
- Tipo de ação (action_type)
- Dados relevantes (valores, datas, nomes, descrições)
- Nível de confiança (0-100)
- Prioridade (low, normal, high, urgent)

Retorne JSON estruturado.`;
```

### 2. `process-document`

**Rota:** `/functions/v1/process-document`

**Objetivo:** Processa documentos (PDF, imagem, áudio) com IA.

**Input:**
```typescript
{
  file_url: string;
  file_type: 'pdf' | 'image' | 'audio';
  file_name: string;
  suggested_action_id?: string;
  contact_id?: string;
  message_id?: string;
}
```

**Lógica:**

**Para áudios:**
1. Baixa o arquivo de audio
2. Chama Whisper (OpenAI) para transcrever
3. Chama GPT-4o-mini para analisar transcrição
4. Gera resumo

**Para imagens/PDFs:**
1. Chama GPT-4o Vision
2. Extrai texto visível
3. Identifica informações importantes (valores, datas, nomes)
4. Gera resumo estruturado

5. Salva em `document_analysis`
6. Atualiza `suggested_action` se fornecido

**Output:**
```typescript
{
  success: boolean;
  analysis_id: string;
  extracted_text: string;
  summary: string;
}
```

### 3. `zapi-webhook`

**Rota:** `/functions/v1/zapi-webhook` (POST via Z-API)

**Objetivo:** Recebe webhooks de mensagens do WhatsApp.

**Input (da Z-API):**
```json
{
  "messageId": "...",
  "phone": "5511999999999",
  "fromMe": false,
  "text": {
    "message": "Preciso pagar essa conta..."
  },
  "image": {
    "imageUrl": "https://...",
    "mimeType": "image/jpeg"
  },
  "timestamp": 1234567890
}
```

**Lógica:**
1. Valida webhook
2. Extrai dados da mensagem
3. Busca ou cria contato em `contacts`
4. Salva mensagem em `messages`
5. Se não for mensagem do sistema (fromMe=false):
   - Chama `analyze-message` com os dados
6. Retorna 200 OK

### 4. `send-whatsapp-message`

**Rota:** `/functions/v1/send-whatsapp-message`

**Objetivo:** Envia mensagens via Z-API.

**Input:**
```typescript
{
  contact_id: string;
  message: string;
}
```

**Lógica:**
1. Busca telefone do contato
2. Chama Z-API POST /send-text
3. Salva mensagem em `messages` com fromMe=true
4. Retorna sucesso/erro

**Chamada Z-API:**
```typescript
await fetch(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: contactPhone,
    message: messageText
  })
});
```

### 5. `create-task`

**Rota:** `/functions/v1/create-task`

**Objetivo:** Cria tarefa no ClickUp.

**Input:**
```typescript
{
  name: string;
  description: string;
  list_id: string;
  priority?: number;
  due_date?: string;
}
```

**Lógica:**
1. Valida API key do ClickUp
2. Chama ClickUp API POST /list/{list_id}/task
3. Retorna task_id criado

### 6. `clickup-sync`

**Rota:** `/functions/v1/clickup-sync`

**Objetivo:** Sincroniza tarefas do ClickUp para o banco.

**Input:**
```typescript
{
  workspace_id: string;
}
```

**Lógica:**
1. Lista todas as listas do workspace
2. Para cada lista, busca tasks
3. Atualiza/cria registros em `tasks`

### 7. `ingest-ofx`

**Rota:** `/functions/v1/ingest-ofx`

**Objetivo:** Importa arquivo OFX e salva transações.

**Input:**
```typescript
{
  file_content: string; // conteúdo do arquivo OFX
  bank_account_id: string;
}
```

**Lógica:**
1. Parse do arquivo OFX
2. Extrai transações (STMTTRN)
3. Para cada transação:
   - Verifica se já existe (por FITID)
   - Aplica regras de categorização
   - Salva em `bank_transactions`
4. Atualiza `transaction_imports`

### 8. `classify-transaction`

**Rota:** `/functions/v1/classify-transaction`

**Objetivo:** Classifica transação bancária usando regras ou IA.

**Input:**
```typescript
{
  transaction_id: string;
}
```

**Lógica:**
1. Busca transação
2. Verifica regras em `transaction_rules`
3. Se nenhuma regra aplicável, chama OpenAI
4. Atualiza categoria da transação

---

## 🗄️ Banco de Dados

### Schema Completo

#### Tabelas de Negócio

**companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  segmento TEXT,
  status TEXT,
  responsavel TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  valor_mensalidade NUMERIC,
  due_date DATE,
  clickup_workspace_id TEXT,
  omie_company_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**contacts**
```sql
CREATE TABLE contacts (
  id_contact TEXT PRIMARY KEY, -- telefone WhatsApp
  nome TEXT,
  empresa_id UUID REFERENCES companies(id),
  feedback BOOLEAN DEFAULT true,
  status BOOLEAN DEFAULT true,
  is_group BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts for their company"
  ON contacts FOR SELECT
  USING (empresa_id = get_current_company_id() OR empresa_id IS NULL);
```

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  company_id UUID REFERENCES companies(id),
  role TEXT DEFAULT 'owner', -- owner, admin, member
  cargo TEXT,
  ativo BOOLEAN DEFAULT true,
  especialidade TEXT[],
  max_atendimentos_simultaneos INTEGER DEFAULT 5,
  horario_atendimento JSONB DEFAULT '{"inicio": "09:00", "fim": "18:00", "dias": ["segunda", "terca", "quarta", "quinta", "sexta"]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Tabelas de WhatsApp

**messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT, -- ID da mensagem no WhatsApp
  contact_id TEXT,
  conteudo_mensagem TEXT,
  tipo_mensagem TEXT, -- text, image, audio, document, video
  link_arquivo TEXT,
  fromme BOOLEAN DEFAULT false,
  data_hora TIMESTAMP,
  nome_grupo TEXT,
  nome_membro TEXT,
  telefone_membro TEXT,
  status_processamento TEXT, -- pending, analyzed, error
  "workflow.id" TEXT,
  "workflow.name" TEXT,
  "execution.id" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view all messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);
```

**conversation_assignments**
```sql
CREATE TABLE conversation_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'aguardando', -- aguardando, em_atendimento, resolvido, arquivado
  priority TEXT DEFAULT 'media', -- baixa, media, alta, urgente
  tags TEXT[] DEFAULT '{}',
  sla_deadline TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view assignments for their company"
  ON conversation_assignments FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );
```

#### Tabelas Financeiras

**contas_pagar**
```sql
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  beneficiario TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  vencimento DATE NOT NULL,
  pago_em DATE,
  status TEXT DEFAULT 'pendente', -- pendente, pago, atrasado, cancelado
  categoria TEXT, -- aluguel, fornecedores, impostos, etc.
  forma_pagamento TEXT, -- pix, ted, boleto, etc.
  comprovante_url TEXT,
  observacoes TEXT,
  tags TEXT[],
  suggested_action_id UUID REFERENCES suggested_actions(id),
  message_id UUID REFERENCES messages(id),
  contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view payables for their company"
  ON contas_pagar FOR SELECT
  USING (company_id = get_current_company_id());

CREATE POLICY "Users can insert payables for their company"
  ON contas_pagar FOR INSERT
  WITH CHECK (company_id = get_current_company_id() AND user_id = auth.uid());
```

**faturas**
```sql
CREATE TABLE faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  numero_nota TEXT,
  destinatario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  emitida_em TIMESTAMPTZ,
  status TEXT DEFAULT 'pendente', -- pendente, emitida, paga, cancelada
  tipo_nota TEXT, -- entrada, saida
  natureza_operacao TEXT,
  cfop TEXT,
  pdf_url TEXT,
  xml_url TEXT,
  observacoes TEXT,
  tags TEXT[],
  suggested_action_id UUID REFERENCES suggested_actions(id),
  message_id UUID REFERENCES messages(id),
  contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS similar a contas_pagar
```

**bank_transactions**
```sql
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  bank_account_uuid UUID,
  bank_id TEXT,
  account_id TEXT,
  branch_id TEXT,
  acct_type TEXT,
  fitid TEXT, -- ID único da transação no OFX
  type TEXT, -- DEBIT ou CREDIT
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  memo TEXT,
  category TEXT, -- categoria aplicada (manual ou automática)
  import_id UUID REFERENCES transaction_imports(id),
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS similar
```

#### Tabelas de IA

**suggested_actions**
```sql
CREATE TABLE suggested_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT NOT NULL,
  message_id UUID REFERENCES messages(id),
  action_type TEXT NOT NULL, -- create_payable, create_invoice, create_task, etc.
  extracted_data JSONB, -- dados extraídos pela IA
  ai_suggestion TEXT,
  ai_confidence NUMERIC DEFAULT 0, -- 0-100
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  status TEXT DEFAULT 'pending', -- pending, processing, completed, rejected, ignored
  notes TEXT,
  executed_by UUID,
  executed_at TIMESTAMPTZ,
  result_data JSONB, -- resultado da execução (ex: ID do registro criado)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view suggested actions for their company"
  ON suggested_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id_contact = suggested_actions.contact_id
      AND (c.empresa_id = get_current_company_id() OR c.empresa_id IS NULL)
    )
  );
```

**document_analysis**
```sql
CREATE TABLE document_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT NOT NULL, -- pdf, image, audio
  extracted_text TEXT,
  summary TEXT,
  analysis_result JSONB NOT NULL,
  status TEXT DEFAULT 'completed', -- pending, processing, completed, error
  suggested_action_id UUID REFERENCES suggested_actions(id),
  message_id UUID REFERENCES messages(id),
  contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS similar
```

**tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'todo', -- todo, in_progress, done
  prioridade TEXT DEFAULT 'normal', -- low, normal, high, urgent
  prazo DATE,
  responsavel_id UUID REFERENCES profiles(id),
  tags TEXT[],
  observacoes TEXT,
  suggested_action_id UUID REFERENCES suggested_actions(id),
  message_id UUID REFERENCES messages(id),
  contact_id TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS similar
```

#### Funções de Suporte

**get_current_company_id()**
```sql
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;
```

**has_company_access(user_id UUID, company_id UUID)**
```sql
CREATE OR REPLACE FUNCTION has_company_access(user_id UUID, company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND profiles.company_id = company_id
  );
$$ LANGUAGE SQL STABLE;
```

---

## 🔄 Fluxos de Negócio

### Fluxo 1: Mensagem WhatsApp → Ação Sugerida → Registro

```
1. Cliente envia: "Preciso pagar essa conta de R$ 1.500,00, vence dia 15/03"

2. Z-API recebe webhook
   ↓
3. zapi-webhook salva em messages
   ↓
4. zapi-webhook chama analyze-message
   ↓
5. analyze-message:
   - Chama OpenAI GPT-4o-mini
   - Identifica: action_type = "create_payable"
   - Extrai: valor = 1500, vencimento = "2025-03-15"
   - Confiança: 85%
   - Cria registro em suggested_actions
   ↓
6. Frontend (página /suggested-actions):
   - Lista a ação pendente
   - Usuário revisa os dados
   - Usuário clica "Aprovar"
   ↓
7. Frontend:
   - Cria registro em contas_pagar
   - Atualiza suggested_action (status=completed, executed_by, executed_at)
   ↓
8. Conta aparece em /payables
```

### Fluxo 2: Upload de Documento → Análise → Ação

```
1. Usuário acessa /analysis

2. Upload de PDF/imagem/áudio
   - Fornece URL do arquivo
   - Seleciona tipo
   ↓
3. Frontend chama process-document
   ↓
4. process-document:
   - Se áudio: Whisper transcription → GPT-4o-mini análise
   - Se imagem/PDF: GPT-4o Vision
   - Extrai texto e gera resumo
   - Salva em document_analysis
   ↓
5. Resultado exibido em /analysis
   - Texto extraído
   - Resumo
   - Dados estruturados
```

### Fluxo 3: Mensagem com Anexo → Auto-processamento

```
1. Cliente envia imagem de boleto no WhatsApp

2. Z-API webhook com image.imageUrl
   ↓
3. zapi-webhook salva mensagem
   ↓
4. zapi-webhook chama analyze-message com has_media=true
   ↓
5. analyze-message:
   - Detecta anexo
   - Cria suggested_action tipo "document_analysis"
   - Verifica setting "auto_process_documents"
   - Se ativo, seta status="processing" e chama process-document
   ↓
6. process-document:
   - Processa imagem com GPT-4o Vision
   - Extrai valor, vencimento, beneficiário
   - Salva em document_analysis
   - Atualiza suggested_action com result_data
   ↓
7. Frontend:
   - Notificação (futuro): "Documento processado!"
   - Usuário acessa /suggested-actions
   - Revisa dados extraídos
   - Aprova → Cria conta a pagar
```

### Fluxo 4: Importação OFX → Conciliação

```
1. Usuário acessa /payables → "Conciliação"

2. Upload de arquivo OFX
   ↓
3. Frontend chama ingest-ofx
   ↓
4. ingest-ofx:
   - Parse do OFX
   - Extrai transações (STMTTRN)
   - Para cada transação:
     * Verifica duplicata (FITID)
     * Busca regras de categorização (transaction_rules)
     * Se regra encontrada, aplica categoria
     * Se não, deixa sem categoria
     * Salva em bank_transactions
   - Atualiza transaction_imports
   ↓
5. Frontend exibe transações importadas
   ↓
6. Usuário faz matching manual:
   - Seleciona transação bancária
   - Seleciona conta a pagar correspondente
   - Clica "Conciliar"
   - Sistema marca conta como "paga" e vincula transaction_id
   - Salva log em reconciliation_logs
```

---

## 🔗 Integrações

### OpenAI

**Modelos usados:**
- **GPT-4o** (Vision): Análise de imagens/PDFs
- **GPT-4o-mini**: Análise de texto, classificação
- **Whisper**: Transcrição de áudio

**Configuração:**
```typescript
// Edge function
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Exemplo de chamada GPT-4o Vision
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Você é um assistente que analisa documentos...'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analise este documento...' },
          { type: 'image_url', image_url: { url: fileUrl } }
        ]
      }
    ],
  }),
});
```

### Z-API (WhatsApp)

**Endpoints usados:**
- **POST /send-text**: Enviar mensagem de texto
- **POST /send-image**: Enviar imagem
- **Webhook**: Receber mensagens

**Configuração:**
```typescript
const ZAPI_INSTANCE_ID = Deno.env.get('ZAPI_INSTANCE_ID');
const ZAPI_TOKEN = Deno.env.get('ZAPI_TOKEN');

// Enviar mensagem
await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '5511999999999',
    message: 'Olá!'
  })
});

// Configurar webhook (no painel Z-API)
// URL: https://insncccrxgsvaxxkzjws.supabase.co/functions/v1/zapi-webhook
```

### ClickUp

**Endpoints usados:**
- **GET /team**: Listar workspaces
- **GET /team/{team_id}/space**: Listar spaces
- **GET /list/{list_id}/task**: Listar tasks
- **POST /list/{list_id}/task**: Criar task

**Configuração:**
```typescript
const CLICKUP_API_KEY = Deno.env.get('CLICKUP_API_KEY');

// Criar task
await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
  method: 'POST',
  headers: {
    'Authorization': CLICKUP_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Nova tarefa',
    description: 'Descrição da tarefa',
    priority: 3,
    due_date: Date.now() + 86400000 // +1 dia
  })
});
```

---

## 🚀 Deploy

### Frontend (Lovable)

1. **Via Lovable Dashboard:**
   - Clique em "Publish" no canto superior direito
   - Escolha domínio (lovable.app ou custom)
   - Deploy automático

2. **Via GitHub (export):**
   - Conecte repositório GitHub
   - Configure Vercel/Netlify
   - Build command: `npm run build`
   - Output directory: `dist`

### Edge Functions

```bash
# Instale Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref insncccrxgsvaxxkzjws

# Deploy todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy analyze-message
supabase functions deploy process-document
supabase functions deploy zapi-webhook
```

### Configuração de Secrets

```bash
# OpenAI
supabase secrets set OPENAI_API_KEY=sk-...

# Z-API
supabase secrets set ZAPI_INSTANCE_ID=...
supabase secrets set ZAPI_TOKEN=...

# ClickUp (opcional)
supabase secrets set CLICKUP_API_KEY=...
```

### Migrations

```bash
# Rodar migrações
supabase db push

# Ou via SQL Editor no dashboard Supabase
```

---

## 🧪 Testes

### Testar Edge Functions Localmente

```bash
# Instale Deno
curl -fsSL https://deno.land/install.sh | sh

# Inicie Supabase local
supabase start

# Rode função local
supabase functions serve analyze-message --no-verify-jwt

# Teste com curl
curl -X POST http://localhost:54321/functions/v1/analyze-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Preciso pagar conta de R$ 100", "contact_id": "5511999999999"}'
```

### Testar Frontend

```bash
# Dev mode
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## 📚 Recursos Adicionais

### Documentação Externa
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Z-API Docs](https://developer.z-api.io/)
- [ClickUp API Docs](https://clickup.com/api)

### Contato e Suporte
- Email: suporte@fullbpo.com
- Discord: [Link do servidor]
- GitHub: [Link do repositório]

---

**Versão:** 1.0.0  
**Última Atualização:** 2025-01-29  
**Autor:** Equipe FullBPO Analytics
