-- =====================================================
-- SCRIPT DE POPULAÇÃO DE DADOS DE TESTE - FullBPO
-- Empresa: Full BPO (371f6e9f-31e2-4ef4-bf00-65495f0688a2)
-- Usuário: pedromagnago0@gmail.com (ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2)
-- =====================================================

-- Variáveis
DO $$
DECLARE
  v_company_id UUID := '371f6e9f-31e2-4ef4-bf00-65495f0688a2';
  v_user_id UUID := 'ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2';
  v_bank_account_id UUID;
BEGIN

-- =====================================================
-- 1. CRIAR CONTA BANCÁRIA
-- =====================================================
INSERT INTO bank_accounts (id, company_id, user_id, account_id, bank_id, branch_id, display_name, acct_type)
VALUES 
  (gen_random_uuid(), v_company_id, v_user_id, '12345-6', '001', '1234', 'Banco do Brasil - Conta Principal', 'CHECKING')
RETURNING id INTO v_bank_account_id;

-- =====================================================
-- 2. CONTATOS DE TESTE
-- =====================================================
-- Fornecedores
INSERT INTO contacts (id_contact, nome, company_id, is_group, status, feedback) VALUES
  ('5511999001001@c.us', 'Fornecedor ABC Materiais', v_company_id, false, true, true),
  ('5511999001002@c.us', 'Distribuidora XYZ', v_company_id, false, true, true),
  ('5511999001003@c.us', 'Tech Solutions LTDA', v_company_id, false, true, true),
  ('5511999001004@c.us', 'Serviços Express', v_company_id, false, true, true),
  ('5511999001005@c.us', 'Logística Rápida', v_company_id, false, true, true);

-- Clientes
INSERT INTO contacts (id_contact, nome, company_id, is_group, status, feedback) VALUES
  ('5511999002001@c.us', 'Cliente João Silva', v_company_id, false, true, true),
  ('5511999002002@c.us', 'Empresa Beta LTDA', v_company_id, false, true, true),
  ('5511999002003@c.us', 'Comércio Central', v_company_id, false, true, true),
  ('5511999002004@c.us', 'Indústria Gama', v_company_id, false, true, true),
  ('5511999002005@c.us', 'Consultoria Delta', v_company_id, false, true, true);

-- Grupos WhatsApp
INSERT INTO contacts (id_contact, nome, company_id, is_group, status, feedback) VALUES
  ('120363001234567890@g.us', 'Grupo Financeiro Full BPO', v_company_id, true, true, true),
  ('120363009876543210@g.us', 'Grupo Clientes VIP', v_company_id, true, true, true);

-- =====================================================
-- 3. TRANSAÇÕES BANCÁRIAS
-- =====================================================
-- Receitas (entradas)
INSERT INTO bank_transactions (company_id, user_id, bank_account_uuid, date, amount, description, type, category, fitid, tipo_movimento, transaction_status, reconciled, ignorar_reconciliacao) VALUES
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-01', 15000.00, 'Recebimento NF 001 - Cliente João', 'CREDIT', 'Receita de Serviços', 'FIT001', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-02', 8500.00, 'Recebimento NF 002 - Empresa Beta', 'CREDIT', 'Receita de Serviços', 'FIT002', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-03', 12000.00, 'Recebimento NF 003 - Comércio Central', 'CREDIT', 'Receita de Serviços', 'FIT003', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-05', 6500.00, 'Recebimento NF 004 - Indústria Gama', 'CREDIT', 'Receita de Serviços', 'FIT004', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-06', 9800.00, 'Recebimento NF 005 - Consultoria Delta', 'CREDIT', 'Receita de Serviços', 'FIT005', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-08', 4200.00, 'Recebimento NF 006', 'CREDIT', 'Receita de Vendas', 'FIT006', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-09', 7300.00, 'Recebimento NF 007', 'CREDIT', 'Receita de Vendas', 'FIT007', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-10', 11000.00, 'Recebimento NF 008', 'CREDIT', 'Receita de Serviços', 'FIT008', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-11', 5500.00, 'Recebimento NF 009', 'CREDIT', 'Receita de Vendas', 'FIT009', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-12', 8900.00, 'Recebimento NF 010', 'CREDIT', 'Receita de Serviços', 'FIT010', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-13', 3200.00, 'Recebimento NF 011', 'CREDIT', 'Receita de Vendas', 'FIT011', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-14', 6700.00, 'Recebimento NF 012', 'CREDIT', 'Receita de Serviços', 'FIT012', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-15', 14500.00, 'Recebimento NF 013', 'CREDIT', 'Receita de Serviços', 'FIT013', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-16', 2800.00, 'Recebimento NF 014', 'CREDIT', 'Receita de Vendas', 'FIT014', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-17', 9100.00, 'Recebimento NF 015', 'CREDIT', 'Receita de Serviços', 'FIT015', 'operacional', 'pending', false, false);

