import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Crown, 
  Shield, 
  Users, 
  Eye, 
  UserCog,
  Building2,
  Receipt,
  Scale,
  Upload,
  MessageCircle,
  Lightbulb,
  Settings,
  HelpCircle,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const config: Record<string, { icon: any; className: string }> = {
    owner: { icon: Crown, className: 'bg-amber-100 text-amber-800' },
    admin: { icon: Shield, className: 'bg-purple-100 text-purple-800' },
    supervisor: { icon: UserCog, className: 'bg-blue-100 text-blue-800' },
    operator: { icon: Users, className: 'bg-green-100 text-green-800' },
    viewer: { icon: Eye, className: 'bg-gray-100 text-gray-800' },
  };

  const { icon: Icon, className } = config[role] || config.viewer;

  return (
    <Badge className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

const GuideSection: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="text-muted-foreground space-y-2 pl-7">
      {children}
    </div>
  </div>
);

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground">Guias e tutoriais para cada tipo de usuário</p>
      </div>

      {/* Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Acesso</CardTitle>
          <CardDescription>Entenda os diferentes perfis e suas permissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <RoleBadge role="owner" />
              <p className="text-sm mt-2">Proprietário da empresa. Acesso total.</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RoleBadge role="admin" />
              <p className="text-sm mt-2">Administrador BPO. Gerencia equipe.</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RoleBadge role="supervisor" />
              <p className="text-sm mt-2">Supervisor BPO. Aprova ações.</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RoleBadge role="operator" />
              <p className="text-sm mt-2">Operador BPO. Executa tarefas.</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RoleBadge role="viewer" />
              <p className="text-sm mt-2">Visualizador. Apenas consulta.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guides by Role */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="admin">
            <Shield className="h-4 w-4 mr-2" />
            Admin/Owner
          </TabsTrigger>
          <TabsTrigger value="bpo">
            <Users className="h-4 w-4 mr-2" />
            BPO
          </TabsTrigger>
          <TabsTrigger value="client">
            <Eye className="h-4 w-4 mr-2" />
            Cliente
          </TabsTrigger>
        </TabsList>

        {/* Admin/Owner Guide */}
        <TabsContent value="admin" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Guia do Administrador
              </CardTitle>
              <CardDescription>Para owners e admins do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <GuideSection title="Implantação de Novo Cliente" icon={Building2}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Criar empresa:</strong> Vá em Configurações → Empresas → Nova Empresa</li>
                      <li><strong>Preencher dados:</strong> CNPJ, nome, endereço, contatos</li>
                      <li><strong>Convidar cliente:</strong> Equipe → Convidar → Email do cliente → Role: Viewer</li>
                      <li><strong>Atribuir operadores:</strong> Equipe → Selecionar operador → Adicionar empresa</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="Gerenciamento de Equipe" icon={Users}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Convidar membro:</strong> Equipe → Convidar Usuário</li>
                      <li><strong>Selecionar empresas:</strong> Escolha uma ou mais empresas para o novo membro</li>
                      <li><strong>Definir role:</strong> Owner, Admin, Supervisor, Operator ou Viewer</li>
                      <li><strong>Aguardar aceite:</strong> O convidado receberá email com link</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="Configurações do Sistema" icon={Settings}>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Categorias:</strong> Configure plano de contas para cada cliente</li>
                      <li><strong>Regras de IA:</strong> Crie regras automáticas de classificação</li>
                      <li><strong>Integrações:</strong> Configure ClickUp, Omie, ZAPI</li>
                      <li><strong>Auditoria:</strong> Monitore todas as ações do sistema</li>
                    </ul>
                  </GuideSection>

                  <GuideSection title="Permissões por Página" icon={Shield}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Página</th>
                            <th className="text-center py-2">Owner</th>
                            <th className="text-center py-2">Admin</th>
                            <th className="text-center py-2">Supervisor</th>
                            <th className="text-center py-2">Operator</th>
                            <th className="text-center py-2">Viewer</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b"><td>Dashboard</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td></tr>
                          <tr className="border-b"><td>Equipe</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">❌</td><td className="text-center">❌</td><td className="text-center">❌</td></tr>
                          <tr className="border-b"><td>Importação</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">❌</td><td className="text-center">❌</td></tr>
                          <tr className="border-b"><td>Reconciliação</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">❌</td></tr>
                          <tr className="border-b"><td>Configurações</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">❌</td><td className="text-center">❌</td><td className="text-center">❌</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </GuideSection>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BPO Guide */}
        <TabsContent value="bpo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Guia do Operador BPO
              </CardTitle>
              <CardDescription>Para supervisores e operadores</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <GuideSection title="Visão Geral (Dashboard BPO)" icon={Building2}>
                    <p>O Dashboard BPO mostra todos os clientes que você atende:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Verde:</strong> Cliente em dia, sem pendências críticas</li>
                      <li><strong>Amarelo:</strong> Requer atenção, pendências acumulando</li>
                      <li><strong>Vermelho:</strong> Crítico, ação imediata necessária</li>
                    </ul>
                  </GuideSection>

                  <GuideSection title="Importação de Dados" icon={Upload}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Selecionar empresa:</strong> Use o seletor no topo</li>
                      <li><strong>Ir em Importar:</strong> Gestão Financeira → Importar Dados</li>
                      <li><strong>Escolher ERP:</strong> Selecione o sistema do cliente</li>
                      <li><strong>Upload arquivo:</strong> OFX, CSV ou Excel</li>
                      <li><strong>Revisar preview:</strong> Confira os dados antes de confirmar</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="Reconciliação Bancária" icon={Scale}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Acessar:</strong> Gestão Financeira → Reconciliação Bancária</li>
                      <li><strong>Filtrar período:</strong> Selecione mês de competência</li>
                      <li><strong>Vincular transações:</strong> Arraste ou clique para vincular</li>
                      <li><strong>Classificar:</strong> Defina categoria e centro de custo</li>
                      <li><strong>Fechar período:</strong> Após reconciliar tudo, feche o período</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="Ações Sugeridas pela IA" icon={Lightbulb}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Revisar sugestões:</strong> IA & Análise → Ações Sugeridas</li>
                      <li><strong>Aprovar/Rejeitar:</strong> Analise cada sugestão</li>
                      <li><strong>Executar:</strong> Ações aprovadas são executadas automaticamente</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="WhatsApp (se habilitado)" icon={MessageCircle}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Classificar contatos:</strong> WhatsApp → Não Classificados</li>
                      <li><strong>Vincular à empresa:</strong> Selecione contato → Escolha empresa</li>
                      <li><strong>Atender conversas:</strong> WhatsApp → Fila</li>
                    </ol>
                  </GuideSection>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Guide */}
        <TabsContent value="client" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-500" />
                Guia do Cliente
              </CardTitle>
              <CardDescription>Para clientes (visualizadores)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <GuideSection title="Primeiro Acesso" icon={Building2}>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Receber convite:</strong> Você receberá um email com link</li>
                      <li><strong>Criar conta:</strong> Clique no link e cadastre sua senha</li>
                      <li><strong>Acessar dashboard:</strong> Você será redirecionado automaticamente</li>
                    </ol>
                  </GuideSection>

                  <GuideSection title="Visualizar Financeiro" icon={Receipt}>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Dashboard:</strong> Visão geral das finanças</li>
                      <li><strong>Contas a Pagar:</strong> Veja suas obrigações pendentes</li>
                      <li><strong>Contas a Receber:</strong> Acompanhe seus recebíveis</li>
                      <li><strong>DRE:</strong> Relatório de resultados</li>
                    </ul>
                    <p className="text-sm italic mt-2">
                      Nota: Como viewer, você pode visualizar mas não editar.
                    </p>
                  </GuideSection>

                  <GuideSection title="Enviar Documentos" icon={Upload}>
                    <p>Você pode enviar documentos para seu contador via:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>WhatsApp:</strong> Envie notas e comprovantes</li>
                      <li><strong>Email:</strong> Anexe documentos ao seu contador</li>
                    </ul>
                    <p className="text-sm italic mt-2">
                      Os documentos serão processados automaticamente pela IA.
                    </p>
                  </GuideSection>

                  <GuideSection title="Relatórios" icon={FileText}>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>DRE Gerencial:</strong> Resultado mensal detalhado</li>
                      <li><strong>Relatórios IA:</strong> Análises e insights automáticos</li>
                      <li><strong>Exportar:</strong> Baixe relatórios em PDF</li>
                    </ul>
                  </GuideSection>

                  <GuideSection title="Suporte" icon={HelpCircle}>
                    <p>Em caso de dúvidas:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Entre em contato com seu contador responsável</li>
                      <li>Use o WhatsApp da FullBPO para suporte</li>
                      <li>Consulte esta central de ajuda</li>
                    </ul>
                  </GuideSection>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como altero minha senha?</AccordionTrigger>
              <AccordionContent>
                Vá em Configurações → Perfil → Alterar Senha. Você também pode usar "Esqueci minha senha" na tela de login.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Como adiciono uma nova empresa?</AccordionTrigger>
              <AccordionContent>
                Apenas admins e owners podem criar empresas. Vá em Configurações → Empresas → Nova Empresa.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Por que não consigo acessar algumas páginas?</AccordionTrigger>
              <AccordionContent>
                Seu nível de acesso (role) determina quais páginas você pode ver. Viewers têm acesso limitado a visualização. Fale com seu admin para alterar permissões.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Como funciona a reconciliação automática?</AccordionTrigger>
              <AccordionContent>
                A IA analisa transações bancárias e sugere vínculos com contas a pagar/receber. Você revisa e aprova as sugestões. Transações como tarifas e transferências são ignoradas automaticamente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Posso acessar múltiplas empresas?</AccordionTrigger>
              <AccordionContent>
                Sim! Use o seletor de empresas no topo da barra lateral para alternar entre empresas ou visualizar dados consolidados de múltiplas empresas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
