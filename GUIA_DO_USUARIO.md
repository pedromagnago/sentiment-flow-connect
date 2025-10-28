# 📘 Guia Completo do Usuário - FullBPO Analytics Platform

## Índice

1. [Introdução e Primeiro Acesso](#1-introdução-e-primeiro-acesso)
2. [Configuração Inicial](#2-configuração-inicial)
3. [Dashboard - Visão Geral](#3-dashboard---visão-geral)
4. [Módulo WhatsApp](#4-módulo-whatsapp)
5. [Ações Sugeridas pela IA](#5-ações-sugeridas-pela-ia)
6. [Gestão Financeira](#6-gestão-financeira)
7. [Tarefas Internas](#7-tarefas-internas)
8. [Análise de Documentos](#8-análise-de-documentos)
9. [Gestão de Dados Mestre](#9-gestão-de-dados-mestre)
10. [Relatórios e Inteligência](#10-relatórios-e-inteligência)
11. [Gestão de Equipe](#11-gestão-de-equipe)
12. [Logs de Auditoria](#12-logs-de-auditoria)
13. [Configurações Avançadas](#13-configurações-avançadas)
14. [Fluxos Práticos Passo a Passo](#14-fluxos-práticos-passo-a-passo)
15. [Dicas e Boas Práticas](#15-dicas-e-boas-práticas)
16. [Troubleshooting](#16-troubleshooting)
17. [Glossário](#17-glossário)
18. [Atalhos e Recursos Extras](#18-atalhos-e-recursos-extras)

---

## 1. Introdução e Primeiro Acesso

### 1.1 Bem-vindo à Plataforma

A **FullBPO Analytics Platform** é uma solução completa de gestão empresarial que integra inteligência artificial para automatizar processos de atendimento, financeiro, tarefas e análise de documentos.

**Principais capacidades:**
- 🤖 **IA Avançada**: Processamento automático de mensagens, documentos e sugestão de ações
- 💬 **WhatsApp Integrado**: Gestão completa de conversas e atendimentos
- 💰 **Financeiro Completo**: Contas a pagar, faturas e reconciliação bancária
- 📊 **Análise em Tempo Real**: Dashboards inteligentes e métricas de desempenho
- 👥 **Gestão de Equipe**: Controle de permissões e colaboração
- 🔍 **Auditoria Completa**: Rastreabilidade total de todas as ações

### 1.2 Como Fazer Login

1. Acesse a URL da plataforma
2. Clique em **"Entrar"** ou **"Login"**
3. Insira suas credenciais:
   - Email cadastrado
   - Senha
4. Clique em **"Entrar"**

**Primeiro acesso?**
- Se você recebeu um convite por email, clique no link do convite
- Crie sua senha seguindo as instruções
- Complete seu perfil (nome, cargo, especialidades)

### 1.3 Tour pela Interface

A interface é dividida em áreas principais:

**Barra Lateral Esquerda (Menu Principal):**
- 🏠 **Dashboard**: Visão geral e métricas
- 💬 **WhatsApp**: Módulo de atendimento (Chats, Fila, Contatos)
- ✨ **Ações Sugeridas**: Revisão de ações propostas pela IA
- 💰 **Financeiro**: Contas a Pagar, Faturas, Reconciliação
- ✅ **Tarefas**: Kanban de tarefas internas
- 📄 **Análise**: Processamento de documentos
- 🏢 **Empresas**: Gestão de empresas cliente
- 👥 **Contatos**: Cadastro de contatos
- 📊 **Relatórios**: Inteligência e análises
- 👨‍👩‍👧‍👦 **Equipe**: Gerenciamento de membros
- 📋 **Logs de Auditoria**: Histórico completo
- ⚙️ **Configurações**: Ajustes e integrações

**Barra Superior:**
- Nome da empresa/projeto atual
- Notificações
- Avatar do usuário
- Botão de configurações rápidas

### 1.4 Navegação

- Clique nos itens do menu lateral para acessar cada módulo
- Use o **breadcrumb** (caminho de navegação) para voltar a telas anteriores
- A maioria das telas possui **filtros** e **busca** para encontrar informações rapidamente
- Botões de ação primária aparecem no topo direito das telas

---

## 2. Configuração Inicial

⚠️ **IMPORTANTE**: Complete estas configurações antes de usar a plataforma!

### 2.1 Acessando Configurações

1. Clique no ícone de **⚙️ Configurações** no menu lateral
2. Você verá 4 abas principais: **Perfil**, **Empresa**, **IA & HITL**, **Integrações**

### 2.2 Aba Perfil

Configure suas informações pessoais e preferências de trabalho.

**Campos principais:**
- **Nome de Exibição**: Como você aparecerá na plataforma
- **Cargo**: Seu cargo na empresa
- **Status**: Ativo/Inativo (controla se você recebe atribuições)
- **Especialidades**: Áreas de atuação (adicione múltiplas especialidades)
  - Exemplo: "Financeiro", "Atendimento ao Cliente", "RH"
- **Máximo de Atendimentos Simultâneos**: Quantas conversas você pode atender ao mesmo tempo
- **Horário de Atendimento**:
  - Hora de início (ex: 09:00)
  - Hora de fim (ex: 18:00)
  - Dias da semana ativos (marque os dias que você trabalha)

**Como configurar:**
1. Preencha todos os campos
2. Adicione especialidades clicando em "Adicionar"
3. Selecione os horários e dias de trabalho
4. Clique em **"Salvar Configurações"**

### 2.3 Aba Empresa

Configure os dados da empresa principal.

**Campos obrigatórios:**
- **Nome da Empresa**: Razão social
- **CNPJ**: Cadastro Nacional de Pessoa Jurídica
- **Email**: Email corporativo
- **Telefone**: Telefone de contato

**Endereço:**
- CEP
- Cidade
- Estado
- Bairro
- Endereço completo

**Como configurar:**
1. Preencha todos os campos obrigatórios
2. Complete o endereço
3. Clique em **"Salvar Configurações"**

### 2.4 Aba IA & HITL (Inteligência Artificial & Human-in-the-Loop)

Configure como a IA processa documentos e quando solicitar validação humana.

#### 2.4.1 Processamento Automático de Documentos

**Configuração:**
- **Ativar processamento automático**: Liga/desliga o processamento automático de documentos enviados via WhatsApp
- Quando ATIVO: Documentos são processados automaticamente pela IA
- Quando INATIVO: Documentos ficam pendentes até processamento manual

**Como configurar:**
1. Ative ou desative o switch "Processar Documentos Automaticamente"
2. Clique em **"Salvar Configurações"**

#### 2.4.2 Human-in-the-Loop (HITL)

O HITL garante que ações importantes sejam validadas por humanos quando a IA não tem certeza.

**Configurações:**

**Telefone do Operador (WhatsApp):**
- Número do WhatsApp que receberá notificações de validação
- Formato: +55 11 99999-9999

**Limite de Confiança:**
- Controle deslizante de 0% a 100%
- Define quando a IA precisa de validação humana
- **Exemplo:**
  - 80% = Ações com confiança < 80% serão enviadas para validação
  - 50% = Apenas ações com confiança < 50% precisam validação

**Como funciona:**
1. IA analisa mensagem/documento
2. Calcula confiança (0-100%)
3. Se confiança < limite configurado → Envia para operador validar
4. Se confiança ≥ limite → Executa automaticamente (se auto-process ativo)

**Como configurar:**
1. Insira o número do WhatsApp do operador
2. Ajuste o slider de confiança conforme sua necessidade
3. Clique em **"Salvar Configurações"**

### 2.5 Aba Integrações

Configure integrações com sistemas externos.

#### 2.5.1 Integração ZAPI (WhatsApp)

Conecta a plataforma ao WhatsApp para receber e enviar mensagens.

**Campos necessários:**
- **Instance ID**: ID da sua instância ZAPI
- **Token**: Token de autenticação ZAPI
- **Client Token**: Token do cliente (se aplicável)

**Como configurar:**
1. Obtenha suas credenciais na plataforma ZAPI
2. Cole o Instance ID
3. Cole o Token
4. Cole o Client Token
5. Clique em **"Testar Conexão"** para verificar
6. Se aparecer ✅, clique em **"Salvar Configurações"**

#### 2.5.2 Integração ClickUp

Sincroniza tarefas criadas na plataforma com o ClickUp.

**Campos necessários:**
- **API Key do ClickUp**: Chave de API gerada no ClickUp
- **Workspace ID**: ID do workspace no ClickUp

**Como configurar:**
1. Acesse ClickUp → Settings → Apps → Generate API Token
2. Cole a API Key na plataforma
3. Copie o Workspace ID do ClickUp
4. Cole na plataforma
5. Clique em **"Testar Conexão"**
6. Se sucesso, selecione a **Lista de Destino** no dropdown
7. Clique em **"Sincronizar Tarefas"** para importar tarefas existentes
8. Clique em **"Salvar Configurações"**

---

## 3. Dashboard - Visão Geral

O Dashboard é sua central de comando, mostrando métricas em tempo real.

### 3.1 Cards de Métricas Principais

**Cards superiores (métricas de IA):**

1. **Ações Analisadas pela IA**
   - Total de ações analisadas no período
   - Crescimento/queda em relação ao período anterior
   - 📊 Gráfico de linha mostrando tendência

2. **Taxa de Aprovação**
   - % de ações aprovadas pelo sistema
   - Indicador de qualidade da IA
   - 🎯 Métrica de acuracidade

3. **Tempo Economizado**
   - Horas economizadas pela automação
   - Cálculo baseado em tempo médio por tarefa manual
   - ⏱️ Produtividade ganho

4. **Ações Pendentes**
   - Quantidade de ações aguardando revisão
   - 🔔 Alerta visual se houver muitas pendentes

**Cards inferiores (métricas gerais):**

5. **Mensagens Hoje**
   - Total de mensagens recebidas hoje
   - 📱 Volume de comunicação

6. **Conversas Ativas**
   - Conversas em andamento
   - 💬 Status do atendimento

7. **Documentos Processados**
   - Documentos analisados pela IA
   - 📄 Automação de análise

8. **Tarefas Abertas**
   - Tarefas pendentes/em andamento
   - ✅ Gestão de trabalho

### 3.2 Gráficos e Análises

**Gráfico de Ações da IA (temporal):**
- Visualização por dia/semana/mês
- Categorias: Pagamentos, Faturas, Tarefas, Análises
- Interativo: clique nas legendas para mostrar/ocultar

**Análise de Sentimentos:**
- Gráfico de pizza mostrando distribuição:
  - 😊 Positivo (verde)
  - 😐 Neutro (azul)
  - 😟 Negativo (vermelho)
- Baseado em análise de mensagens WhatsApp

**Conversas por Status:**
- Distribuição de conversas:
  - Aguardando (amarelo)
  - Em Atendimento (azul)
  - Resolvido (verde)
  - Arquivado (cinza)

### 3.3 Contatos Recentes

Lista dos contatos com interações mais recentes:
- Nome do contato
- Última mensagem
- Timestamp
- Clique para abrir conversa

### 3.4 Indicadores de Sistema

**Status de Integrações:**
- 🟢 WhatsApp Online/Offline
- 🟢 ClickUp Conectado/Desconectado
- 🟢 IA Processando/Parado

---

## 4. Módulo WhatsApp

O módulo WhatsApp é dividido em 3 áreas: **Chats**, **Fila** e **Contatos**.

### 4.1 WhatsApp - Chats

Interface de conversas em tempo real.

#### 4.1.1 Layout da Tela

**Painel Esquerdo (Lista de Conversas):**
- Pesquisa de conversas
- Lista de contatos com última mensagem
- Badge com contador de mensagens não lidas
- Status online/offline do contato

**Painel Central (Janela de Chat):**
- Histórico completo da conversa
- Mensagens enviadas (direita, azul)
- Mensagens recebidas (esquerda, cinza)
- Suporte a texto, imagens, documentos, áudios
- Visualização de anexos

**Painel Direito (Informações do Contato):**
- Nome e número do contato
- Empresa vinculada
- Tags
- Histórico de ações sugeridas
- Conversas estatísticas

#### 4.1.2 Como Usar

**Enviar Mensagem:**
1. Selecione um contato na lista
2. Digite no campo inferior
3. Clique em 📎 para anexar arquivo
4. Pressione Enter ou clique em Enviar

**Tipos de anexo suportados:**
- 📄 Documentos (PDF, DOC, XLS)
- 🖼️ Imagens (JPG, PNG)
- 🎵 Áudios (MP3, WAV)

**Buscar na Conversa:**
- Use a caixa de busca no topo
- Filtre por palavra-chave
- Navegue pelos resultados

#### 4.1.3 Ações Sugeridas no Chat

Quando a IA detecta uma ação em uma mensagem, aparece um card lateral:

**Card de Ação Sugerida:**
- Tipo de ação (Pagamento, Fatura, Tarefa, Documento)
- Dados extraídos pela IA
- Confiança (%)
- Botões:
  - ✅ **Aprovar**: Executa a ação
  - ✏️ **Editar**: Ajusta dados antes de aprovar
  - ❌ **Ignorar**: Descarta a sugestão

**Exemplo:**
```
💳 Ação: Criar Conta a Pagar
Beneficiário: Fornecedor XYZ
Valor: R$ 1.500,00
Vencimento: 15/11/2024
Confiança: 92%

[Aprovar] [Editar] [Ignorar]
```

### 4.2 WhatsApp - Fila (Kanban)

Sistema visual de gestão de atendimentos em formato Kanban.

#### 4.2.1 Colunas do Kanban

1. **🕐 Aguardando** (Amarelo)
   - Conversas que precisam de atendimento
   - Novos contatos
   - Mensagens não respondidas

2. **💬 Em Atendimento** (Azul)
   - Conversas sendo atendidas ativamente
   - Atribuídas a operadores
   - Em resolução

3. **✅ Resolvido** (Verde)
   - Conversas concluídas
   - Problemas resolvidos
   - Aguardando arquivo

4. **📁 Arquivado** (Cinza)
   - Conversas finalizadas
   - Histórico mantido
   - Fora da visão ativa

#### 4.2.2 Cards de Conversa

Cada card mostra:
- Nome do contato
- Última mensagem (prévia)
- Operador atribuído (avatar)
- Prioridade (🔴 Alta, 🟡 Média, 🟢 Baixa)
- Tags
- Tempo na fila (SLA)

#### 4.2.3 Como Usar

**Mover Conversa entre Colunas:**
- Arraste e solte o card na coluna desejada
- Ou use o menu de ações no card

**Atribuir Operador:**
1. Clique no card
2. Clique em "Atribuir"
3. Selecione o operador
4. Confirme

**Definir Prioridade:**
1. Clique no card
2. Selecione prioridade (Alta/Média/Baixa)
3. Salve

**Adicionar Tags:**
1. Abra o card
2. Digite tag no campo
3. Pressione Enter
4. Tags ajudam na organização e filtros

**Filtrar Fila:**
- Por operador
- Por prioridade
- Por tags
- Por SLA (atrasadas)

#### 4.2.4 SLA (Service Level Agreement)

- Tempo máximo para resposta é configurável
- Cards ficam vermelhos quando SLA está próximo de estourar
- Dashboard mostra % de SLA cumprido

### 4.3 WhatsApp - Contatos

Gerenciamento de contatos WhatsApp.

#### 4.3.1 Visualização

**Visão em Cards:**
- Cards com foto, nome, número
- Status (ativo/inativo)
- Empresa vinculada
- Última interação

**Visão em Tabela:**
- Colunas: Nome, Telefone, Empresa, Status, Ações
- Ordenação por qualquer coluna
- Paginação

#### 4.3.2 Funcionalidades

**Criar Contato:**
1. Clique em **"+ Novo Contato"**
2. Preencha:
   - Nome
   - Telefone (formato: +55 11 99999-9999)
   - Empresa (opcional, selecione do cadastro)
   - É grupo? (marque se for grupo WhatsApp)
3. Clique em **"Salvar"**

**Editar Contato:**
1. Clique no botão ✏️ do contato
2. Altere os campos
3. Clique em **"Salvar"**

**Excluir Contato:**
1. Clique no botão 🗑️
2. Confirme a exclusão
3. ⚠️ Ação irreversível!

**Buscar Contatos:**
- Use a barra de busca
- Procure por nome, telefone ou empresa

**Filtros:**
- Por empresa
- Por status (ativo/inativo)
- Por tipo (individual/grupo)

**Operações em Lote:**
1. Selecione múltiplos contatos (checkbox)
2. Escolha ação:
   - Vincular a empresa
   - Marcar como ativo/inativo
   - Excluir em lote
3. Confirme

---

## 5. Ações Sugeridas pela IA

A IA analisa mensagens e documentos e sugere ações automaticamente.

### 5.1 O que são Ações Sugeridas?

Quando você recebe uma mensagem do tipo:
- "Preciso pagar R$ 1.500 para o fornecedor XYZ até dia 15"
- PDF de boleto anexado
- Solicitação de tarefa

A IA:
1. Analisa o conteúdo
2. Extrai informações (valor, data, beneficiário, etc.)
3. Sugere uma ação (criar conta a pagar, fatura, tarefa)
4. Aguarda sua aprovação

### 5.2 Tipos de Ação

| Tipo | Ícone | Descrição | Resultado |
|------|-------|-----------|-----------|
| **Pagamento** | 💳 | Criar conta a pagar | Registro em Contas a Pagar |
| **Fatura** | 📄 | Emitir nota/fatura | Registro em Faturas |
| **Tarefa** | ✅ | Criar tarefa interna | Card no Kanban de Tarefas |
| **Análise de Documento** | 📊 | Processar documento | Análise em Documentos |

### 5.3 Acessando Ações Sugeridas

1. Clique em **"✨ Ações Sugeridas"** no menu
2. Você verá todas as ações pendentes, aprovadas, ignoradas

### 5.4 Visualização

**Cards de Ação:**
Cada ação é exibida em um card contendo:
- **Tipo de ação** (badge colorido)
- **Contato** que originou
- **Mensagem original** (prévia)
- **Dados extraídos** pela IA
- **Confiança** (%)
- **Status** (Pendente/Aprovada/Processada/Ignorada)
- **Prioridade** (Alta/Normal/Baixa)
- **Data de criação**
- **Badge de origem** (WhatsApp/Manual/API)

### 5.5 Status das Ações

- 🟡 **Pendente**: Aguardando revisão
- 🔵 **Processando**: IA processando dados
- ✅ **Aprovada**: Aprovada por operador
- ⚙️ **Processada**: Executada com sucesso
- ❌ **Ignorada**: Descartada por operador
- 🔴 **Erro**: Falha no processamento

### 5.6 Como Revisar e Aprovar

**Passo a Passo:**

1. **Abrir Ação:**
   - Clique no card da ação
   - Modal se abre com detalhes completos

2. **Revisar Dados:**
   - Verifique todos os campos extraídos
   - Compare com mensagem original
   - Confira valores, datas, nomes

3. **Editar (se necessário):**
   - Clique em **"✏️ Editar"**
   - Corrija campos incorretos
   - Adicione informações faltantes

4. **Aprovar:**
   - Clique em **"✅ Aprovar"**
   - Sistema executa a ação automaticamente
   - Cria registro no módulo correspondente
   - Notificação de sucesso aparece

5. **Ignorar:**
   - Se a ação não procede
   - Clique em **"❌ Ignorar"**
   - Opcionalmente adicione nota explicativa

### 5.7 Filtros e Busca

**Filtros disponíveis:**

**Por Status:**
- Todas
- Pendentes
- Aprovadas
- Processadas
- Ignoradas

**Por Tipo:**
- Todos os tipos
- Pagamentos
- Faturas
- Tarefas
- Documentos

**Por Prioridade:**
- Alta
- Normal
- Baixa

**Por Período:**
- Hoje
- Esta semana
- Este mês
- Intervalo personalizado

**Busca textual:**
- Por nome do contato
- Por beneficiário
- Por descrição
- Por valor

### 5.8 Operações em Lote

Para processar múltiplas ações de uma vez:

1. **Selecionar Ações:**
   - Marque checkbox em cada card
   - Ou use "Selecionar todas"

2. **Escolher Ação em Lote:**
   - **Aprovar Selecionadas**: Aprova todas de uma vez
   - **Ignorar Selecionadas**: Ignora em lote
   - **Alterar Prioridade**: Muda prioridade em massa

3. **Confirmar:**
   - Revise resumo
   - Confirme operação
   - Aguarde processamento

⚠️ **Cuidado**: Operações em lote não permitem edição individual. Use apenas quando tiver certeza!

### 5.9 Rastreabilidade (Origem da Ação)

Cada ação possui um **badge de origem**:

- 📱 **WhatsApp**: Criada a partir de mensagem
- 👤 **Manual**: Criada manualmente por usuário
- 🔗 **API**: Criada via integração externa
- 🤖 **IA**: Sugerida automaticamente pela IA

Clique no badge para ver:
- Mensagem original (se aplicável)
- Usuário que criou
- Timestamp
- Contexto completo

### 5.10 Histórico de Ações

Ao clicar em uma ação processada, você vê:
- Dados originais extraídos
- Edições feitas (diff)
- Quem aprovou
- Quando foi aprovada
- Resultado da execução
- Link para o registro criado (conta, fatura, tarefa)

---

## 6. Gestão Financeira

Módulo completo de gestão financeira integrado com IA.

### 6.1 Contas a Pagar

Gerencie todas as obrigações financeiras da empresa.

#### 6.1.1 Acessar Contas a Pagar

1. Menu lateral → **💰 Financeiro** → **Contas a Pagar**
2. Ou acesse diretamente `/payables`

#### 6.1.2 Visualização

**Tabela de Contas:**

Colunas:
- **Beneficiário**: Nome do fornecedor/prestador
- **Valor**: Valor a pagar (R$)
- **Vencimento**: Data de vencimento
- **Status**: Badge colorido
  - 🟡 Pendente (amarelo)
  - 🟢 Pago (verde)
  - 🔴 Vencido (vermelho)
- **Categoria**: Tipo de despesa
- **Forma de Pagamento**: PIX, TED, Boleto, etc.
- **Ações**: Botões de ação rápida

#### 6.1.3 Criar Conta Manualmente

1. Clique em **"+ Nova Conta a Pagar"**
2. Preencha o formulário:

**Dados Obrigatórios:**
- **Beneficiário**: Nome do fornecedor
- **CPF/CNPJ**: Documento do beneficiário
- **Valor**: Valor a pagar
- **Vencimento**: Data de vencimento

**Dados Opcionais:**
- **Descrição**: Detalhes do pagamento
- **Categoria**: Selecione (Despesas Operacionais, Folha, Impostos, etc.)
- **Subcategoria**: Detalhamento
- **Forma de Pagamento**: PIX, TED, Boleto, Dinheiro, Cartão
- **Centro de Custo**: Departamento/projeto
- **Projeto**: Projeto específico
- **Tipo de Documento**: NF Entrada, Recibo, Contrato
- **Número do Recibo/NF**: Identificação do documento
- **Chave NFe**: Chave de acesso da nota
- **Tags**: Tags livres para organização
- **Observações**: Notas adicionais

**Documentos:**
- **Documento Original**: Anexe PDF/imagem da NF ou boleto
- **Comprovante**: Anexe comprovante após pagar (pode adicionar depois)

3. Clique em **"Salvar"**

#### 6.1.4 Revisar Conta Criada pela IA

Quando uma ação sugerida de pagamento é aprovada:

1. Conta é criada automaticamente
2. Você recebe notificação
3. Acesse **Contas a Pagar**
4. Conta aparece com origem **🤖 IA**
5. Revise todos os dados
6. Edite se necessário (botão ✏️)
7. Marque como paga quando pagar

#### 6.1.5 Marcar como Paga

1. Localize a conta
2. Clique em **"Marcar como Paga"** ou ✅
3. Preencha:
   - **Data do Pagamento**: Quando foi pago
   - **Valor Pago**: Valor efetivamente pago (pode diferir do valor original)
   - **Forma de Pagamento**: Método usado
   - **Comprovante**: Anexe comprovante (opcional mas recomendado)
4. Clique em **"Confirmar Pagamento"**
5. Status muda para **🟢 Pago**

#### 6.1.6 Pagamento Parcial

Se você pagou apenas parte do valor:

1. Clique em **"Registrar Pagamento Parcial"**
2. Informe:
   - **Valor pago nesta parcela**
   - **Data do pagamento**
   - **Comprovante** (opcional)
3. Salve
4. Saldo devedor é calculado automaticamente
5. Conta permanece **Pendente** até quitação total
6. Histórico de pagamentos parciais fica registrado

#### 6.1.7 Filtros

**Filtrar por:**
- **Status**: Pendente, Pago, Vencido
- **Período**: Vencimento em intervalo de datas
- **Categoria**: Tipo de despesa
- **Beneficiário**: Nome do fornecedor
- **Forma de Pagamento**
- **Centro de Custo**
- **Projeto**

**Ordenar por:**
- Vencimento (crescente/decrescente)
- Valor (maior/menor)
- Data de criação

#### 6.1.8 Exportar Relatório

1. Aplique filtros desejados
2. Clique em **"📥 Exportar"**
3. Escolha formato:
   - PDF (relatório visual)
   - Excel (planilha para análise)
   - CSV (importação em outros sistemas)
4. Arquivo é baixado automaticamente

#### 6.1.9 Rateio de Despesas

Para dividir uma despesa entre múltiplos centros de custo:

1. Ao criar/editar conta, clique em **"Adicionar Rateio"**
2. Adicione linhas de rateio:
   - Centro de Custo
   - Percentual ou Valor
3. Soma deve ser 100% ou valor total
4. Salve

**Exemplo:**
```
Conta: Aluguel - R$ 10.000
Rateio:
- Administrativo: 40% (R$ 4.000)
- Vendas: 30% (R$ 3.000)
- TI: 30% (R$ 3.000)
```

#### 6.1.10 Histórico de Atividades

Cada conta mantém log completo:
- Quem criou
- Quando foi criada
- Edições realizadas (o que mudou)
- Pagamentos parciais
- Quem marcou como paga
- Comprovantes anexados

Acesse clicando no ícone 📜 no card da conta.

### 6.2 Faturas (Contas a Receber)

Gerencie faturamento e notas fiscais.

#### 6.2.1 Acessar Faturas

1. Menu lateral → **💰 Financeiro** → **Faturas**
2. Ou acesse `/invoices`

#### 6.2.2 Criar Fatura Manualmente

1. Clique em **"+ Nova Fatura"**
2. Preencha:

**Dados do Cliente:**
- **Destinatário**: Nome do cliente
- **CPF/CNPJ**: Documento do cliente
- **Contato WhatsApp**: Número para envio (opcional)

**Dados da Fatura:**
- **Descrição**: Descrição dos serviços/produtos
- **Valor Total**: Valor a receber
- **Data de Emissão**: Quando foi emitida
- **Data de Vencimento**: Prazo para pagamento
- **Data de Competência**: Mês/ano de referência

**Tipo de Documento:**
- NF-e (Nota Fiscal Eletrônica)
- Recibo Simples
- NF de Serviço

**Itens da Fatura** (para NF-e):
- Adicione linha por linha:
  - Descrição do item
  - Quantidade
  - Valor unitário
  - Valor total (calculado automaticamente)

**Informações Fiscais** (para NF-e):
- **Número da Nota**: Número sequencial
- **Chave NFe**: Chave de acesso
- **CFOP**: Código Fiscal de Operação
- **Natureza da Operação**: Ex: "Venda de Serviços"

**Organização:**
- **Centro de Custo**
- **Projeto**
- **Categoria**
- **Subcategoria**
- **Tags**

3. Clique em **"Salvar e Emitir"** ou **"Salvar como Rascunho"**

#### 6.2.3 Emitir NF-e

Se sua empresa possui certificado digital integrado:

1. Crie a fatura com tipo "NF-e"
2. Preencha todos os campos fiscais
3. Clique em **"Emitir NF-e"**
4. Sistema gera XML e PDF
5. Envia para SEFAZ
6. Retorna chave de acesso
7. PDF fica disponível para download

⚠️ **Nota**: Emissão de NF-e requer integração com sistema emissor configurado.

#### 6.2.4 Enviar Fatura por WhatsApp

1. Localize a fatura emitida
2. Clique em **"📱 Enviar por WhatsApp"**
3. Confirme o número do destinatário
4. Mensagem é enviada automaticamente com:
   - Texto de cobrança
   - PDF da fatura anexo
   - Dados de pagamento
5. Conversa fica registrada no módulo WhatsApp

#### 6.2.5 Receber Pagamento

1. Quando cliente pagar, localize a fatura
2. Clique em **"Marcar como Pago"**
3. Informe:
   - **Data do Recebimento**
   - **Valor Recebido**
   - **Forma de Recebimento** (PIX, Transferência, etc.)
   - **Comprovante** (opcional)
4. Confirme
5. Status muda para **🟢 Pago**

#### 6.2.6 Recebimento Parcial

Similar às contas a pagar:

1. Clique em **"Registrar Recebimento Parcial"**
2. Informe valor e data
3. Saldo devedor é atualizado
4. Histórico mantido

#### 6.2.7 Status de Faturas

- 🟡 **Pendente**: Aguardando pagamento
- 🔵 **Emitida**: NF-e emitida, aguardando pagamento
- 🟢 **Paga**: Totalmente paga
- 🟠 **Parcialmente Paga**: Recebeu parte do valor
- 🔴 **Vencida**: Passou do vencimento sem pagar
- ⚫ **Cancelada**: Fatura cancelada

#### 6.2.8 Relatórios de Faturamento

**Filtros:**
- Por período de emissão
- Por período de vencimento
- Por status
- Por cliente
- Por projeto

**Visualizações:**
- Total faturado no período
- Total recebido
- Total a receber
- Inadimplência (%)
- Gráfico de faturamento mensal

**Exportar:**
- PDF: Relatório formatado
- Excel: Análise detalhada
- CSV: Integração contábil

### 6.3 Reconciliação Bancária

Automatize a classificação de transações bancárias.

#### 6.3.1 Acessar Reconciliação

1. Menu → **💰 Financeiro** → **Reconciliação**
2. Ou acesse `/reconciliation`

#### 6.3.2 Importar Extrato Bancário

**Formatos aceitos:**
- **OFX**: Padrão bancário (recomendado)
- **Excel** (.xlsx)
- **CSV** (.csv)

**Passo a passo:**

1. Faça download do extrato no site do seu banco
   - Escolha formato OFX se disponível
   - Ou exporte para Excel/CSV

2. Na plataforma, clique em **"📂 Importar Extrato"**

3. Arraste o arquivo ou clique para selecionar

4. Clique em **"Upload"**

5. Sistema processa:
   - Lê transações
   - Aplica regras de classificação
   - Sugere categorias
   - Identifica duplicatas

6. Transações aparecem na tabela

#### 6.3.3 Visualizar Transações

**Cards de resumo:**
- **💰 Entradas**: Total de créditos
- **💸 Saídas**: Total de débitos
- **📊 Saldo**: Diferença (entradas - saídas)
- **📥 Importações**: Número de arquivos importados

**Tabela de Transações:**

Colunas:
- **Data**: Data da transação
- **Descrição**: Histórico do banco
- **Tipo**: Crédito/Débito
- **Valor**: Montante (R$)
- **Categoria**: Classificação aplicada
- **Subcategoria**: Detalhamento
- **Status**: Classificada/Pendente
- **Ações**: Editar, Reconciliar

**Cores:**
- 🟢 Verde: Crédito (entrada)
- 🔴 Vermelho: Débito (saída)
- 🟡 Amarelo: Pendente de classificação

#### 6.3.4 Classificar Transação Manualmente

1. Localize transação pendente
2. Clique em **"✏️ Editar"**
3. Selecione:
   - **Categoria**: Receitas, Despesas Operacionais, etc.
   - **Subcategoria**: Detalhamento
   - **Centro de Custo**: Departamento
   - **Projeto**: Se aplicável
4. Adicione **Observações** se necessário
5. Clique em **"Salvar"**
6. Transação fica classificada ✅

#### 6.3.5 Regras de Classificação Automática

Configure regras para classificar transações automaticamente.

**Acessar Regras:**
- Na tela de Reconciliação, seção **"Regras de Classificação"**

**Criar Nova Regra:**

1. Clique em **"+ Adicionar Regra"**

2. Preencha:
   - **Padrão (contém)**: Texto que aparece na descrição
     - Ex: "PIX RECEBIDO"
   - **Categoria**: Categoria a aplicar
     - Ex: "Receitas"

3. Clique em **"Adicionar Regra"**

4. Regra salva ✅

**Como Funciona:**
- Quando importar novo extrato
- Sistema varre cada transação
- Se descrição contém o padrão
- Aplica categoria automaticamente

**Exemplos de Regras:**

| Padrão | Categoria |
|--------|-----------|
| PIX RECEBIDO | Receitas |
| TED RECEBIDA | Receitas |
| PAGTO FORNEC | Despesas Operacionais |
| PGTO BOLETO | Fornecedores |
| TARIFA | Despesas Bancárias |
| IOF | Impostos |
| SALARIO | Folha de Pagamento |

**Editar/Remover Regra:**
- Lista de regras mostra todas as cadastradas
- Clique em **"Remover"** para deletar
- Recrie para editar (não há edição direta)

**Prioridade:**
- Regras são aplicadas na ordem de criação
- Primeira regra que der match é aplicada
- Crie regras mais específicas primeiro

#### 6.3.6 Reconciliação com Contas a Pagar/Receber

**Objetivo**: Casar transação bancária com registro da plataforma.

**Passo a passo:**

1. Identifique transação que corresponde a uma conta
   - Ex: Débito de R$ 1.500 em 15/11

2. Localize a conta a pagar correspondente
   - Mesmo valor e data próxima

3. Na transação, clique em **"🔗 Reconciliar"**

4. Selecione:
   - **Tipo**: Conta a Pagar ou Fatura
   - **Registro**: Busque pelo beneficiário/cliente

5. Sistema vincula:
   - Transação ↔ Conta
   - Marca conta como paga automaticamente
   - Registra data de pagamento
   - Match score calculado

6. Status: **✅ Reconciliado**

**Match Score:**
- 100%: Valor e data exatos
- 90-99%: Valor exato, data próxima
- 80-89%: Valores similares, data próxima
- <80%: Reconciliação manual recomendada

**Desconciliar:**
- Se reconciliou errado
- Clique em **"🔓 Desconciliar"**
- Vínculo é removido
- Conta volta para status anterior

#### 6.3.7 Rateio de Transação

Para dividir uma transação entre múltiplos centros de custo:

1. Edite a transação
2. Ative **"Rateio"**
3. Adicione linhas:
   - Centro de Custo
   - Categoria
   - Percentual ou Valor
4. Salve

Útil para:
- Aluguel compartilhado
- Despesas de viagem múltiplos projetos
- Compras de múltiplos departamentos

#### 6.3.8 Histórico de Atividades

Cada transação mantém log:
- Data de importação
- Arquivo origem
- Classificações aplicadas
- Edições manuais
- Reconciliações/desconciliações
- Usuário responsável

#### 6.3.9 Exportar Dados

**Exportar Transações:**
1. Aplique filtros
2. Clique em **"📥 Exportar"**
3. Escolha formato (Excel/CSV/PDF)
4. Download automático

**Exportar Regras:**
1. Na seção Regras
2. Clique em **"📥 Exportar Regras"**
3. Arquivo JSON baixado
4. Use para backup ou importar em outro ambiente

**Importar Regras:**
1. Clique em **"📤 Importar Regras"**
2. Selecione arquivo JSON
3. Regras são adicionadas
4. Duplicatas são ignoradas

---

## 7. Tarefas Internas

Sistema Kanban para gestão de tarefas da equipe.

### 7.1 Acessar Tarefas

Menu → **✅ Tarefas** → `/tasks`

### 7.2 Visão Kanban

**Colunas:**

1. **📋 Backlog** (Cinza)
   - Tarefas planejadas
   - Não iniciadas
   - Aguardando priorização

2. **🔄 Em Progresso** (Azul)
   - Tarefas em execução
   - Atribuídas a membros
   - Trabalho ativo

3. **👀 Revisão** (Amarelo)
   - Tarefas concluídas
   - Aguardando aprovação
   - Validação de qualidade

4. **✅ Concluído** (Verde)
   - Tarefas finalizadas
   - Aprovadas
   - Entregues

### 7.3 Cards de Tarefa

Cada card mostra:
- **Título** da tarefa
- **Descrição** (prévia)
- **Responsável** (avatar)
- **Prioridade** (🔴 Alta, 🟡 Média, 🟢 Baixa)
- **Prazo** (data de vencimento)
- **Tags**
- **Origem** (🤖 IA, 👤 Manual, 🔗 ClickUp)
- **Anexos** (ícone se houver)

**Indicadores visuais:**
- 🔴 Borda vermelha: Atrasada
- 🟡 Borda amarela: Vence em <24h
- 📎 Ícone: Possui anexos
- 💬 Badge: Número de comentários

### 7.4 Criar Tarefa Manualmente

1. Clique em **"+ Nova Tarefa"**

2. Preencha:

**Informações Básicas:**
- **Título**: Resumo da tarefa
- **Descrição**: Detalhamento completo (suporta formatação)

**Responsável:**
- Selecione membro da equipe
- Ou deixe "Não atribuído"

**Prioridade:**
- 🔴 Alta: Urgente
- 🟡 Média: Normal
- 🟢 Baixa: Pode esperar

**Prazos:**
- **Data de Início**: Quando começa
- **Data de Vencimento**: Deadline

**Organização:**
- **Coluna**: Backlog, Em Progresso, Revisão, Concluído
- **Tags**: Labels para filtrar

**Anexos:**
- Arraste arquivos para anexar
- Ou clique para selecionar

3. Clique em **"Criar Tarefa"**

### 7.5 Tarefas Criadas pela IA

Quando a IA sugere uma tarefa (via WhatsApp):

1. Ação é criada em **Ações Sugeridas**
2. Você aprova
3. Tarefa aparece automaticamente no Kanban
4. Origem: 🤖 IA
5. Dados extraídos já preenchidos
6. Vinculada à mensagem original

**Rastreabilidade:**
- Clique na tarefa
- Veja mensagem que originou
- Histórico completo
- Link para conversa WhatsApp

### 7.6 Movimentar Tarefas

**Arrastar e Soltar:**
- Clique e segure no card
- Arraste para coluna desejada
- Solte
- Status atualizado automaticamente

**Via Menu:**
1. Clique no card
2. Menu "Mover para..."
3. Selecione coluna
4. Confirme

**Workflow típico:**
```
Backlog → Em Progresso → Revisão → Concluído
```

### 7.7 Editar Tarefa

1. Clique no card
2. Modal se abre
3. Edite qualquer campo
4. Clique em **"Salvar"**

**Histórico de edições:**
- Todas as mudanças são registradas
- Quem editou
- O que mudou
- Quando foi alterado

### 7.8 Comentários

Colabore em tarefas com comentários:

1. Abra tarefa
2. Seção "Comentários"
3. Digite comentário
4. Mencione pessoas com @
5. Clique em **"Comentar"**

**Notificações:**
- Pessoas mencionadas recebem notificação
- Responsável é notificado de novos comentários

### 7.9 Anexos

**Adicionar anexo:**
1. Abra tarefa
2. Seção "Anexos"
3. Arraste arquivo ou clique
4. Upload automático
5. Anexo listado com:
   - Nome do arquivo
   - Tamanho
   - Quem anexou
   - Quando

**Tipos suportados:**
- Documentos (PDF, DOC, XLS)
- Imagens (JPG, PNG, GIF)
- Planilhas
- Apresentações

**Baixar anexo:**
- Clique no nome do arquivo
- Download inicia

### 7.10 Filtros

**Filtrar por:**
- **Responsável**: Ver tarefas de um membro
- **Prioridade**: Alta/Média/Baixa
- **Status**: Coluna específica
- **Tags**: Múltiplas tags
- **Vencimento**: Atrasadas, Hoje, Esta semana, Próximos 7 dias
- **Origem**: IA, Manual, ClickUp

**Busca:**
- Digite no campo de busca
- Procura em título e descrição
- Resultados em tempo real

### 7.11 Integração com ClickUp

Se você configurou ClickUp em Integrações:

**Sincronização:**
1. Acesse **Configurações** → **Integrações** → **ClickUp**
2. Clique em **"Sincronizar Tarefas"**
3. Tarefas do ClickUp são importadas
4. Aparecem no Kanban com origem 🔗 ClickUp

**Bidirecionais:**
- Tarefas criadas na plataforma vão para ClickUp
- Tarefas do ClickUp aparecem aqui
- Atualização de status é sincronizada
- Comentários também (se configurado)

**Mapeamento de Status:**
```
Backlog → ClickUp "To Do"
Em Progresso → ClickUp "In Progress"
Revisão → ClickUp "Review"
Concluído → ClickUp "Completed"
```

**Conflitos:**
- Se tarefa for editada em ambos
- Última edição prevalece
- Histórico mantém ambas versões

### 7.12 Estatísticas

**Métricas disponíveis:**
- Total de tarefas por coluna
- Taxa de conclusão (%)
- Tempo médio por tarefa
- Tarefas por responsável
- Tarefas atrasadas
- Produtividade da equipe

**Gráficos:**
- Burndown chart
- Velocidade do time
- Distribuição por prioridade

Acesse via **"📊 Estatísticas"** no topo.

---

## 8. Análise de Documentos

A IA processa documentos automaticamente extraindo informações.

### 8.1 Acessar Análise de Documentos

Menu → **📄 Análise** → `/analysis`

### 8.2 Upload de Documento

**Métodos:**

**1. Via Interface Web:**
1. Acesse **Análise de Documentos**
2. Clique em **"📤 Upload de Documento"**
3. Arraste arquivo ou clique para selecionar
4. Arquivo é enviado

**2. Via WhatsApp:**
- Cliente envia documento em conversa
- Sistema detecta automaticamente
- Se processamento automático ativo → Processa
- Se inativo → Fica pendente

**3. Via Email (se configurado):**
- Anexos de emails específicos
- Processados automaticamente

### 8.3 Formatos Suportados

**Documentos:**
- PDF
- DOC/DOCX (Word)
- XLS/XLSX (Excel)
- TXT (Texto simples)

**Imagens:**
- JPG/JPEG
- PNG
- TIFF
- BMP

**Áudios:**
- MP3
- WAV
- M4A
- OGG

### 8.4 Processamento

**O que a IA faz:**

**1. OCR (Optical Character Recognition):**
- Extrai texto de imagens
- Reconhece documentos escaneados
- Digitaliza formulários

**2. Análise Semântica:**
- Identifica tipo de documento
  - Nota Fiscal
  - Boleto
  - Contrato
  - Recibo
  - Relatório
- Extrai campos-chave
  - Valores monetários
  - Datas
  - Nomes
  - CPF/CNPJ
  - Endereços

**3. Classificação:**
- Categoriza documento
- Sugere ação (pagar, faturar, arquivar)

**4. Transcrição de Áudio:**
- Converte fala em texto
- Identifica múltiplos falantes (se possível)
- Timestamps

### 8.5 Visualizar Análises

**Lista de Documentos:**

Cada registro mostra:
- **Nome do arquivo**
- **Tipo** (PDF, Imagem, Áudio)
- **Status**:
  - 🔵 Processando
  - ✅ Concluído
  - ❌ Erro
- **Data de upload**
- **Contato** (se veio de WhatsApp)
- **Resumo** (prévia da análise)
- **Ações**

**Clicar no registro:**
1. Modal se abre
2. Visualização do documento (se imagem/PDF)
3. **Texto Extraído**: OCR ou transcrição
4. **Análise da IA**: Interpretação
5. **Dados Estruturados**: JSON com campos extraídos
6. **Ação Sugerida**: Link para ação criada (se houver)

### 8.6 Análise de Boleto

**Quando IA detecta boleto:**

1. Extrai:
   - Código de barras
   - Valor
   - Vencimento
   - Beneficiário
   - Pagador

2. Sugere criar **Conta a Pagar**

3. Você revisa e aprova em **Ações Sugeridas**

4. Conta criada automaticamente com dados do boleto

### 8.7 Análise de Nota Fiscal

**NF-e (XML):**
- Se enviar XML da nota
- IA extrai todos os campos
- Importa itens
- Cria fatura ou conta a pagar automaticamente

**NF escaneada (PDF/Imagem):**
- OCR identifica campos
- Extração pode ser menos precisa
- Revise antes de aprovar

**Dados extraídos:**
- Número da nota
- Chave de acesso
- Emitente
- Destinatário
- Valor total
- Itens (descrição, quantidade, valor)
- Impostos
- CFOP

### 8.8 Análise de Recibos

**Recibos simples:**
- Nome do prestador
- CPF/CNPJ
- Valor
- Descrição do serviço
- Data

**IA sugere:**
- Criar conta a pagar
- Ou registrar como despesa

### 8.9 Transcrição de Áudio

**Use cases:**
- Reuniões gravadas
- Mensagens de voz (WhatsApp)
- Chamadas de suporte

**Funcionalidades:**
- Texto completo da fala
- Timestamps (a cada X segundos)
- Identificação de palavras-chave
- Detecção de sentimento (positivo/negativo/neutro)

**Exemplo de transcrição:**
```
[00:00] Olá, gostaria de solicitar um pagamento
[00:05] O valor é mil e quinhentos reais
[00:10] Para o fornecedor ABC Ltda
[00:15] Vencimento dia quinze de novembro
```

**Ação automática:**
- IA cria ação sugerida de pagamento
- Extrai valor, fornecedor, vencimento
- Você revisa e aprova

### 8.10 Status e Notificações

**Status de processamento:**
- 🔵 **Na fila**: Aguardando processamento
- ⚙️ **Processando**: IA analisando
- ✅ **Concluído**: Análise finalizada
- ❌ **Erro**: Falha no processamento

**Notificações:**
- Quando processamento concluir
- Se ação for sugerida
- Em caso de erro

### 8.11 Reprocessar Documento

Se análise teve erro ou resultado insatisfatório:

1. Localize documento
2. Clique em **"🔄 Reprocessar"**
3. IA processa novamente
4. Nova análise gerada

### 8.12 Histórico

Mantenha histórico completo:
- Todos os documentos processados
- Análises geradas
- Ações criadas a partir deles
- Links entre documento → ação → conta/fatura

**Busca:**
- Por nome do arquivo
- Por contato
- Por tipo de documento
- Por período

**Filtros:**
- Status
- Tipo de arquivo
- Origem (WhatsApp, Upload, Email)

---

## 9. Gestão de Dados Mestre

Cadastros centrais de empresas e contatos.

### 9.1 Empresas (Clientes)

Gerencie suas empresas cliente.

#### 9.1.1 Acessar Empresas

Menu → **🏢 Empresas** → `/companies`

#### 9.1.2 Visualizações

**Cards:**
- Layout visual
- Card por empresa
- Informações principais visíveis
- Status colorido

**Tabela:**
- Layout compacto
- Mais informações por linha
- Ordenação fácil

**Filtros:**
- Por status (Ativo/Inativo)
- Por segmento
- Por cidade/estado
- Busca por nome/CNPJ

#### 9.1.3 Criar Empresa

1. Clique em **"+ Nova Empresa"**

2. **Aba Informações Básicas:**
   - **Nome**: Razão social
   - **CNPJ**: Cadastro nacional
   - **Segmento**: Ramo de atividade
   - **Atividade**: Detalhamento
   - **Status**: Ativo/Inativo

3. **Aba Contato:**
   - **Email**: Email corporativo
   - **Telefone**: Telefone principal
   - **WhatsApp**: Número para contato
   - **Nome do Contato**: Pessoa responsável
   - **Cargo do Contato**: Função

4. **Aba Endereço:**
   - **CEP**: Digite e sistema busca automaticamente
   - **Cidade**
   - **Estado**
   - **Bairro**
   - **Endereço**: Rua e número
   - **Complemento**: Sala, bloco, etc.

5. **Aba Financeiro:**
   - **Valor da Mensalidade**: Se aplicável
   - **Dia de Vencimento**: Dia do mês
   - **Forma de Pagamento**: Boleto, PIX, etc.
   - **Desconto**: % de desconto
   - **Prazo do Desconto**: Dias para desconto

6. **Aba Integrações:**
   - **ClickUp**: Configurações específicas desta empresa
   - **Omie**: Integração contábil (se usar)

7. Clique em **"Salvar"**

#### 9.1.4 Editar Empresa

1. Localize empresa (busca ou filtros)
2. Clique em **"✏️ Editar"**
3. Altere campos desejados
4. Clique em **"Salvar"**

**Histórico:**
- Todas as edições ficam registradas
- Quem editou, quando, o que mudou

#### 9.1.5 Excluir Empresa

1. Clique em **"🗑️ Excluir"**
2. Confirme exclusão
3. ⚠️ Exclusão suave (soft delete)
   - Empresa não aparece mais
   - Mas dados históricos preservados
   - Pode ser restaurada

#### 9.1.6 Operações em Lote

**Selecionar múltiplas:**
1. Marque checkbox de empresas
2. Escolha ação:
   - **Exportar**: Baixa selecionadas
   - **Alterar Status**: Ativa/Inativa em lote
   - **Adicionar Tag**: Marcar grupo
   - **Excluir**: Remoção em massa
3. Confirme

#### 9.1.7 Importar Empresas

**Via planilha Excel:**

1. Clique em **"📥 Importar"**
2. Baixe template Excel
3. Preencha planilha:
   - Uma linha por empresa
   - Colunas conforme template
4. Salve arquivo
5. Clique em **"Escolher Arquivo"**
6. Selecione Excel
7. Sistema valida:
   - CNPJs corretos
   - Campos obrigatórios preenchidos
   - Duplicatas
8. Mostra prévia
9. Confirme importação
10. Empresas criadas em lote

**Erros comuns:**
- CNPJ inválido → Corrija na planilha
- Empresa duplicada → Pula ou atualiza
- Campos obrigatórios vazios → Preencha

#### 9.1.8 Exportar Empresas

1. Aplique filtros (se quiser exportar apenas algumas)
2. Clique em **"📤 Exportar"**
3. Escolha formato:
   - **Excel**: Planilha completa
   - **CSV**: Importação em outros sistemas
   - **PDF**: Relatório formatado
4. Download automático

#### 9.1.9 Vinculações

**Empresas vinculam a:**
- **Contatos**: Pessoas da empresa
- **Faturas**: Notas emitidas para a empresa
- **Tarefas**: Tarefas relacionadas
- **Conversas WhatsApp**: Atendimentos

**Ver vinculações:**
1. Abra empresa
2. Abas adicionais:
   - **Contatos**: Lista de pessoas
   - **Faturas**: Histórico de faturamento
   - **Tarefas**: Tarefas relacionadas
   - **Mensagens**: Conversas WhatsApp

#### 9.1.10 Estatísticas por Empresa

**Dashboard da empresa:**
- Total faturado
- Valor em aberto
- Mensalidade em dia/atrasada
- Tickets de atendimento
- Satisfação (sentimento médio)
- Última interação

Acesse clicando em **"📊 Dashboard"** no card da empresa.

### 9.2 Contatos

Gerencie contatos individuais (pessoas).

#### 9.2.1 Acessar Contatos

Menu → **👥 Contatos** → `/contacts`

#### 9.2.2 Criar Contato

1. Clique em **"+ Novo Contato"**

2. Preencha:
   - **Nome**: Nome completo
   - **Telefone**: Formato +55 11 99999-9999
   - **Email**: Email pessoal/corporativo
   - **CPF**: Documento (opcional)
   - **Cargo**: Função na empresa
   - **Empresa**: Vincule a uma empresa (opcional)
   - **WhatsApp**: Marque se número tem WhatsApp
   - **É Grupo?**: Marque se for grupo WhatsApp
   - **Tags**: Labels de organização

3. Clique em **"Salvar"**

#### 9.2.3 Importar Contatos

**Da Agenda do WhatsApp:**
- Se integração ZAPI configurada
- Sistema pode importar contatos automaticamente
- Clique em **"Sincronizar WhatsApp"**

**Via Planilha:**
- Similar a empresas
- Baixe template
- Preencha
- Importe

#### 9.2.4 Operações em Lote

Igual a empresas:
- Exportar selecionados
- Alterar empresa em lote
- Adicionar tags
- Excluir múltiplos

#### 9.2.5 Vincular a Empresa

**Durante criação:**
- Selecione empresa no dropdown

**Após criação:**
1. Edite contato
2. Selecione empresa
3. Salve

**Múltiplos contatos, mesma empresa:**
1. Selecione contatos (checkbox)
2. **"Vincular a Empresa"**
3. Escolha empresa
4. Confirme

#### 9.2.6 Histórico de Interações

Cada contato tem:
- **Conversas WhatsApp**: Todas as mensagens
- **Ações Criadas**: Pagamentos, faturas, tarefas originadas
- **Documentos**: Arquivos recebidos
- **Sentimento**: Análise de satisfação

Acesse clicando no contato → Aba **"Histórico"**

---

## 10. Relatórios e Inteligência

Análises e relatórios customizáveis.

### 10.1 Acessar Relatórios

Menu → **📊 Relatórios** → `/reports`

### 10.2 Tipos de Relatório

#### 10.2.1 Relatório de IA

**Métricas da Inteligência Artificial:**

**Cards superiores:**
- Total de ações analisadas
- Taxa de aprovação da IA
- Tempo economizado (horas)
- Ações pendentes de revisão

**Gráficos:**
1. **Ações da IA ao Longo do Tempo**
   - Linha temporal
   - Por tipo de ação
   - Diário/Semanal/Mensal

2. **Distribuição por Tipo**
   - Pizza mostrando:
     - Pagamentos (%)
     - Faturas (%)
     - Tarefas (%)
     - Documentos (%)

3. **Taxa de Aprovação**
   - Linha temporal
   - % aprovadas vs. ignoradas
   - Tendência de acuracidade

4. **Tempo Economizado**
   - Barras mensais
   - Horas economizadas
   - Cálculo vs. processo manual

**Filtros:**
- Período (data início - fim)
- Tipo de ação
- Status (aprovada, pendente, ignorada)
- Operador (quem aprovou)

**Exportar:**
- PDF: Relatório visual completo
- Excel: Dados brutos para análise

#### 10.2.2 Relatório Financeiro

**Visão consolidada:**

**Receitas:**
- Total faturado no período
- Total recebido
- A receber
- Inadimplência (%)

**Despesas:**
- Total de contas a pagar
- Total pago
- Saldo devedor
- Por categoria

**Fluxo de Caixa:**
- Gráfico de entradas vs. saídas
- Saldo acumulado
- Projeção futura

**DRE Simplificado:**
- Receitas
- (-) Despesas
- (=) Lucro/Prejuízo

**Filtros:**
- Período
- Centro de custo
- Projeto
- Categoria
- Forma de pagamento

#### 10.2.3 Relatório de Atendimento

**WhatsApp Analytics:**

**Métricas:**
- Total de conversas
- Mensagens enviadas/recebidas
- Tempo médio de resposta
- SLA cumprido (%)
- Conversas resolvidas
- Taxa de resolução

**Gráficos:**
1. **Volume de Mensagens**
   - Por dia/semana/mês
   - Picos de atendimento

2. **Distribuição por Status**
   - Aguardando, Em Atendimento, Resolvido, Arquivado

3. **Sentimento**
   - Positivo/Neutro/Negativo
   - Evolução temporal

4. **Operadores**
   - Ranking por volume
   - Por taxa de resolução
   - Por satisfação

**Por Operador:**
- Nome
- Conversas atendidas
- Tempo médio de resposta
- Sentimento médio
- Produtividade

#### 10.2.4 Relatório de Produtividade

**Tarefas:**
- Total criadas
- Concluídas
- Taxa de conclusão (%)
- Tempo médio por tarefa
- Tarefas atrasadas

**Por Membro:**
- Nome
- Tarefas atribuídas
- Tarefas concluídas
- Taxa de conclusão
- Tempo médio

**Gráficos:**
- Burndown chart
- Velocidade (tarefas/semana)
- Distribuição por prioridade

### 10.3 Relatórios Customizados

Crie relatórios personalizados:

1. Clique em **"+ Novo Relatório"**

2. Escolha **Tipo Base**:
   - Financeiro
   - Atendimento
   - Tarefas
   - IA

3. Selecione **Métricas**:
   - Marque checkboxes de dados desejados

4. Defina **Filtros**:
   - Período
   - Categorias
   - Tags
   - Etc.

5. Escolha **Visualizações**:
   - Gráficos (linha, barra, pizza)
   - Tabelas
   - Cards

6. **Salve o Relatório**:
   - Dê um nome
   - Marque como favorito (opcional)
   - Agende envio automático (opcional)

7. Acesse sempre que quiser em **"Meus Relatórios"**

### 10.4 Agendar Relatórios

Envie relatórios automaticamente por email:

1. Crie ou abra relatório
2. Clique em **"📅 Agendar"**
3. Configure:
   - **Frequência**: Diária, Semanal, Mensal
   - **Dia/Hora**: Quando enviar
   - **Destinatários**: Emails (múltiplos)
   - **Formato**: PDF, Excel, ambos
4. Clique em **"Agendar"**

**Exemplo:**
```
Relatório: Financeiro Mensal
Frequência: Mensal
Dia: 1° dia do mês
Hora: 08:00
Destinatários: financeiro@empresa.com, diretoria@empresa.com
Formato: PDF + Excel
```

Sistema enviará automaticamente todos os meses.

### 10.5 Dashboards Interativos

**Criar Dashboard:**

1. Clique em **"📊 Novo Dashboard"**
2. Adicione **Widgets**:
   - Arraste da biblioteca
   - Redimensione
   - Posicione
3. Configure cada widget:
   - Escolha métrica
   - Defina filtros
   - Estilo visual
4. Salve

**Widgets disponíveis:**
- Cards de métricas (KPIs)
- Gráficos (linha, barra, pizza, área)
- Tabelas dinâmicas
- Mapas (se dados geográficos)
- Indicadores (gauges)

**Atualização:**
- Tempo real (auto-refresh)
- Manual (botão atualizar)

**Compartilhar:**
- Link público (somente leitura)
- Incorporar em site externo (iframe)
- Enviar por email

---

## 11. Gestão de Equipe

Gerencie membros da sua equipe.

### 11.1 Acessar Gestão de Equipe

Menu → **👨‍👩‍👧‍👦 Equipe** → `/team`

### 11.2 Visualizar Membros

**Cards de membros:**
- Nome e foto
- Cargo
- Role (permissão)
- Status (Ativo/Inativo)
- Email
- Especialidades
- Horário de atendimento

**Filtros:**
- Por role
- Por status
- Por especialidade

### 11.3 Convidar Novo Membro

1. Clique em **"+ Convidar Membro"**

2. Preencha:
   - **Email**: Email do novo membro
   - **Nome**: Nome completo
   - **Role**: Nível de permissão
     - **Owner** (Proprietário)
     - **Admin** (Administrador)
     - **Supervisor**
     - **Operator** (Operador)

3. Clique em **"Enviar Convite"**

4. Sistema:
   - Envia email de convite
   - Com link de aceite
   - Link expira em 7 dias

5. Convidado:
   - Recebe email
   - Clica no link
   - Cria senha
   - Completa perfil
   - Acessa plataforma

### 11.4 Níveis de Permissão (Roles)

#### 11.4.1 Owner (Proprietário)

**Acesso total:**
- ✅ Todas as funcionalidades
- ✅ Configurações da empresa
- ✅ Gerenciar membros (convidar, remover, alterar roles)
- ✅ Integrações
- ✅ Billing (faturamento da plataforma)
- ✅ Deletar dados
- ✅ Exportar tudo

**Restrições:**
- ❌ Nenhuma

**Uso típico:**
- CEO/Fundador
- Sócio proprietário

#### 11.4.2 Admin (Administrador)

**Acesso quase total:**
- ✅ Todas as funcionalidades operacionais
- ✅ Gerenciar membros (exceto owners)
- ✅ Configurações (maioria)
- ✅ Aprovar ações financeiras de qualquer valor
- ✅ Deletar dados

**Restrições:**
- ❌ Não pode alterar role de outros admins
- ❌ Não pode remover owners
- ❌ Não acessa billing da plataforma

**Uso típico:**
- Gerente geral
- Diretor operacional

#### 11.4.3 Supervisor

**Acesso intermediário:**
- ✅ Visualizar tudo
- ✅ Criar/editar: contatos, empresas, contas, faturas, tarefas
- ✅ Aprovar ações sugeridas (qualquer valor)
- ✅ Gerenciar fila de atendimento
- ✅ Atribuir tarefas

**Restrições:**
- ❌ Não pode gerenciar membros
- ❌ Não pode alterar configurações
- ❌ Não pode deletar em lote
- ❌ Não acessa integrações

**Uso típico:**
- Supervisor de equipe
- Coordenador

#### 11.4.4 Operator (Operador)

**Acesso limitado:**
- ✅ Atender conversas WhatsApp
- ✅ Criar tarefas básicas
- ✅ Aprovar ações até R$ 5.000
- ✅ Visualizar contatos e empresas (somente leitura)
- ✅ Documentos (upload e visualização)

**Restrições:**
- ❌ Não pode aprovar ações > R$ 5.000 (vai para supervisor)
- ❌ Não pode deletar nada
- ❌ Não pode editar configurações
- ❌ Não pode gerenciar membros
- ❌ Leitura limitada em financeiro

**Uso típico:**
- Atendente
- Operador de suporte
- Assistente

### 11.5 Alterar Role de Membro

**Quem pode:**
- Owners: Podem alterar qualquer role
- Admins: Podem alterar Supervisor/Operator

**Como:**
1. Localize membro
2. Clique em **"✏️ Editar"**
3. Selecione nova role
4. Clique em **"Salvar"**

⚠️ **Cuidado**: Mudanças de permissão são imediatas!

### 11.6 Desativar/Reativar Membro

**Desativar:**
- Não exclui o usuário
- Bloqueia acesso
- Mantém histórico
- Libera licença (se plano por usuário)

**Como:**
1. Clique no membro
2. **"Desativar"**
3. Confirme

**Reativar:**
1. Filtre por "Inativos"
2. Localize membro
3. **"Reativar"**
4. Usuário volta a acessar

### 11.7 Remover Membro

**Exclusão permanente:**
- Usuário perde acesso
- Não pode mais entrar
- Histórico de ações mantido (auditoria)
- Registros criados por ele permanecem

**Como:**
1. Clique em **"🗑️ Remover"**
2. Confirme exclusão
3. ⚠️ Ação irreversível!

**Boas práticas:**
- Prefira **Desativar** a Remover
- Remova apenas se necessário
- Antes de remover, reatribua suas tarefas/conversas

### 11.8 Convites Pendentes

**Ver convites:**
- Seção "Convites Pendentes"
- Lista emails convidados
- Status: Enviado, Aceito, Expirado

**Reenviar convite:**
1. Localize convite
2. **"📧 Reenviar"**
3. Novo email é enviado
4. Link atualizado (nova validade de 7 dias)

**Cancelar convite:**
1. **"❌ Cancelar"**
2. Convite é invalidado
3. Link do email não funcionará mais

### 11.9 Atividade de Membros

**Dashboard de atividade:**
- Último acesso de cada membro
- Ações recentes
- Conversas atendidas (se operador)
- Tarefas concluídas
- Produtividade

Acesse via **"📊 Atividade da Equipe"**

---

## 12. Logs de Auditoria

Rastreabilidade completa de todas as ações na plataforma.

### 12.1 Acessar Logs

Menu → **📋 Logs de Auditoria** → `/audit-logs`

### 12.2 O que é Registrado

**Toda ação é logada:**
- Quem fez
- O que fez (ação)
- Quando fez (timestamp exato)
- Onde fez (tabela/entidade)
- Dados antes (old_data)
- Dados depois (new_data)
- IP de origem
- User agent (navegador/dispositivo)

**Ações auditadas:**
- **CREATE**: Criação de registro
- **UPDATE**: Edição de registro
- **DELETE**: Exclusão de registro
- **LOGIN**: Entrada no sistema
- **LOGOUT**: Saída do sistema
- **APPROVE**: Aprovação de ação
- **REJECT**: Rejeição de ação
- **EXPORT**: Exportação de dados
- **IMPORT**: Importação de dados
- **CONFIG_CHANGE**: Mudança de configuração

### 12.3 Visualização

**Tabela de logs:**

Colunas:
- **Data/Hora**: Timestamp completo
- **Usuário**: Quem executou
- **Ação**: Tipo de operação
- **Tabela**: Entidade afetada
- **Registro ID**: ID do registro
- **IP**: Endereço IP
- **Detalhes**: Ícone para expandir

### 12.4 Filtros

**Filtrar logs por:**

**Período:**
- Data início - Data fim
- Hoje, Esta semana, Este mês
- Últimas 24h, 7 dias, 30 dias

**Usuário:**
- Selecione membro específico
- Ver ações de um usuário

**Tipo de Ação:**
- CREATE, UPDATE, DELETE, etc.
- Múltipla seleção

**Tabela:**
- companies
- contacts
- contas_pagar
- faturas
- messages
- etc.

**Busca textual:**
- Procure em dados antigos/novos
- Por ID de registro

### 12.5 Ver Detalhes de um Log

1. Clique no ícone **"🔍 Ver Detalhes"**

2. Modal abre mostrando:

**Informações básicas:**
- Usuário completo (nome, email)
- Data e hora exata
- IP e User Agent

**Dados alterados:**
- **Antes (old_data)**: Estado anterior (em JSON)
- **Depois (new_data)**: Estado posterior (em JSON)
- **Diff**: Diferença destacada

**Exemplo:**
```json
ANTES:
{
  "beneficiario": "Fornecedor ABC",
  "valor": 1000.00,
  "status": "pendente"
}

DEPOIS:
{
  "beneficiario": "Fornecedor ABC",
  "valor": 1500.00,        // ← Mudou
  "status": "pago"          // ← Mudou
}
```

### 12.6 Casos de Uso

#### 12.6.1 Investigar Mudança Inesperada

**Cenário**: Valor de uma conta mudou e você não sabe por quê.

1. Acesse **Logs de Auditoria**
2. Filtre por:
   - Tabela: contas_pagar
   - Ação: UPDATE
3. Busque pelo ID da conta
4. Veja quem alterou, quando e de/para quais valores

#### 12.6.2 Compliance e Regulamentação

**Cenário**: Auditoria externa exige prova de quem aprovou um pagamento.

1. Filtre por:
   - Ação: APPROVE
   - Período: Mês auditado
2. Exporte relatório
3. Entregue a auditores

#### 12.6.3 Segurança - Detectar Acesso Não Autorizado

**Cenário**: Suspeita de login não autorizado.

1. Filtre por:
   - Ação: LOGIN
   - Usuário: Conta suspeita
2. Veja IPs de login
3. Se IP desconhecido → Ação de segurança

#### 12.6.4 Rastrear Exclusões

**Cenário**: Empresa foi deletada acidentalmente, precisa saber quem e quando.

1. Filtre por:
   - Ação: DELETE
   - Tabela: companies
2. Veja usuário responsável
3. old_data tem todos os dados da empresa
4. Pode recriar se necessário

### 12.7 Exportar Logs

1. Aplique filtros desejados
2. Clique em **"📥 Exportar Logs"**
3. Escolha formato:
   - **Excel**: Planilha com dados estruturados
   - **CSV**: Importação em outras ferramentas
   - **JSON**: Programação/análise técnica
4. Download automático

**Arquivo inclui:**
- Todas as colunas
- Dados antigos e novos (em JSON)
- Metadados completos

### 12.8 Retenção de Logs

**Por quanto tempo logs são mantidos:**
- Padrão: **2 anos**
- Configurável por empresa
- Após período: Arquivamento ou exclusão

**Arquivamento:**
- Logs mais antigos são compactados
- Não aparecem na interface
- Podem ser restaurados sob demanda (para compliance)

### 12.9 Permissões

**Quem pode acessar logs:**
- **Owner**: Todos os logs
- **Admin**: Todos os logs
- **Supervisor**: Logs de sua equipe e próprios
- **Operator**: Apenas próprios logs (limitado)

---

## 13. Configurações Avançadas

Recursos avançados para personalização profunda.

### 13.1 Regras de Classificação (AI Rules)

Configure regras personalizadas para a IA executar automaticamente.

#### 13.1.1 Acessar

Menu → **⚙️ Configurações** → **Aba "Empresa"** → Seção **"Regras de Classificação"**

#### 13.1.2 O que são Regras

**Regras de classificação** definem:
- **Quando** a IA deve agir (condições)
- **O que** a IA deve fazer (ações)
- **Prioridade** (qual regra aplicar primeiro)

**Exemplo de regra:**
```
SE mensagem contém "boleto" E valor > R$ 1000
ENTÃO criar conta a pagar com prioridade alta
```

#### 13.1.3 Criar Regra Manualmente

1. Clique em **"+ Nova Regra"**

2. Preencha:

**Informações básicas:**
- **Nome da Regra**: Descrição clara
  - Ex: "Boletos Acima de R$ 1000"
- **Tipo**: Classificação, Roteamento, Automação
- **Ativa**: Marque para ativar
- **Prioridade**: 1 (alta) a 10 (baixa)

**Condições (JSON):**
```json
{
  "tipo_mensagem": "text",
  "contem_palavra": "boleto",
  "valor_maior_que": 1000
}
```

**Ações (JSON):**
```json
{
  "criar_acao": "conta_pagar",
  "prioridade": "alta",
  "categoria": "Fornecedores",
  "notificar": "supervisor@empresa.com"
}
```

3. Clique em **"Salvar"**

#### 13.1.4 Templates Pré-definidos

Para facilitar, há templates prontos:

**Lista de templates:**

1. **Pagamentos Urgentes**
   - Condição: "urgente" ou "vencendo hoje"
   - Ação: Criar conta com prioridade alta

2. **Notas Fiscais**
   - Condição: PDF com "nota fiscal" ou chave NFe
   - Ação: Criar fatura, extrair dados

3. **Solicitações de Tarefa**
   - Condição: "fazer", "tarefa", "lembrar"
   - Ação: Criar tarefa, atribuir ao solicitante

4. **Reclamações**
   - Condição: Sentimento negativo
   - Ação: Criar tarefa para atendimento, notificar supervisor

5. **Cotações**
   - Condição: "orçamento", "cotação", "quanto custa"
   - Ação: Marcar conversa com tag "vendas", atribuir a vendedor

**Usar template:**
1. Clique em **"📋 Usar Template"**
2. Selecione template
3. Sistema preenche condições e ações
4. Ajuste se necessário
5. Salve

#### 13.1.5 Condições Disponíveis

**Campos de mensagem:**
- `tipo_mensagem`: "text", "image", "document", "audio"
- `contem_palavra`: Busca texto na mensagem
- `regex`: Expressão regular avançada
- `contato_nome`: Nome do contato
- `contato_empresa`: Empresa do contato

**Dados extraídos:**
- `valor_maior_que`: Compara valor monetário
- `valor_menor_que`: Limite inferior
- `data_futura`: Data é no futuro
- `data_passada`: Data já passou

**Contexto:**
- `horario_comercial`: Dentro do horário configurado
- `fim_de_semana`: Sábado/domingo
- `feriado`: Feriado cadastrado

**Sentimento:**
- `sentimento`: "positivo", "neutro", "negativo"
- `sentimento_score_maior`: Score > X

**Operadores lógicos:**
- `E`: Todas as condições devem ser verdadeiras
- `OU`: Pelo menos uma verdadeira
- `NÃO`: Negação

**Exemplo complexo:**
```json
{
  "E": [
    {
      "contem_palavra": "pagamento"
    },
    {
      "OU": [
        {"valor_maior_que": 5000},
        {"contato_empresa": "Cliente VIP"}
      ]
    },
    {
      "NÃO": {
        "horario_comercial": true
      }
    }
  ]
}
```
Tradução: Mensagem contém "pagamento" E (valor > 5000 OU cliente VIP) E fora do horário comercial.

#### 13.1.6 Ações Disponíveis

**Criar Registros:**
- `criar_acao`: "conta_pagar", "fatura", "tarefa"
- Com parâmetros:
  - `prioridade`: "alta", "media", "baixa"
  - `categoria`: String
  - `atribuir_a`: User ID ou email
  - `prazo_dias`: Vencimento em X dias

**Classificação:**
- `atribuir_tag`: Adiciona tag
- `mover_para_coluna`: Move conversa no Kanban
- `marcar_prioridade`: Define prioridade

**Notificações:**
- `notificar_email`: Envia email
- `notificar_whatsapp`: Envia mensagem WhatsApp
- `notificar_usuario`: Notificação in-app

**Roteamento:**
- `atribuir_operador`: Direciona conversa
- `escalar_para`: Envia para supervisor

**Automação:**
- `enviar_mensagem_automatica`: Resposta automática
- `executar_webhook`: Chama API externa

**Exemplo de múltiplas ações:**
```json
{
  "criar_acao": "conta_pagar",
  "prioridade": "alta",
  "notificar_email": "financeiro@empresa.com",
  "atribuir_tag": "Urgente",
  "mover_para_coluna": "em_atendimento"
}
```

#### 13.1.7 Prioridade de Regras

- Quando múltiplas regras dão match na mesma mensagem
- Regra com **menor número de prioridade** executa primeiro
- Prioridade 1 > Prioridade 2 > ... > Prioridade 10

**Exemplo:**
```
Regra A: Prioridade 1 - Boletos > R$ 10.000
Regra B: Prioridade 5 - Todos os boletos

Mensagem: Boleto de R$ 15.000
→ Regra A executa (prioridade maior)
```

**Múltiplas execuções:**
- Se marcar "Permitir múltiplas regras"
- Várias regras podem executar na mesma mensagem
- Ordem: Da prioridade 1 à 10

#### 13.1.8 Ativar/Desativar Regra

**Desativar temporariamente:**
1. Localize regra
2. Toggle "Ativa"
3. Regra para de executar (mas não é deletada)

**Reativar:**
- Toggle novamente
- Regra volta a funcionar

**Útil para:**
- Testar regras
- Pausar temporariamente (ex: férias)
- Debugging

#### 13.1.9 Testar Regra

Antes de salvar, teste se funciona:

1. Crie regra
2. Clique em **"🧪 Testar"**
3. Cole mensagem de exemplo
4. Sistema simula:
   - Verifica condições
   - Mostra se daria match
   - Mostra ações que executaria
5. Ajuste regra se necessário
6. Salve quando satisfeito

#### 13.1.10 Importar/Exportar Regras

**Exportar:**
1. Clique em **"📥 Exportar Regras"**
2. Arquivo JSON baixado
3. Contém todas as regras

**Importar:**
1. Clique em **"📤 Importar Regras"**
2. Selecione arquivo JSON
3. Sistema valida formato
4. Regras são adicionadas (duplicatas ignoradas)

**Usar para:**
- Backup de regras
- Compartilhar entre ambientes (dev/produção)
- Migrar configurações

### 13.2 Logs de Aplicação de Regras

Monitore quando e como regras foram aplicadas.

#### 13.2.1 Acessar

Menu → **⚙️ Configurações** → **Aba "Empresa"** → **"Logs de Aplicação"**

#### 13.2.2 Visualização

**Tabela de logs:**

Colunas:
- **Data/Hora**: Quando a regra foi aplicada
- **Regra**: Nome da regra executada
- **Mensagem**: ID ou prévia da mensagem
- **Condições**: Quais condições deram match
- **Ações**: O que foi executado
- **Resultado**: Sucesso/Falha
- **Detalhes**: Link para ver tudo

#### 13.2.3 Filtros

**Filtrar por:**
- Período
- Regra específica
- Tipo de ação executada
- Resultado (sucesso/falha)
- Mensagem/contato

#### 13.2.4 Estatísticas

**Cards de resumo:**
- **Total de Aplicações**: Quantas vezes regras executaram
- **Taxa de Sucesso**: % de execuções bem-sucedidas
- **Regra Mais Usada**: Qual regra executa mais
- **Economia de Tempo**: Horas economizadas

**Gráficos:**
- Aplicações por dia
- Por regra
- Taxa de sucesso temporal

#### 13.2.5 Debugging

Se regra não está funcionando:

1. Acesse Logs de Aplicação
2. Filtre pela regra
3. Veja últimas execuções
4. Clique em "Detalhes" para ver:
   - Mensagem que disparou
   - Condições avaliadas (verdadeiro/falso cada uma)
   - Por que deu match ou não
   - Ações tentadas
   - Erros (se houver)
5. Ajuste regra conforme necessário

**Exemplo de debug:**
```
Regra: Boletos Acima de R$ 1000
Mensagem: "Segue boleto de R$ 500"

Condições avaliadas:
✅ contem_palavra "boleto" → TRUE
❌ valor_maior_que 1000 → FALSE (valor: 500)

Resultado: Regra NÃO aplicada
```

Ação: Ajustar limite para R$ 500 ou criar regra separada.

---

## 14. Fluxos Práticos Passo a Passo

Exemplos reais de uso da plataforma.

### 14.1 Fluxo 1: Receber e Processar Boleto via WhatsApp

**Cenário**: Cliente envia boleto para pagar.

**Passo a passo:**

1. **Cliente envia mensagem:**
   ```
   Cliente: Oi, segue boleto para pagar até dia 15/11.
   [Anexa PDF do boleto]
   ```

2. **IA processa automaticamente:**
   - Detecta anexo PDF
   - Faz OCR
   - Identifica como boleto
   - Extrai:
     - Valor: R$ 1.500,00
     - Vencimento: 15/11/2024
     - Beneficiário: Fornecedor XYZ Ltda
     - Código de barras

3. **IA cria Ação Sugerida:**
   - Tipo: Pagamento (conta a pagar)
   - Status: Pendente
   - Confiança: 95%

4. **Você recebe notificação:**
   - Acessa **Ações Sugeridas**
   - Vê card da ação

5. **Revisa dados:**
   - Confere valor ✓
   - Confere vencimento ✓
   - Confere beneficiário ✓

6. **Aprova:**
   - Clique em **"✅ Aprovar"**

7. **Sistema cria automaticamente:**
   - Conta a pagar em **Contas a Pagar**
   - Com todos os dados preenchidos
   - Status: Pendente
   - Documento original anexado (PDF do boleto)

8. **Quando pagar:**
   - Acessa **Contas a Pagar**
   - Marca como paga
   - Anexa comprovante

9. **Cliente é notificado (opcional):**
   - Via WhatsApp: "Pagamento realizado!"

**Tempo economizado:** 5 minutos (vs. 10 min processo manual)

### 14.2 Fluxo 2: Criar Fatura e Enviar Cobrança

**Cenário**: Precisa emitir nota fiscal de serviço e enviar para cliente.

**Passo a passo:**

1. **Acessa Faturas:**
   - Menu → **Financeiro** → **Faturas**

2. **Cria nova fatura:**
   - Clique **"+ Nova Fatura"**
   - Preenche:
     - Destinatário: Cliente ABC Ltda
     - CNPJ: 12.345.678/0001-99
     - Serviço: Consultoria em BPO
     - Valor: R$ 5.000,00
     - Vencimento: 30/11/2024

3. **Adiciona itens (se NF-e):**
   - Item 1: Análise de processos - R$ 2.000
   - Item 2: Implementação - R$ 3.000

4. **Salva e emite:**
   - **"Salvar e Emitir NF-e"**
   - Sistema gera XML e PDF

5. **Envia por WhatsApp:**
   - Na tela da fatura, **"📱 Enviar por WhatsApp"**
   - Confirma número do cliente
   - Mensagem automática enviada:
     ```
     Olá! Segue nota fiscal referente ao serviço prestado.
     Valor: R$ 5.000,00
     Vencimento: 30/11/2024
     
     [PDF da NF anexo]
     
     Aguardamos seu pagamento. Obrigado!
     ```

6. **Cliente recebe:**
   - Mensagem no WhatsApp
   - PDF da nota

7. **Acompanha recebimento:**
   - Status da fatura: Emitida
   - Quando cliente pagar: Marca como paga

**Tempo total:** 3 minutos

### 14.3 Fluxo 3: Importar e Reconciliar Extrato Bancário

**Cenário**: Fim do mês, precisa classificar transações bancárias.

**Passo a passo:**

1. **Baixa extrato do banco:**
   - Acessa site do banco
   - Exporta OFX (ou Excel)
   - Salva arquivo

2. **Importa na plataforma:**
   - Menu → **Financeiro** → **Reconciliação**
   - **"📂 Importar Extrato"**
   - Seleciona arquivo OFX
   - Upload

3. **Sistema processa:**
   - Lê 150 transações
   - Aplica regras de classificação:
     - 100 classificadas automaticamente
     - 50 pendentes

4. **Revisa classificações automáticas:**
   - Verde (créditos) OK ✓
   - Vermelhos (débitos):
     - "PIX FORNEC ABC" → Classificado como "Despesas Operacionais" ✓
     - "TARIFA" → Classificado como "Despesas Bancárias" ✓

5. **Classifica manualmente as 50 pendentes:**
   - "TRANSFERENCIA XYZ" → Categoria: "Fornecedores"
   - "DEPOSITO CLIENTE" → Categoria: "Receitas"
   - Etc.

6. **Reconcilia com contas:**
   - Transação: Débito R$ 1.500 em 15/11
   - Localiza conta a pagar correspondente
   - **"🔗 Reconciliar"**
   - Vincula
   - Conta marcada como paga automaticamente ✓

7. **Exporta relatório:**
   - Filtro: Mês de novembro
   - **"📥 Exportar"** → Excel
   - Envia para contador

**Economia:** 70% do trabalho automatizado (regras + reconciliação)

### 14.4 Fluxo 4: Gerenciar Tarefa Criada via Mensagem

**Cenário**: Cliente solicita tarefa via WhatsApp, que precisa virar projeto.

**Passo a passo:**

1. **Cliente manda mensagem:**
   ```
   Cliente: Preciso que vocês façam a folha de pagamento de novembro até dia 25.
   ```

2. **IA analisa:**
   - Detecta solicitação de tarefa
   - Extrai:
     - Título: "Folha de pagamento de novembro"
     - Prazo: 25/11/2024
     - Responsável: Equipe (não especificado)

3. **Cria Ação Sugerida:**
   - Tipo: Tarefa
   - Status: Pendente

4. **Você revisa e aprova:**
   - Acessa **Ações Sugeridas**
   - Edita antes de aprovar:
     - Prioridade: Alta
     - Responsável: João (especialista em folha)
   - **"✅ Aprovar"**

5. **Tarefa criada no Kanban:**
   - Coluna: **Backlog**
   - Atribuída a João
   - Prazo: 25/11
   - Origem: 🤖 IA (vinculada à mensagem original)

6. **João recebe notificação:**
   - "Nova tarefa atribuída a você"

7. **João trabalha:**
   - Move para **"Em Progresso"**
   - Adiciona comentários:
     - "Iniciado processamento"
     - "Aguardando dado do RH"
   - Anexa planilha intermediária

8. **Concluído:**
   - João move para **"Revisão"**
   - Você revisa
   - Move para **"Concluído"**

9. **Cliente é notificado (manual ou automático):**
   - Você: "Folha de novembro concluída!"
   - [Anexa PDF da folha]

**Rastreabilidade completa:** Mensagem original → Ação → Tarefa → Entrega

### 14.5 Fluxo 5: Analisar Documento Enviado

**Cenário**: Cliente envia contrato para análise.

**Passo a passo:**

1. **Cliente envia:**
   ```
   Cliente: Preciso que revisem esse contrato.
   [Anexa PDF "Contrato_Prestacao_Servicos.pdf"]
   ```

2. **Sistema detecta documento:**
   - Se processamento automático ativo:
     - IA processa imediatamente
   - Se inativo:
     - Fica pendente, você processa manualmente

3. **Processamento:**
   - OCR extrai todo o texto
   - IA analisa:
     - Tipo: Contrato de Prestação de Serviços
     - Partes: Contratante X, Contratada Y
     - Valor: R$ 10.000/mês
     - Vigência: 12 meses
     - Cláusulas importantes identificadas

4. **Análise armazenada:**
   - Menu → **Análise de Documentos**
   - Lista mostra novo documento:
     - Status: ✅ Concluído
     - Contato: Cliente
     - Resumo: "Contrato de prestação de serviços..."

5. **Você acessa análise:**
   - Clique no registro
   - Vê:
     - PDF original (visualizador)
     - Texto extraído completo
     - Análise da IA (resumo, pontos-chave)
     - Dados estruturados (JSON)

6. **IA sugere ação:**
   - "Este contrato requer aprovação jurídica"
   - Criar tarefa para advogado

7. **Você aprova tarefa:**
   - Tarefa criada
   - Atribuída a advogado
   - Com link para o documento

8. **Advogado revisa:**
   - Acessa tarefa
   - Baixa PDF
   - Analisa
   - Adiciona comentários: "OK para assinar"

9. **Você responde cliente:**
   - WhatsApp: "Contrato revisado e aprovado!"

**Economia:** Extração automática de dados economiza 15 min de leitura manual.

---

## 15. Dicas e Boas Práticas

### 15.1 Otimizando o Uso da IA

**Configure HITL adequadamente:**
- Limite de confiança muito baixo (ex: 30%) → IA aprova tudo, pode errar
- Limite muito alto (ex: 95%) → Muitas ações vão para validação manual
- **Recomendado:** 70-80% para maioria dos casos

**Aprove ações rapidamente:**
- IA aprende com suas aprovações/rejeições
- Quanto mais feedback, mais precisa fica

**Revise sempre valores altos:**
- Configure regras para valores > R$ 10.000 sempre irem para validação

**Use templates de regras:**
- Não reinvente a roda
- Templates cobrem 80% dos casos

### 15.2 Configurando Regras Eficientes

**Seja específico:**
- Regra vaga: "contem pagamento" → Muitos falsos positivos
- Regra específica: "contem pagamento E valor_maior_que 100" → Mais preciso

**Use prioridades:**
- Regras urgentes: Prioridade 1-3
- Regras normais: 4-7
- Regras baixa prioridade: 8-10

**Teste antes de ativar:**
- Sempre use a função "Testar"
- Simule com mensagens reais

**Monitore logs:**
- Semanalmente, revise Logs de Aplicação
- Veja se regras estão funcionando
- Ajuste conforme necessário

**Exporte regularmente:**
- Faça backup mensal das regras
- Se algo quebrar, você pode restaurar

### 15.3 Organizando a Fila de Atendimento

**Use tags consistentes:**
- Crie padrão de tags: "Vendas", "Suporte", "Financeiro", "Urgente"
- Todos da equipe devem usar as mesmas

**Defina SLA claro:**
- Alta prioridade: Responder em 1h
- Média: 4h
- Baixa: 24h

**Atribua conversas rapidamente:**
- Não deixe na fila "Aguardando" muito tempo
- Atribua a operador assim que possível

**Resolva e arquive:**
- Após resolver, mova para "Resolvido"
- Após confirmação do cliente, arquive
- Não deixe tudo em "Em Atendimento"

**Revise diariamente:**
- Conversas atrasadas (SLA estourado)
- Reatribua se operador sobrecarregado

### 15.4 Mantendo Dados Atualizados

**Empresas:**
- Revise trimestralmente
- Atualize endereços, telefones
- Marque inativos se não operam mais

**Contatos:**
- Se número WhatsApp mudar, atualize
- Vincule novos contatos a empresas
- Remova duplicatas

**Categorias/Tags:**
- Crie categorização padrão
- Não crie tags demais (dificulta filtros)
- Consolide tags similares

**Reconciliação:**
- Importe extratos ao menos mensalmente
- Reconcilie imediatamente
- Não deixe acumular

### 15.5 Segurança e Compliance

**Permissões adequadas:**
- Operadores: Acesso limitado
- Supervisores: Acesso intermediário
- Admins: Apenas pessoas de confiança
- Owners: Apenas sócios/diretores

**Audite regularmente:**
- Revise Logs de Auditoria mensalmente
- Identifique acessos estranhos
- Desative usuários que saíram da empresa

**Proteja dados sensíveis:**
- Não exponha CPF/CNPJ completo em listas
- Use "XXX.XXX.XXX-XX" em interfaces
- Acesso completo apenas quando necessário

**Backup:**
- Exporte dados críticos mensalmente
- Armazene fora da plataforma
- Teste restauração periodicamente

### 15.6 Treinamento da Equipe

**Onboarding de novos membros:**
1. Envie este guia do usuário
2. Faça tour guiado pela plataforma
3. Configure perfil completo
4. Atribua 1-2 tarefas simples primeiro
5. Acompanhe primeiros dias

**Treinamento contínuo:**
- Reuniões semanais: Mostre novos recursos
- Compartilhe boas práticas
- Feedback de uso (o que está difícil?)

**Documentação interna:**
- Crie FAQ da sua empresa
- Processos específicos do seu negócio
- Fluxos personalizados

### 15.7 Performance

**Filtros antes de exportar:**
- Não exporte 100.000 registros de uma vez
- Filtre por período razoável
- Exporte em lotes se necessário

**Limpeza periódica:**
- Arquive conversas antigas (>6 meses)
- Exclua logs desnecessários (após período de retenção)
- Consolide dados históricos

**Use paginação:**
- Nas listas, não carregue tudo
- Use busca e filtros
- Navegue por páginas

---

## 16. Troubleshooting

### 16.1 Problemas Comuns e Soluções

#### 16.1.1 "Não consigo fazer login"

**Possíveis causas:**

1. **Senha incorreta:**
   - Solução: Clique em "Esqueci minha senha"
   - Siga instruções no email

2. **Email não cadastrado:**
   - Solução: Verifique se digitou corretamente
   - Ou peça convite ao admin

3. **Conta desativada:**
   - Solução: Contate admin para reativar

4. **Problema de cache:**
   - Solução: Limpe cache do navegador
   - Ou tente modo anônimo

#### 16.1.2 "Ações sugeridas não aparecem"

**Possíveis causas:**

1. **Processamento automático desativado:**
   - Solução: Ative em Configurações → IA & HITL

2. **Mensagens antigas:**
   - Solução: IA só processa mensagens novas (após configuração)

3. **Filtros ativos:**
   - Solução: Remova filtros, veja se aparecem

4. **Permissão insuficiente:**
   - Solução: Verifique seu role (Operator pode ter acesso limitado)

#### 16.1.3 "Upload de documento falha"

**Possíveis causas:**

1. **Arquivo muito grande:**
   - Limite: 50MB
   - Solução: Comprima arquivo ou divida

2. **Formato não suportado:**
   - Solução: Converta para PDF, JPG, MP3 (suportados)

3. **Conexão lenta:**
   - Solução: Aguarde, ou tente rede melhor

4. **Espaço de armazenamento cheio:**
   - Solução: Contate suporte para aumentar cota

#### 16.1.4 "Integração WhatsApp não funciona"

**Possíveis causas:**

1. **Token ZAPI inválido:**
   - Solução: Verifique credenciais em Configurações → Integrações
   - Gere novo token no ZAPI

2. **Instância desconectada:**
   - Solução: Reconecte instância no ZAPI
   - Leia QR Code novamente

3. **Webhook não configurado:**
   - Solução: Configure webhook no ZAPI apontando para plataforma

#### 16.1.5 "Reconciliação não encontra contas"

**Possíveis causas:**

1. **Datas não coincidem exatamente:**
   - Solução: Busque por valor, não data
   - Aceite match score > 80%

2. **Valores diferentes (taxas, juros):**
   - Solução: Use reconciliação manual
   - Ajuste valor na conta

3. **Conta em outra empresa:**
   - Solução: Verifique se está na empresa correta
   - Troque empresa no filtro

#### 16.1.6 "Tarefas não sincronizam com ClickUp"

**Possíveis causas:**

1. **API Key inválida:**
   - Solução: Gere nova key no ClickUp
   - Atualize em Configurações

2. **Lista não selecionada:**
   - Solução: Selecione lista de destino

3. **Permissões no ClickUp:**
   - Solução: Garanta que API key tem permissão de escrita

4. **Sincronização desativada:**
   - Solução: Clique em "Sincronizar Tarefas" manualmente

### 16.2 Mensagens de Erro

#### "Erro 403: Acesso negado"
- **Significado:** Você não tem permissão para essa ação
- **Solução:** Contate admin para ajustar seu role

#### "Erro 500: Erro interno do servidor"
- **Significado:** Problema no sistema
- **Solução:** Aguarde alguns minutos, tente novamente. Se persistir, contate suporte.

#### "Timeout: Operação muito longa"
- **Significado:** Processamento demorou demais
- **Solução:** Reduza volume (ex: importe menos transações de uma vez)

#### "Duplicata detectada"
- **Significado:** Registro já existe
- **Solução:** Verifique se não está criando duplicata. Ou force criação se for caso específico.

### 16.3 Como Reportar Bugs

Se encontrar um problema:

1. **Documente:**
   - O que você tentou fazer (passo a passo)
   - O que você esperava acontecer
   - O que aconteceu de fato
   - Screenshot ou vídeo (se aplicável)

2. **Verifique Logs:**
   - Acesse Logs de Auditoria
   - Veja se há erros relacionados
   - Copie mensagem de erro exata

3. **Reproduza:**
   - Tente repetir o erro
   - Anote em quais condições ocorre

4. **Reporte:**
   - Email: suporte@fullbpo.com.br
   - Ou via chat de suporte na plataforma
   - Inclua todas as informações acima

5. **Acompanhe:**
   - Você receberá ticket number
   - Use para acompanhar status

### 16.4 Suporte Técnico

**Canais de suporte:**

- 📧 **Email:** suporte@fullbpo.com.br
  - SLA: 24h úteis

- 💬 **Chat in-app:**
  - Botão no canto inferior direito
  - Horário: Seg-Sex, 9h-18h

- 📞 **Telefone (urgências):** +55 11 XXXX-XXXX
  - Apenas para clientes enterprise

- 📚 **Base de Conhecimento:**
  - docs.fullbpo.com.br
  - Artigos, tutoriais, vídeos

**Horário de atendimento:**
- Segunda a Sexta: 09:00 - 18:00 (horário de Brasília)
- Sábados, domingos e feriados: Apenas emergências

---

## 17. Glossário

**IA (Inteligência Artificial):** Sistema que analisa mensagens e documentos automaticamente.

**HITL (Human-in-the-Loop):** Validação humana de ações da IA antes de executar.

**OCR (Optical Character Recognition):** Tecnologia que extrai texto de imagens.

**Ação Sugerida:** Proposta da IA de criar conta, fatura, tarefa ou analisar documento.

**Reconciliação:** Processo de casar transações bancárias com contas a pagar/receber.

**SLA (Service Level Agreement):** Tempo máximo acordado para responder/resolver.

**Kanban:** Método visual de gestão de tarefas/conversas em colunas.

**Role (Permissão):** Nível de acesso de um usuário (Owner, Admin, Supervisor, Operator).

**Webhook:** Notificação automática enviada para integração externa.

**Match Score:** Percentual de semelhança entre transação e conta (para reconciliação).

**Tag:** Etiqueta para organizar registros (ex: "Urgente", "Vendas").

**Rateio:** Divisão de valor entre múltiplos centros de custo.

**Centro de Custo:** Departamento ou área que gera despesa/receita.

**Soft Delete:** Exclusão que não remove dados permanentemente (pode restaurar).

**Auditoria:** Registro completo de quem fez o quê e quando.

**Template:** Modelo pré-definido para facilitar criação.

**Diff:** Diferença entre dados antes e depois de edição.

**CNPJ:** Cadastro Nacional de Pessoa Jurídica (identificação de empresas).

**CPF:** Cadastro de Pessoa Física (identificação de pessoas).

**NF-e:** Nota Fiscal Eletrônica.

**CFOP:** Código Fiscal de Operações e Prestações.

**Chave NFe:** Código de 44 dígitos que identifica nota fiscal eletrônica.

**OFX:** Open Financial Exchange, formato padrão de extrato bancário.

**Boleto:** Documento de cobrança brasileiro.

**PIX:** Sistema de pagamento instantâneo brasileiro.

**TED:** Transferência Eletrônica Disponível.

**DRE:** Demonstrativo de Resultado do Exercício.

**Sentimento:** Análise se mensagem é positiva, neutra ou negativa.

**Confiança (%):** Quão certa a IA está da sua análise (0-100%).

**Competência:** Mês/ano de referência de receita ou despesa.

**Beneficiário:** Quem recebe pagamento.

**Destinatário:** Quem recebe fatura.

---

## 18. Atalhos e Recursos Extras

### 18.1 Atalhos de Teclado

**Navegação:**
- `Ctrl + /` : Abrir busca global
- `Ctrl + K` : Busca rápida de comandos
- `Ctrl + 1-9` : Ir para menu 1-9
- `Esc` : Fechar modal/dialog

**Ações:**
- `Ctrl + S` : Salvar (em formulários)
- `Ctrl + Enter` : Enviar mensagem WhatsApp
- `Ctrl + N` : Novo registro (contexto)
- `Ctrl + E` : Editar selecionado

**Listas:**
- `↑ ↓` : Navegar por lista
- `Enter` : Abrir selecionado
- `Ctrl + A` : Selecionar todos
- `Del` : Excluir selecionado (com confirmação)

### 18.2 Navegação Rápida

**URLs diretas:**
- `/dashboard` - Dashboard
- `/whatsapp/chats` - WhatsApp Chats
- `/whatsapp/queue` - Fila Kanban
- `/suggested-actions` - Ações Sugeridas
- `/payables` - Contas a Pagar
- `/invoices` - Faturas
- `/reconciliation` - Reconciliação
- `/tasks` - Tarefas
- `/analysis` - Análise de Documentos
- `/companies` - Empresas
- `/contacts` - Contatos
- `/reports` - Relatórios
- `/team` - Equipe
- `/audit-logs` - Logs de Auditoria
- `/settings` - Configurações

**Favoritos:**
- Clique em ⭐ em qualquer página
- Acesse rapidamente em "Favoritos" (barra superior)

### 18.3 Notificações

**Tipos de notificação:**
- 🔔 In-app (sino no topo)
- 📧 Email (se configurado)
- 📱 WhatsApp (para HITL)

**Configurar:**
- Configurações → Perfil → Notificações
- Ative/desative por tipo de evento:
  - Nova ação sugerida
  - Tarefa atribuída
  - Mensagem WhatsApp
  - Vencimentos
  - Etc.

### 18.4 Modo Escuro

- Configurações → Perfil → Aparência
- Selecione "Tema Escuro"
- Salve

### 18.5 Idioma

Atualmente suportado:
- Português (Brasil)

*Em breve: Inglês, Espanhol*

### 18.6 Mobile

**App mobile:**
- Acesse via navegador mobile
- Interface responsiva
- Principais funcionalidades disponíveis

*App nativo (iOS/Android) em desenvolvimento*

### 18.7 Integrações Futuras

**Em roadmap:**
- Omie (contabilidade)
- RD Station (CRM/marketing)
- PagSeguro, Mercado Pago (pagamentos)
- Google Drive, Dropbox (armazenamento)
- Slack (notificações)

### 18.8 Atualizações da Plataforma

**Como saber de novidades:**
- Assine newsletter (Configurações → Preferências)
- Siga no LinkedIn: /company/fullbpo
- Blog: blog.fullbpo.com.br

**Changelog:**
- Acesse em "?" (ajuda) → "O que há de novo"
- Lista de atualizações recentes

---

## Conclusão

Parabéns! Você agora conhece todas as funcionalidades da **FullBPO Analytics Platform**.

**Próximos passos:**

1. ✅ Complete configurações iniciais (Perfil, Empresa, Integrações)
2. 🤖 Configure regras de IA para seu caso de uso
3. 📊 Explore o Dashboard para entender métricas
4. 💬 Comece a atender via WhatsApp
5. 📈 Analise relatórios para insights

**Lembre-se:**
- A IA aprende com seu uso (quanto mais usar, melhor fica)
- Revise e aprove ações regularmente
- Mantenha dados atualizados
- Use este guia como referência sempre que precisar

**Precisa de ajuda?**
- 📧 suporte@fullbpo.com.br
- 💬 Chat in-app
- 📚 docs.fullbpo.com.br

**Bom trabalho e sucesso na automação dos seus processos! 🚀**

---

*Última atualização: Novembro 2024*  
*Versão: 1.0*