-- Despesas (saídas)
INSERT INTO bank_transactions (company_id, user_id, bank_account_uuid, date, amount, description, type, category, fitid, tipo_movimento, transaction_status, reconciled, ignorar_reconciliacao) VALUES
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-01', -2500.00, 'Pagamento Fornecedor ABC', 'DEBIT', 'Fornecedores', 'FIT101', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-02', -1800.00, 'Pagamento Distribuidora XYZ', 'DEBIT', 'Fornecedores', 'FIT102', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-03', -3200.00, 'Aluguel Escritório', 'DEBIT', 'Despesas Administrativas', 'FIT103', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-04', -450.00, 'Conta de Luz', 'DEBIT', 'Utilidades', 'FIT104', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-05', -180.00, 'Conta de Água', 'DEBIT', 'Utilidades', 'FIT105', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-06', -250.00, 'Internet e Telefone', 'DEBIT', 'Utilidades', 'FIT106', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-07', -5500.00, 'Folha de Pagamento', 'DEBIT', 'Pessoal', 'FIT107', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-08', -1200.00, 'INSS', 'DEBIT', 'Impostos', 'FIT108', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-09', -800.00, 'FGTS', 'DEBIT', 'Impostos', 'FIT109', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-10', -350.00, 'Material de Escritório', 'DEBIT', 'Despesas Administrativas', 'FIT110', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-11', -2100.00, 'Pagamento Tech Solutions', 'DEBIT', 'Fornecedores', 'FIT111', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-12', -680.00, 'Manutenção Equipamentos', 'DEBIT', 'Manutenção', 'FIT112', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-13', -1500.00, 'Marketing Digital', 'DEBIT', 'Marketing', 'FIT113', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-14', -420.00, 'Combustível', 'DEBIT', 'Transporte', 'FIT114', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-15', -890.00, 'Pagamento Serviços Express', 'DEBIT', 'Fornecedores', 'FIT115', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-16', -560.00, 'Software e Licenças', 'DEBIT', 'TI', 'FIT116', 'operacional', 'pending', false, false),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-17', -1100.00, 'Pagamento Logística Rápida', 'DEBIT', 'Fornecedores', 'FIT117', 'operacional', 'pending', false, false);

-- Transferências (ignorar reconciliação)
INSERT INTO bank_transactions (company_id, user_id, bank_account_uuid, date, amount, description, type, category, fitid, tipo_movimento, transaction_status, reconciled, ignorar_reconciliacao) VALUES
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-05', -5000.00, 'TED para Poupança', 'DEBIT', 'Transferência', 'FIT201', 'transferencia', 'classified', true, true),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-10', 3000.00, 'TED da Poupança', 'CREDIT', 'Transferência', 'FIT202', 'transferencia', 'classified', true, true),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-15', -2000.00, 'PIX para Conta Secundária', 'DEBIT', 'Transferência', 'FIT203', 'transferencia', 'classified', true, true);

-- Tarifas bancárias (ignorar reconciliação)
INSERT INTO bank_transactions (company_id, user_id, bank_account_uuid, date, amount, description, type, category, fitid, tipo_movimento, transaction_status, reconciled, ignorar_reconciliacao) VALUES
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-01', -45.00, 'Tarifa Manutenção Conta', 'DEBIT', 'Tarifas Bancárias', 'FIT301', 'tarifa_bancaria', 'classified', true, true),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-15', -12.50, 'Tarifa TED', 'DEBIT', 'Tarifas Bancárias', 'FIT302', 'tarifa_bancaria', 'classified', true, true),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-17', -8.00, 'Tarifa DOC', 'DEBIT', 'Tarifas Bancárias', 'FIT303', 'tarifa_bancaria', 'classified', true, true);

