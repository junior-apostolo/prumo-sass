"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { settingsApi, type WorkspaceSettings } from "@/lib/settings";

// ─── Perfil ──────────────────────────────────────────────────────────────────

function PerfilCard() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsApi.updateProfile({
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      // preserva role e workspaceId do usuário atual
      if (user) setUser({ ...user, name: updated.name, email: updated.email });
      toast.success("Perfil atualizado");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      if (msg.includes("409") || msg.toLowerCase().includes("uso")) {
        toast.error("Este email já está em uso por outra conta");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Seu nome e email de acesso</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Senha ────────────────────────────────────────────────────────────────────

function SenhaCard() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (form.newPassword.length < 8 || !/\d/.test(form.newPassword)) {
      toast.error("Nova senha deve ter pelo menos 8 caracteres e 1 número");
      return;
    }
    setSaving(true);
    try {
      await settingsApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Senha alterada com sucesso");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar senha";
      if (msg.toLowerCase().includes("incorreta") || msg.includes("400")) {
        toast.error("Senha atual incorreta");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>Mínimo 8 caracteres e pelo menos 1 número</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Empresa ─────────────────────────────────────────────────────────────────

function EmpresaCard({ workspace, onSave }: {
  workspace: WorkspaceSettings | null;
  onSave: (updated: WorkspaceSettings) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    emailContato: "",
    endereco: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name ?? "",
        razaoSocial: workspace.razaoSocial ?? "",
        cnpj: workspace.cnpj ?? "",
        telefone: workspace.telefone ?? "",
        emailContato: workspace.emailContato ?? "",
        endereco: workspace.endereco ?? "",
      });
    }
  }, [workspace]);

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsApi.updateWorkspace({
        name: form.name.trim() || undefined,
        razaoSocial: form.razaoSocial.trim() || undefined,
        cnpj: form.cnpj.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        emailContato: form.emailContato.trim() || undefined,
        endereco: form.endereco.trim() || undefined,
      });
      onSave(updated);
      toast.success("Dados da empresa salvos");
    } catch {
      toast.error("Erro ao salvar dados da empresa");
    } finally {
      setSaving(false);
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type={opts?.type ?? "text"}
          placeholder={opts?.placeholder}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da empresa</CardTitle>
        <CardDescription>Aparecem no cabeçalho e rodapé dos PDFs gerados</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
          {field("name", "Nome da empresa *")}
          {field("razaoSocial", "Razão social", { placeholder: "Nome jurídico da empresa" })}
          {field("cnpj", "CNPJ", { placeholder: "00.000.000/0000-00" })}
          {field("telefone", "Telefone", { placeholder: "(00) 00000-0000" })}
          {field("emailContato", "Email de contato", { type: "email" })}
          {field("endereco", "Endereço")}
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar empresa"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Logo ────────────────────────────────────────────────────────────────────

function LogoCard({ logoUrl }: { logoUrl: string | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Logo da empresa</CardTitle>
          <Badge variant="secondary">Em breve</Badge>
        </div>
        <CardDescription>
          Usada automaticamente no cabeçalho dos PDFs. Disponível após configurar armazenamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo da empresa"
            className="h-16 object-contain rounded border p-2 bg-muted"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma logo configurada.</p>
        )}
        <div className="mt-4">
          <Button disabled title="Disponível após configurar Cloudflare R2 ou AWS S3">
            Fazer upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [workspace, setWorkspace] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    settingsApi
      .getWorkspace()
      .then(setWorkspace)
      .catch(() => toast.error("Erro ao carregar configurações"));
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <PerfilCard />
      <SenhaCard />
      <EmpresaCard workspace={workspace} onSave={setWorkspace} />
      <LogoCard logoUrl={workspace?.logoUrl ?? null} />
    </div>
  );
}
