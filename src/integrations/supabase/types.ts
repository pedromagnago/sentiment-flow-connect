export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      companies: {
        Row: {
          clickup_api_key: string | null
          clickup_integration_status: string | null
          clickup_workspace_id: string | null
          cnpj: string | null
          created_at: string | null
          data_cadastro: string | null
          deleted_at: string | null
          id: string
          informacoes_contato: Json | null
          nome: string | null
          omie_api_key: string | null
          omie_api_secret: string | null
          omie_company_id: string | null
          omie_integration_status: string | null
          segmento: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          clickup_api_key?: string | null
          clickup_integration_status?: string | null
          clickup_workspace_id?: string | null
          cnpj?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          deleted_at?: string | null
          id?: string
          informacoes_contato?: Json | null
          nome?: string | null
          omie_api_key?: string | null
          omie_api_secret?: string | null
          omie_company_id?: string | null
          omie_integration_status?: string | null
          segmento?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          clickup_api_key?: string | null
          clickup_integration_status?: string | null
          clickup_workspace_id?: string | null
          cnpj?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          deleted_at?: string | null
          id?: string
          informacoes_contato?: Json | null
          nome?: string | null
          omie_api_key?: string | null
          omie_api_secret?: string | null
          omie_company_id?: string | null
          omie_integration_status?: string | null
          segmento?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          data_criacao: string | null
          empresa_id: string | null
          feedback: boolean | null
          id_contact: string
          is_group: boolean | null
          nome: string | null
          status: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_criacao?: string | null
          empresa_id?: string | null
          feedback?: boolean | null
          id_contact: string
          is_group?: boolean | null
          nome?: string | null
          status?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_criacao?: string | null
          empresa_id?: string | null
          feedback?: boolean | null
          id_contact?: string
          is_group?: boolean | null
          nome?: string | null
          status?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_empresa_id_fkey"
            columns: ["empresa_id"]
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
          created_at: string | null
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
          updated_at: string | null
          "workflow.id": string | null
          "workflow.name": string | null
        }
        Insert: {
          contact_id?: string | null
          conteudo_mensagem?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Update: {
          contact_id?: string | null
          conteudo_mensagem?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
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
          "workflow.id"?: string | null
          "workflow.name"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