-- Rendimentos (ignorar reconciliação)
INSERT INTO bank_transactions (company_id, user_id, bank_account_uuid, date, amount, description, type, category, fitid, tipo_movimento, transaction_status, reconciled, ignorar_reconciliacao) VALUES
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-10', 125.00, 'Rendimento Poupança', 'CREDIT', 'Rendimentos', 'FIT401', 'rendimento', 'classified', true, true),
  (v_company_id, v_user_id, v_bank_account_id, '2024-12-17', 85.00, 'Rendimento CDB', 'CREDIT', 'Rendimentos', 'FIT402', 'rendimento', 'classified', true, true);

-- =====================================================
-- 4. CONTAS A PAGAR
-- =====================================================
-- Pendentes
INSERT INTO contas_pagar (company_id, user_id, beneficiario, cpf_cnpj_beneficiario, descricao, valor, vencimento, status, categoria, data_competencia) VALUES
  (v_company_id, v_user_id, 'Fornecedor ABC Materiais', '12.345.678/0001-90', 'NF 1001 - Materiais de escritório', 2500.00, '2024-12-20', 'pendente', 'Fornecedores', '2024-12-01'),
  (v_company_id, v_user_id, 'Distribuidora XYZ', '98.765.432/0001-10', 'NF 1002 - Produtos para revenda', 4800.00, '2024-12-22', 'pendente', 'Fornecedores', '2024-12-01'),
  (v_company_id, v_user_id, 'Tech Solutions LTDA', '11.222.333/0001-44', 'NF 1003 - Suporte técnico mensal', 1500.00, '2024-12-25', 'pendente', 'Serviços', '2024-12-01'),
  (v_company_id, v_user_id, 'Imobiliária Centro', '55.666.777/0001-88', 'Aluguel Janeiro/2025', 3200.00, '2025-01-05', 'pendente', 'Aluguel', '2025-01-01'),
  (v_company_id, v_user_id, 'Companhia Elétrica', '33.444.555/0001-66', 'Conta de Luz Dezembro', 580.00, '2024-12-28', 'pendente', 'Utilidades', '2024-12-01'),
  (v_company_id, v_user_id, 'Operadora de Internet', '77.888.999/0001-22', 'Internet Dezembro', 299.00, '2024-12-30', 'pendente', 'Utilidades', '2024-12-01'),
  (v_company_id, v_user_id, 'Serviços Express', '22.333.444/0001-55', 'NF 1004 - Serviços de entrega', 890.00, '2024-12-23', 'pendente', 'Logística', '2024-12-01'),
  (v_company_id, v_user_id, 'Logística Rápida', '44.555.666/0001-77', 'NF 1005 - Frete mensal', 1200.00, '2024-12-24', 'pendente', 'Logística', '2024-12-01'),
  (v_company_id, v_user_id, 'Contador Associados', '66.777.888/0001-99', 'Honorários contábeis Dezembro', 1800.00, '2025-01-10', 'pendente', 'Serviços Profissionais', '2024-12-01'),
  (v_company_id, v_user_id, 'Seguradora Nacional', '88.999.000/0001-11', 'Seguro empresarial parcela 6/12', 450.00, '2024-12-26', 'pendente', 'Seguros', '2024-12-01');

-- Pagas
INSERT INTO contas_pagar (company_id, user_id, beneficiario, cpf_cnpj_beneficiario, descricao, valor, vencimento, status, categoria, data_competencia, pago_em, valor_pago) VALUES
  (v_company_id, v_user_id, 'Fornecedor ABC Materiais', '12.345.678/0001-90', 'NF 0998 - Materiais Novembro', 2100.00, '2024-11-20', 'pago', 'Fornecedores', '2024-11-01', '2024-11-18', 2100.00),
  (v_company_id, v_user_id, 'Imobiliária Centro', '55.666.777/0001-88', 'Aluguel Dezembro/2024', 3200.00, '2024-12-05', 'pago', 'Aluguel', '2024-12-01', '2024-12-03', 3200.00),
  (v_company_id, v_user_id, 'Folha de Pagamento', NULL, 'Salários Novembro', 5500.00, '2024-12-05', 'pago', 'Pessoal', '2024-11-01', '2024-12-05', 5500.00),
  (v_company_id, v_user_id, 'INSS', NULL, 'INSS Novembro', 1200.00, '2024-12-07', 'pago', 'Impostos', '2024-11-01', '2024-12-07', 1200.00),
  (v_company_id, v_user_id, 'FGTS', NULL, 'FGTS Novembro', 800.00, '2024-12-07', 'pago', 'Impostos', '2024-11-01', '2024-12-07', 800.00);

