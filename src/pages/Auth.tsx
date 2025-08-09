import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = mode === "login" ? "Entrar • FullBPO" : "Criar conta • FullBPO";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Autenticação segura na plataforma FullBPO OptiCore: login e cadastro por email.");
    }
  }, [mode]);

  useEffect(() => {
    // If already authenticated, go to main page
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Não foi possível entrar", description: error.message, variant: "destructive" });
      return;
    }
    const from = (location.state as any)?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const handleSignup = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Cadastro falhou", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Verifique seu email", description: "Enviamos um link de confirmação para concluir o cadastro." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Entrar na plataforma" : "Criar sua conta"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
          </div>
          <Button className="w-full" onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}>
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            {mode === "login" ? (
              <span>
                Não tem conta? {" "}
                <button className="underline" onClick={() => setMode("signup")}>Cadastre-se</button>
              </span>
            ) : (
              <span>
                Já possui conta? {" "}
                <button className="underline" onClick={() => setMode("login")}>Entrar</button>
              </span>
            )}
          </div>
          <div className="text-center">
            <Link to="/" className="underline text-sm">Ir para a página inicial</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
