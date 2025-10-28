export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_classification_rules: {
        Row: {
          actions: Json
          active: boolean
          company_id: string
          conditions: Json
          created_at: string
          id: string
          priority: number
          rule_name: string
          rule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          company_id: string
          conditions?: Json
          created_at?: string
          id?: string
          priority?: number
          rule_name: string
          rule_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          active?: boolean
          company_id?: string
          conditions?: Json
          created_at?: string
          id?: string
          priority?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_classification_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      analise_sentimento_diario: {
        Row: {
          created_at: string
          data: string | null
          "execution.id": string | null
          feedback: string | null
          id: number
          id_contact: string | null
          "workflow.id": string | null
          "workflow.name": string | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          "execution.id"?: string | null
          feedback?: string | null
          id?: number
          id_contact?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Update: {
          created_at?: string
          data?: string | null
          "execution.id"?: string | null
          feedback?: string | null
          id?: number
          id_contact?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
      }
      analise_sentimento_semanal: {
        Row: {
          ano: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          feedback: string | null
          id: number
          id_contact: string | null
          semana: number | null
        }
        Insert: {
          ano?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          feedback?: string | null
          id?: number
          id_contact?: string | null
          semana?: number | null
        }
        Update: {
          ano?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          feedback?: string | null
          id?: number
          id_contact?: string | null
          semana?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_id: string
          acct_type: string | null
          bank_id: string | null
          branch_id: string | null
          company_id: string
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          acct_type?: string | null
          bank_id?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          acct_type?: string | null
          bank_id?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          account_id: string | null
          acct_type: string | null
          amount: number
          bank_account_uuid: string | null
          bank_id: string | null
          branch_id: string | null
          category: string | null
          centro_custo: string | null
          company_id: string
          cpf_cnpj_origem: string | null
          created_at: string
          data_competencia: string | null
          date: string
          description: string | null
          fitid: string | null
          historico_atividades: Json | null
          id: string
          import_id: string | null
          match_score: number | null
          memo: string | null
          nome_origem: string | null
          projeto: string | null
          rateio: Json | null
          raw: Json | null
          reconciliado: boolean | null
          reconciliado_com_id: string | null
          reconciliado_com_tipo: string | null
          reconciliado_em: string | null
          reconciliado_por: string | null
          subcategoria: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          acct_type?: string | null
          amount: number
          bank_account_uuid?: string | null
          bank_id?: string | null
          branch_id?: string | null
          category?: string | null
          centro_custo?: string | null
          company_id: string
          cpf_cnpj_origem?: string | null
          created_at?: string
          data_competencia?: string | null
          date: string
          description?: string | null
          fitid?: string | null
          historico_atividades?: Json | null
          id?: string
          import_id?: string | null
          match_score?: number | null
          memo?: string | null
          nome_origem?: string | null
          projeto?: string | null
          rateio?: Json | null
          raw?: Json | null
          reconciliado?: boolean | null
          reconciliado_com_id?: string | null
          reconciliado_com_tipo?: string | null
          reconciliado_em?: string | null
          reconciliado_por?: string | null
          subcategoria?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          acct_type?: string | null
          amount?: number
          bank_account_uuid?: string | null
          bank_id?: string | null
          branch_id?: string | null
          category?: string | null
          centro_custo?: string | null
          company_id?: string
          cpf_cnpj_origem?: string | null
          created_at?: string
          data_competencia?: string | null
          date?: string
          description?: string | null
          fitid?: string | null
          historico_atividades?: Json | null
          id?: string
          import_id?: string | null
          match_score?: number | null
          memo?: string | null
          nome_origem?: string | null
          projeto?: string | null
          rateio?: Json | null
          raw?: Json | null
          reconciliado?: boolean | null
          reconciliado_com_id?: string | null
          reconciliado_com_tipo?: string | null
          reconciliado_em?: string | null
          reconciliado_por?: string | null
          subcategoria?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_uuid_fkey"
            columns: ["bank_account_uuid"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "transaction_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          aceitar_politica_privacidade: boolean | null
          assignee: string | null
          atividade: string | null
          bairro: string | null
          cargo: string | null
          cargo_responsavel: string | null
          cep: string | null
          cidade: string | null
          clickup_api_key: string | null
          clickup_integration_status: string | null
          clickup_workspace_id: string | null
          client_id: string | null
          cnpj: string | null
          companies_id: string | null
          complemento: string | null
          cpf_representante: string | null
          created_at: string | null
          data_cadastro: string | null
          date_closed: string | null
          date_created: string | null
          deleted_at: string | null
          desconto_percentual: number | null
          due_date: string | null
          email: string | null
          email_contato: string | null
          email_representante: string | null
          email_testemunha: string | null
          endereco: string | null
          envelope_id: string | null
          estado: string | null
          feedback_ativo: boolean | null
          fonte_lead: string | null
          id: string
          informacoes_contato: Json | null
          linked_docs: string | null
          n8n_integration_active: boolean | null
          nome: string | null
          nome_contato: string | null
          nome_representante: string | null
          nome_testemunha: string | null
          numero: string | null
          omie_api_key: string | null
          omie_api_secret: string | null
          omie_company_id: string | null
          omie_integration_status: string | null
          prazo_desconto: number | null
          priority: string | null
          responsavel: string | null
          segmento: string | null
          start_date: string | null
          status: string | null
          task_id: string | null
          task_name: string | null
          task_status: string | null
          telefone: string | null
          tipo_contrato: string | null
          updated_at: string | null
          valor_mensalidade: number | null
          whatsapp_contato: string | null
        }
        Insert: {
          aceitar_politica_privacidade?: boolean | null
          assignee?: string | null
          atividade?: string | null
          bairro?: string | null
          cargo?: string | null
          cargo_responsavel?: string | null
          cep?: string | null
          cidade?: string | null
          clickup_api_key?: string | null
          clickup_integration_status?: string | null
          clickup_workspace_id?: string | null
          client_id?: string | null
          cnpj?: string | null
          companies_id?: string | null
          complemento?: string | null
          cpf_representante?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          date_closed?: string | null
          date_created?: string | null
          deleted_at?: string | null
          desconto_percentual?: number | null
          due_date?: string | null
          email?: string | null
          email_contato?: string | null
          email_representante?: string | null
          email_testemunha?: string | null
          endereco?: string | null
          envelope_id?: string | null
          estado?: string | null
          feedback_ativo?: boolean | null
          fonte_lead?: string | null
          id?: string
          informacoes_contato?: Json | null
          linked_docs?: string | null
          n8n_integration_active?: boolean | null
          nome?: string | null
          nome_contato?: string | null
          nome_representante?: string | null
          nome_testemunha?: string | null
          numero?: string | null
          omie_api_key?: string | null
          omie_api_secret?: string | null
          omie_company_id?: string | null
          omie_integration_status?: string | null
          prazo_desconto?: number | null
          priority?: string | null
          responsavel?: string | null
          segmento?: string | null
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          task_name?: string | null
          task_status?: string | null
          telefone?: string | null
          tipo_contrato?: string | null
          updated_at?: string | null
          valor_mensalidade?: number | null
          whatsapp_contato?: string | null
        }
        Update: {
          aceitar_politica_privacidade?: boolean | null
          assignee?: string | null
          atividade?: string | null
          bairro?: string | null
          cargo?: string | null
          cargo_responsavel?: string | null
          cep?: string | null
          cidade?: string | null
          clickup_api_key?: string | null
          clickup_integration_status?: string | null
          clickup_workspace_id?: string | null
          client_id?: string | null
          cnpj?: string | null
          companies_id?: string | null
          complemento?: string | null
          cpf_representante?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          date_closed?: string | null
          date_created?: string | null
          deleted_at?: string | null
          desconto_percentual?: number | null
          due_date?: string | null
          email?: string | null
          email_contato?: string | null
          email_representante?: string | null
          email_testemunha?: string | null
          endereco?: string | null
          envelope_id?: string | null
          estado?: string | null
          feedback_ativo?: boolean | null
          fonte_lead?: string | null
          id?: string
          informacoes_contato?: Json | null
          linked_docs?: string | null
          n8n_integration_active?: boolean | null
          nome?: string | null
          nome_contato?: string | null
          nome_representante?: string | null
          nome_testemunha?: string | null
          numero?: string | null
          omie_api_key?: string | null
          omie_api_secret?: string | null
          omie_company_id?: string | null
          omie_integration_status?: string | null
          prazo_desconto?: number | null
          priority?: string | null
          responsavel?: string | null
          segmento?: string | null
          start_date?: string | null
          status?: string | null
          task_id?: string | null
          task_name?: string | null
          task_status?: string | null
          telefone?: string | null
          tipo_contrato?: string | null
          updated_at?: string | null
          valor_mensalidade?: number | null
          whatsapp_contato?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          data_criacao: string | null
          feedback: boolean | null
          id_contact: string
          is_group: boolean | null
          nome: string | null
          status: boolean | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          data_criacao?: string | null
          feedback?: boolean | null
          id_contact: string
          is_group?: boolean | null
          nome?: string | null
          status?: boolean | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          data_criacao?: string | null
          feedback?: boolean | null
          id_contact?: string
          is_group?: boolean | null
          nome?: string | null
          status?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_fullbpo: {
        Row: {
          created_at: string
          id: number
          nome: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          beneficiario: string
          categoria: string | null
          centro_custo: string | null
          chave_nfe: string | null
          company_id: string
          comprovante_url: string | null
          contact_id: string | null
          cpf_cnpj_beneficiario: string | null
          created_at: string
          data_competencia: string | null
          descricao: string | null
          documento_original_url: string | null
          forma_pagamento: string | null
          historico_atividades: Json | null
          id: string
          message_id: string | null
          numero_recibo: string | null
          observacoes: string | null
          pagamentos_parciais: Json | null
          pago_em: string | null
          projeto: string | null
          rateio: Json | null
          saldo_devedor: number | null
          status: string
          subcategoria: string | null
          suggested_action_id: string | null
          tags: string[] | null
          tipo_documento: string | null
          updated_at: string
          user_id: string
          valor: number
          valor_pago: number | null
          vencimento: string
        }
        Insert: {
          beneficiario: string
          categoria?: string | null
          centro_custo?: string | null
          chave_nfe?: string | null
          company_id: string
          comprovante_url?: string | null
          contact_id?: string | null
          cpf_cnpj_beneficiario?: string | null
          created_at?: string
          data_competencia?: string | null
          descricao?: string | null
          documento_original_url?: string | null
          forma_pagamento?: string | null
          historico_atividades?: Json | null
          id?: string
          message_id?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          pagamentos_parciais?: Json | null
          pago_em?: string | null
          projeto?: string | null
          rateio?: Json | null
          saldo_devedor?: number | null
          status?: string
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string | null
          updated_at?: string
          user_id: string
          valor: number
          valor_pago?: number | null
          vencimento: string
        }
        Update: {
          beneficiario?: string
          categoria?: string | null
          centro_custo?: string | null
          chave_nfe?: string | null
          company_id?: string
          comprovante_url?: string | null
          contact_id?: string | null
          cpf_cnpj_beneficiario?: string | null
          created_at?: string
          data_competencia?: string | null
          descricao?: string | null
          documento_original_url?: string | null
          forma_pagamento?: string | null
          historico_atividades?: Json | null
          id?: string
          message_id?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          pagamentos_parciais?: Json | null
          pago_em?: string | null
          projeto?: string | null
          rateio?: Json | null
          saldo_devedor?: number | null
          status?: string
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
          valor_pago?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_suggested_action_id_fkey"
            columns: ["suggested_action_id"]
            isOneToOne: false
            referencedRelation: "suggested_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          aprovador_id: string | null
          categoria: string | null
          centro_custo: string | null
          chave_nfe: string | null
          cliente: string
          company_id: string
          comprovante_url: string | null
          contact_id: string | null
          cpf_cnpj_cliente: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_competencia: string
          data_emissao: string | null
          data_vencimento: string
          descricao: string
          documento_original_url: string | null
          fatura_id: string | null
          forma_recebimento: string | null
          historico_atividades: Json | null
          id: string
          message_id: string | null
          numero_recibo: string | null
          observacoes: string | null
          projeto: string | null
          rateio: Json | null
          recebido_em: string | null
          recebimentos_parciais: Json | null
          saldo_devedor: number | null
          status: string
          status_aprovacao: string | null
          subcategoria: string | null
          suggested_action_id: string | null
          tags: string[] | null
          tipo_documento: string
          tipo_titulo: string | null
          updated_at: string | null
          user_id: string
          valor_recebido: number | null
          valor_total: number
        }
        Insert: {
          aprovador_id?: string | null
          categoria?: string | null
          centro_custo?: string | null
          chave_nfe?: string | null
          cliente: string
          company_id: string
          comprovante_url?: string | null
          contact_id?: string | null
          cpf_cnpj_cliente?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_competencia: string
          data_emissao?: string | null
          data_vencimento: string
          descricao: string
          documento_original_url?: string | null
          fatura_id?: string | null
          forma_recebimento?: string | null
          historico_atividades?: Json | null
          id?: string
          message_id?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          projeto?: string | null
          rateio?: Json | null
          recebido_em?: string | null
          recebimentos_parciais?: Json | null
          saldo_devedor?: number | null
          status?: string
          status_aprovacao?: string | null
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string
          tipo_titulo?: string | null
          updated_at?: string | null
          user_id: string
          valor_recebido?: number | null
          valor_total: number
        }
        Update: {
          aprovador_id?: string | null
          categoria?: string | null
          centro_custo?: string | null
          chave_nfe?: string | null
          cliente?: string
          company_id?: string
          comprovante_url?: string | null
          contact_id?: string | null
          cpf_cnpj_cliente?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_competencia?: string
          data_emissao?: string | null
          data_vencimento?: string
          descricao?: string
          documento_original_url?: string | null
          fatura_id?: string | null
          forma_recebimento?: string | null
          historico_atividades?: Json | null
          id?: string
          message_id?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          projeto?: string | null
          rateio?: Json | null
          recebido_em?: string | null
          recebimentos_parciais?: Json | null
          saldo_devedor?: number | null
          status?: string
          status_aprovacao?: string | null
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string
          tipo_titulo?: string | null
          updated_at?: string | null
          user_id?: string
          valor_recebido?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id_contact"]
          },
          {
            foreignKeyName: "contas_receber_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_suggested_action_id_fkey"
            columns: ["suggested_action_id"]
            isOneToOne: false
            referencedRelation: "suggested_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_assignments: {
        Row: {
          assigned_at: string | null
          contact_id: string
          created_at: string | null
          id: string
          priority: string
          sla_deadline: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          contact_id: string
          created_at?: string | null
          id?: string
          priority?: string
          sla_deadline?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          contact_id?: string
          created_at?: string | null
          id?: string
          priority?: string
          sla_deadline?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          analysis_result: Json
          company_id: string
          contact_id: string | null
          created_at: string
          extracted_text: string | null
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          message_id: string | null
          status: string
          suggested_action_id: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result: Json
          company_id: string
          contact_id?: string | null
          created_at?: string
          extracted_text?: string | null
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          message_id?: string | null
          status?: string
          suggested_action_id?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json
          company_id?: string
          contact_id?: string | null
          created_at?: string
          extracted_text?: string | null
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          message_id?: string | null
          status?: string
          suggested_action_id?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_analysis_suggested_action_id_fkey"
            columns: ["suggested_action_id"]
            isOneToOne: false
            referencedRelation: "suggested_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string | null
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          company_id?: string | null
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          company_id?: string | null
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          centro_custo: string | null
          cfop: string | null
          chave_nfe: string | null
          company_id: string
          contact_id: string | null
          cpf_cnpj_destinatario: string | null
          created_at: string
          data_competencia: string | null
          data_emissao: string | null
          data_vencimento: string | null
          descricao: string
          destinatario: string
          emitida_em: string | null
          historico_atividades: Json | null
          id: string
          is_recibo_simples: boolean | null
          itens_fatura: Json | null
          message_id: string | null
          natureza_operacao: string | null
          numero_nota: string | null
          numero_recibo: string | null
          observacoes: string | null
          pdf_url: string | null
          projeto: string | null
          rateio: Json | null
          status: string
          subcategoria: string | null
          suggested_action_id: string | null
          tags: string[] | null
          tipo_documento: string | null
          tipo_nota: string | null
          updated_at: string
          user_id: string
          valor: number
          xml_url: string | null
        }
        Insert: {
          centro_custo?: string | null
          cfop?: string | null
          chave_nfe?: string | null
          company_id: string
          contact_id?: string | null
          cpf_cnpj_destinatario?: string | null
          created_at?: string
          data_competencia?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          descricao: string
          destinatario: string
          emitida_em?: string | null
          historico_atividades?: Json | null
          id?: string
          is_recibo_simples?: boolean | null
          itens_fatura?: Json | null
          message_id?: string | null
          natureza_operacao?: string | null
          numero_nota?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          pdf_url?: string | null
          projeto?: string | null
          rateio?: Json | null
          status?: string
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string | null
          tipo_nota?: string | null
          updated_at?: string
          user_id: string
          valor: number
          xml_url?: string | null
        }
        Update: {
          centro_custo?: string | null
          cfop?: string | null
          chave_nfe?: string | null
          company_id?: string
          contact_id?: string | null
          cpf_cnpj_destinatario?: string | null
          created_at?: string
          data_competencia?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          descricao?: string
          destinatario?: string
          emitida_em?: string | null
          historico_atividades?: Json | null
          id?: string
          is_recibo_simples?: boolean | null
          itens_fatura?: Json | null
          message_id?: string | null
          natureza_operacao?: string | null
          numero_nota?: string | null
          numero_recibo?: string | null
          observacoes?: string | null
          pdf_url?: string | null
          projeto?: string | null
          rateio?: Json | null
          status?: string
          subcategoria?: string | null
          suggested_action_id?: string | null
          tags?: string[] | null
          tipo_documento?: string | null
          tipo_nota?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_suggested_action_id_fkey"
            columns: ["suggested_action_id"]
            isOneToOne: false
            referencedRelation: "suggested_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      formularios_onboarding: {
        Row: {
          answers: Json | null
          company_id: string
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          company_id: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formularios_onboarding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      groups_message: {
        Row: {
          contact_id: string | null
          created_at: string | null
          "execution.id": string | null
          grupo_mensagens: string | null
          id: string
          id_whatsapp: string | null
          nome_grupo: string | null
          quantidade_tarefas: number | null
          resposta_ia: string | null
          tasks_ids: string[] | null
          tem_tarefa: boolean | null
          updated_at: string | null
          "workflow.id": string | null
          "workflow.name": string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          grupo_mensagens?: string | null
          id?: string
          id_whatsapp?: string | null
          nome_grupo?: string | null
          quantidade_tarefas?: number | null
          resposta_ia?: string | null
          tasks_ids?: string[] | null
          tem_tarefa?: boolean | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          grupo_mensagens?: string | null
          id?: string
          id_whatsapp?: string | null
          nome_grupo?: string | null
          quantidade_tarefas?: number | null
          resposta_ia?: string | null
          tasks_ids?: string[] | null
          tem_tarefa?: boolean | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
      }
      grupos_avaliacao_ia: {
        Row: {
          created_at: string
          id: number
          "Id do Grupo de Envio": string | null
          "Id do Grupo Original": string | null
          "Nome do Grupo": string | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Id do Grupo de Envio"?: string | null
          "Id do Grupo Original"?: string | null
          "Nome do Grupo"?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          "Id do Grupo de Envio"?: string | null
          "Id do Grupo Original"?: string | null
          "Nome do Grupo"?: string | null
        }
        Relationships: []
      }
      grupos_ia_revisao_ativa: {
        Row: {
          created_at: string
          id: number
          id_grupo: string | null
          id_grupo_mensagens: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_grupo?: string | null
          id_grupo_mensagens?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_grupo?: string | null
          id_grupo_mensagens?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          contact_id: string | null
          conteudo_mensagem: string | null
          created_at: string
          data_hora: string | null
          "execution.id": string | null
          fromme: boolean | null
          id: string
          link_arquivo: string | null
          message_id: string | null
          nome_grupo: string | null
          nome_membro: string | null
          status_processamento: string | null
          telefone_membro: string | null
          tipo_mensagem: string | null
          updated_at: string
          "workflow.id": string | null
          "workflow.name": string | null
        }
        Insert: {
          contact_id?: string | null
          conteudo_mensagem?: string | null
          created_at?: string
          data_hora?: string | null
          "execution.id"?: string | null
          fromme?: boolean | null
          id?: string
          link_arquivo?: string | null
          message_id?: string | null
          nome_grupo?: string | null
          nome_membro?: string | null
          status_processamento?: string | null
          telefone_membro?: string | null
          tipo_mensagem?: string | null
          updated_at?: string
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Update: {
          contact_id?: string | null
          conteudo_mensagem?: string | null
          created_at?: string
          data_hora?: string | null
          "execution.id"?: string | null
          fromme?: boolean | null
          id?: string
          link_arquivo?: string | null
          message_id?: string | null
          nome_grupo?: string | null
          nome_membro?: string | null
          status_processamento?: string | null
          telefone_membro?: string | null
          tipo_mensagem?: string | null
          updated_at?: string
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          company_id: string | null
          created_at: string
          display_name: string | null
          especialidade: string[] | null
          horario_atendimento: Json | null
          id: string
          max_atendimentos_simultaneos: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          especialidade?: string[] | null
          horario_atendimento?: Json | null
          id: string
          max_atendimentos_simultaneos?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          especialidade?: string[] | null
          horario_atendimento?: Json | null
          id?: string
          max_atendimentos_simultaneos?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_logs: {
        Row: {
          action: string | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: number
          nome: string | null
          valor: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nome?: string | null
          valor?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      suggested_actions: {
        Row: {
          action_type: string
          ai_confidence: number | null
          ai_suggestion: string | null
          contact_id: string
          created_at: string | null
          executed_at: string | null
          executed_by: string | null
          extracted_data: Json | null
          id: string
          message_id: string | null
          notes: string | null
          priority: string | null
          result_data: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_type: string
          ai_confidence?: number | null
          ai_suggestion?: string | null
          contact_id: string
          created_at?: string | null
          executed_at?: string | null
          executed_by?: string | null
          extracted_data?: Json | null
          id?: string
          message_id?: string | null
          notes?: string | null
          priority?: string | null
          result_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          ai_confidence?: number | null
          ai_suggestion?: string | null
          contact_id?: string
          created_at?: string | null
          executed_at?: string | null
          executed_by?: string | null
          extracted_data?: Json | null
          id?: string
          message_id?: string | null
          notes?: string | null
          priority?: string | null
          result_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggested_actions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_actions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      taskgrouprevisions: {
        Row: {
          contact_id: string | null
          created_at: string | null
          "execution.id": string | null
          feedback_cliente: string | null
          id: string
          id_groups_message: string | null
          message_id: string | null
          status: string | null
          texto_tarefa_formatado: string | null
          updated_at: string | null
          "workflow.id": string | null
          "workflow.name": string | null
          zaap_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          feedback_cliente?: string | null
          id: string
          id_groups_message?: string | null
          message_id?: string | null
          status?: string | null
          texto_tarefa_formatado?: string | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
          zaap_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          feedback_cliente?: string | null
          id?: string
          id_groups_message?: string | null
          message_id?: string | null
          status?: string | null
          texto_tarefa_formatado?: string | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
          zaap_id?: string | null
        }
        Relationships: []
      }
      taskgroups: {
        Row: {
          approved_message_id: string | null
          created_at: string | null
          "execution.id": string | null
          id: string
          id_whatsapp: string | null
          nome_grupo: string | null
          status_clickup: string | null
          task_group_revision_id: string | null
          updated_at: string | null
          "workflow.id": string | null
          "workflow.name": string | null
        }
        Insert: {
          approved_message_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          id?: string
          id_whatsapp?: string | null
          nome_grupo?: string | null
          status_clickup?: string | null
          task_group_revision_id?: string | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Update: {
          approved_message_id?: string | null
          created_at?: string | null
          "execution.id"?: string | null
          id?: string
          id_whatsapp?: string | null
          nome_grupo?: string | null
          status_clickup?: string | null
          task_group_revision_id?: string | null
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          company_id: string
          completed_at: string | null
          contact_id: string | null
          created_at: string
          descricao: string | null
          id: string
          message_id: string | null
          observacoes: string | null
          prazo: string | null
          prioridade: string
          responsavel_id: string | null
          status: string
          suggested_action_id: string | null
          tags: string[] | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          message_id?: string | null
          observacoes?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          suggested_action_id?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          message_id?: string | null
          observacoes?: string | null
          prazo?: string | null
          prioridade?: string
          responsavel_id?: string | null
          status?: string
          suggested_action_id?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_suggested_action_id_fkey"
            columns: ["suggested_action_id"]
            isOneToOne: false
            referencedRelation: "suggested_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string
          id: string
          invited_at: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: []
      }
      transaction_imports: {
        Row: {
          company_id: string
          created_at: string
          file_name: string | null
          id: string
          imported_transactions: number
          source: string
          status: string
          total_transactions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          imported_transactions?: number
          source?: string
          status?: string
          total_transactions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          imported_transactions?: number
          source?: string
          status?: string
          total_transactions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_rules: {
        Row: {
          category: string
          company_id: string
          created_at: string
          id: string
          pattern: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          id?: string
          pattern: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          id?: string
          pattern?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_company_id: { Args: never; Returns: string }
      get_user_roles: {
        Args: { _company_id?: string; _user_id: string }
        Returns: {
          company_id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_company_access: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _company_id?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          p_action: string
          p_ip_address?: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id?: string
          p_table_name: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      is_admin_or_owner: {
        Args: { _company_id?: string; _user_id: string }
        Returns: boolean
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_tarefas: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "supervisor" | "operator" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "supervisor", "operator", "viewer"],
    },
  },
} as const