-- Vencidas
INSERT INTO contas_pagar (company_id, user_id, beneficiario, cpf_cnpj_beneficiario, descricao, valor, vencimento, status, categoria, data_competencia) VALUES
  (v_company_id, v_user_id, 'Distribuidora XYZ', '98.765.432/0001-10', 'NF 0995 - Produtos Outubro', 3500.00, '2024-11-15', 'vencido', 'Fornecedores', '2024-10-01'),
  (v_company_id, v_user_id, 'Tech Solutions LTDA', '11.222.333/0001-44', 'NF 0996 - Suporte Outubro', 1500.00, '2024-11-20', 'vencido', 'Serviços', '2024-10-01'),
  (v_company_id, v_user_id, 'Gráfica Express', '99.000.111/0001-33', 'NF 0997 - Impressos', 650.00, '2024-11-25', 'vencido', 'Materiais', '2024-11-01');

-- =====================================================
-- 5. CONTAS A RECEBER
-- =====================================================
-- Pendentes
INSERT INTO contas_receber (company_id, user_id, cliente, cpf_cnpj_cliente, descricao, valor_total, data_vencimento, status, categoria, data_competencia, tipo_documento) VALUES
  (v_company_id, v_user_id, 'Cliente João Silva', '123.456.789-00', 'NF 2001 - Serviços de consultoria', 8500.00, '2024-12-20', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Empresa Beta LTDA', '11.222.333/0001-44', 'NF 2002 - Projeto Alpha', 15000.00, '2024-12-25', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Comércio Central', '22.333.444/0001-55', 'NF 2003 - Implementação sistema', 12000.00, '2024-12-28', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Indústria Gama', '33.444.555/0001-66', 'NF 2004 - Suporte anual', 6500.00, '2025-01-05', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Consultoria Delta', '44.555.666/0001-77', 'NF 2005 - Treinamento equipe', 4800.00, '2025-01-10', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Loja Virtual Shop', '55.666.777/0001-88', 'NF 2006 - E-commerce setup', 9200.00, '2024-12-30', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Startup Inovação', '66.777.888/0001-99', 'NF 2007 - MVP desenvolvimento', 18000.00, '2025-01-15', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Academia Fitness', '77.888.999/0001-00', 'NF 2008 - Sistema de gestão', 7500.00, '2025-01-20', 'pendente', 'Receita de Serviços', '2024-12-01', 'nf_saida');

-- Recebidas
INSERT INTO contas_receber (company_id, user_id, cliente, cpf_cnpj_cliente, descricao, valor_total, data_vencimento, status, categoria, data_competencia, tipo_documento, recebido_em, valor_recebido) VALUES
  (v_company_id, v_user_id, 'Cliente João Silva', '123.456.789-00', 'NF 1998 - Consultoria Novembro', 7800.00, '2024-11-20', 'recebido', 'Receita de Serviços', '2024-11-01', 'nf_saida', '2024-11-18', 7800.00),
  (v_company_id, v_user_id, 'Empresa Beta LTDA', '11.222.333/0001-44', 'NF 1999 - Projeto Beta', 12500.00, '2024-11-25', 'recebido', 'Receita de Serviços', '2024-11-01', 'nf_saida', '2024-11-25', 12500.00),
  (v_company_id, v_user_id, 'Comércio Central', '22.333.444/0001-55', 'NF 2000 - Manutenção', 3200.00, '2024-12-05', 'recebido', 'Receita de Serviços', '2024-12-01', 'nf_saida', '2024-12-03', 3200.00),
  (v_company_id, v_user_id, 'Indústria Gama', '33.444.555/0001-66', 'NF 1997 - Licença software', 4500.00, '2024-11-15', 'recebido', 'Receita de Serviços', '2024-11-01', 'nf_saida', '2024-11-15', 4500.00);

-- Vencidas
INSERT INTO contas_receber (company_id, user_id, cliente, cpf_cnpj_cliente, descricao, valor_total, data_vencimento, status, categoria, data_competencia, tipo_documento) VALUES
  (v_company_id, v_user_id, 'Cliente Inadimplente', '88.999.000/0001-11', 'NF 1995 - Serviços Setembro', 5600.00, '2024-10-20', 'vencido', 'Receita de Serviços', '2024-09-01', 'nf_saida'),
  (v_company_id, v_user_id, 'Empresa Atrasada', '99.000.111/0001-22', 'NF 1996 - Consultoria Outubro', 8900.00, '2024-11-10', 'vencido', 'Receita de Serviços', '2024-10-01', 'nf_saida');

-- =====================================================
-- 6. FATURAS
-- =====================================================
-- Emitidas
INSERT INTO faturas (company_id, user_id, destinatario, cpf_cnpj_destinatario, descricao, valor, status, numero_nota, tipo_documento, data_emissao, data_vencimento, data_competencia) VALUES
  (v_company_id, v_user_id, 'Cliente João Silva', '123.456.789-00', 'Serviços de consultoria empresarial', 8500.00, 'emitida', 'NF-2001', 'nf_saida', '2024-12-15', '2024-12-20', '2024-12-01'),
  (v_company_id, v_user_id, 'Empresa Beta LTDA', '11.222.333/0001-44', 'Projeto Alpha - Desenvolvimento', 15000.00, 'emitida', 'NF-2002', 'nf_saida', '2024-12-16', '2024-12-25', '2024-12-01'),
  (v_company_id, v_user_id, 'Comércio Central', '22.333.444/0001-55', 'Implementação de sistema ERP', 12000.00, 'emitida', 'NF-2003', 'nf_saida', '2024-12-17', '2024-12-28', '2024-12-01'),
  (v_company_id, v_user_id, 'Indústria Gama', '33.444.555/0001-66', 'Contrato de suporte anual', 6500.00, 'emitida', 'NF-2004', 'nf_saida', '2024-12-17', '2025-01-05', '2024-12-01'),
  (v_company_id, v_user_id, 'Consultoria Delta', '44.555.666/0001-77', 'Treinamento corporativo', 4800.00, 'emitida', 'NF-2005', 'nf_saida', '2024-12-17', '2025-01-10', '2024-12-01');

-- Pendentes (rascunho)
INSERT INTO faturas (company_id, user_id, destinatario, cpf_cnpj_destinatario, descricao, valor, status, tipo_documento, data_competencia) VALUES
  (v_company_id, v_user_id, 'Loja Virtual Shop', '55.666.777/0001-88', 'Setup plataforma e-commerce', 9200.00, 'pendente', 'nf_saida', '2024-12-01'),
  (v_company_id, v_user_id, 'Startup Inovação', '66.777.888/0001-99', 'Desenvolvimento MVP', 18000.00, 'pendente', 'nf_saida', '2024-12-01'),
  (v_company_id, v_user_id, 'Academia Fitness', '77.888.999/0001-00', 'Sistema de gestão de clientes', 7500.00, 'pendente', 'nf_saida', '2024-12-01');

-- Pagas
INSERT INTO faturas (company_id, user_id, destinatario, cpf_cnpj_destinatario, descricao, valor, status, numero_nota, tipo_documento, data_emissao, data_vencimento, data_competencia) VALUES
  (v_company_id, v_user_id, 'Cliente João Silva', '123.456.789-00', 'Consultoria Novembro', 7800.00, 'paga', 'NF-1998', 'nf_saida', '2024-11-10', '2024-11-20', '2024-11-01'),
  (v_company_id, v_user_id, 'Empresa Beta LTDA', '11.222.333/0001-44', 'Projeto Beta finalizado', 12500.00, 'paga', 'NF-1999', 'nf_saida', '2024-11-15', '2024-11-25', '2024-11-01');

RAISE NOTICE 'Dados de teste populados com sucesso para empresa Full BPO!';
RAISE NOTICE 'Company ID: %', v_company_id;
RAISE NOTICE 'User ID: %', v_user_id;

END $$;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS
-- =====================================================
SELECT 'RESUMO DOS DADOS POPULADOS' as info;
SELECT 'contacts' as tabela, COUNT(*) as total FROM contacts WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2'
UNION ALL SELECT 'bank_accounts', COUNT(*) FROM bank_accounts WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2'
UNION ALL SELECT 'bank_transactions', COUNT(*) FROM bank_transactions WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2'
UNION ALL SELECT 'contas_pagar', COUNT(*) FROM contas_pagar WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2'
UNION ALL SELECT 'contas_receber', COUNT(*) FROM contas_receber WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2'
UNION ALL SELECT 'faturas', COUNT(*) FROM faturas WHERE company_id = '371f6e9f-31e2-4ef4-bf00-65495f0688a2';
