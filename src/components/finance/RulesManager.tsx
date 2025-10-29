import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyContext } from "@/contexts/CompanyContext";

interface Rule { id: string; pattern: string; category: string }

export const RulesManager: React.FC = () => {
  const { toast } = useToast();
  const { activeCompanyId } = useCompanyContext();
  const [userId, setUserId] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [pattern, setPattern] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      loadRules(activeCompanyId);
    } else {
      setRules([]);
    }
  }, [activeCompanyId]);

  const loadRules = async (cid: string) => {
    const { data, error } = await supabase
      .from("transaction_rules")
      .select("id,pattern,category")
      .eq("company_id", cid)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar regras", description: error.message, variant: "destructive" });
    } else {
      setRules((data as any[]) as Rule[]);
    }
  };

  const addRule = async () => {
    if (!activeCompanyId || !userId) return;
    if (!pattern.trim() || !category.trim()) {
      toast({ title: "Preencha padrão e categoria", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("transaction_rules")
      .insert({ user_id: userId, company_id: activeCompanyId, pattern: pattern.trim(), category: category.trim() });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      setPattern("");
      setCategory("");
      loadRules(activeCompanyId);
      toast({ title: "Regra adicionada" });
    }
    setLoading(false);
  };

  const removeRule = async (id: string) => {
    if (!activeCompanyId) return;
    const { error } = await supabase.from("transaction_rules").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Regra removida" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="text-sm text-muted-foreground">Padrão (contém)</label>
          <Input placeholder="ex: pix recebido" value={pattern} onChange={(e) => setPattern(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-sm text-muted-foreground">Categoria</label>
          <Input placeholder="ex: Receitas" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <Button onClick={addRule} disabled={loading || !activeCompanyId}>Adicionar regra</Button>
      </div>

      <div className="rounded-md border divide-y">
        {rules.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Nenhuma regra cadastrada.</div>
        ) : (
          rules.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm"><span className="text-muted-foreground">Se descrição contém</span> “{r.pattern}”</div>
                <div className="text-sm text-muted-foreground">Categoria: <span className="font-medium text-foreground">{r.category}</span></div>
              </div>
              <Button variant="outline" onClick={() => removeRule(r.id)}>Remover</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RulesManager;
