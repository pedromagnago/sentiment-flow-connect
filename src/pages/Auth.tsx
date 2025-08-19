import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const titles = {
      login: "Entrar • FullBPO",
      signup: "Criar conta • FullBPO",
      forgot: "Recuperar senha • FullBPO"
    };
    document.title = titles[mode];
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Email obrigatório", description: "Digite seu email para recuperar a senha.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar email", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Email enviado", description: "Verifique seu email para o link de recuperação de senha." });
    setMode("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "login" && "Entrar na plataforma"}
            {mode === "signup" && "Criar sua conta"}
            {mode === "forgot" && "Recuperar senha"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
            </div>
          )}
          <Button 
            className="w-full" 
            onClick={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword} 
            disabled={loading}
          >
            {loading ? "Processando..." : mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Enviar link de recuperação"}
          </Button>
          <div className="text-sm text-muted-foreground text-center space-y-2">
            {mode === "login" && (
              <>
                <div>
                  Não tem conta? {" "}
                  <button className="underline" onClick={() => setMode("signup")}>Cadastre-se</button>
                </div>
                <div>
                  <button className="underline" onClick={() => setMode("forgot")}>Esqueci minha senha</button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                Já possui conta? {" "}
                <button className="underline" onClick={() => setMode("login")}>Entrar</button>
              </div>
            )}
            {mode === "forgot" && (
              <div>
                Lembrou da senha? {" "}
                <button className="underline" onClick={() => setMode("login")}>Voltar ao login</button>
              </div>
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
