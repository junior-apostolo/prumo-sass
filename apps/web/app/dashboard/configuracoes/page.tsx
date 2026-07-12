"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsApi, type WorkspaceSettings } from "@/lib/settings";

const inputClass =
  "h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15";
const labelClass = "text-[13px] font-medium text-[#334155]";
const primaryBtnClass =
  "rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_10px_24px_rgba(30,91,230,0.24)] h-10 px-5";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-5 py-8 first:pt-0 border-t border-[#EEF2F9] first:border-t-0 lg:grid-cols-[220px_1fr]">
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#9AA7BD]">
          {title}
        </p>
        <p className="text-[13.5px] text-[#6B7891] mt-1.5 max-w-xs">{description}</p>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

// ─── Perfil ──────────────────────────────────────────────────────────────────

function PerfilSection() {
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
    <Section title="Perfil" description="Seu nome e email de acesso">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className={labelClass}>Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className={labelClass}>Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div>
          <Button type="submit" disabled={saving} className={primaryBtnClass}>
            {saving ? "Salvando..." : "Salvar perfil"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

// ─── Senha ────────────────────────────────────────────────────────────────────

function SenhaSection() {
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
    <Section title="Senha" description="Mínimo 8 caracteres e pelo menos 1 número">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword" className={labelClass}>Senha atual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword" className={labelClass}>Nova senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm" className={labelClass}>Confirmar nova senha</Label>
          <Input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div>
          <Button type="submit" disabled={saving} className={primaryBtnClass}>
            {saving ? "Alterando..." : "Alterar senha"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

// ─── Empresa ─────────────────────────────────────────────────────────────────

function EmpresaSection({ workspace, onSave }: {
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
        <Label htmlFor={id} className={labelClass}>{label}</Label>
        <Input
          id={id}
          type={opts?.type ?? "text"}
          placeholder={opts?.placeholder}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <Section title="Empresa" description="Aparecem no cabeçalho e rodapé dos PDFs gerados">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {field("name", "Nome da empresa *")}
        {field("razaoSocial", "Razão social", { placeholder: "Nome jurídico da empresa" })}
        {field("cnpj", "CNPJ", { placeholder: "00.000.000/0000-00" })}
        {field("telefone", "Telefone", { placeholder: "(00) 00000-0000" })}
        {field("emailContato", "Email de contato", { type: "email" })}
        {field("endereco", "Endereço")}
        <div>
          <Button type="submit" disabled={saving} className={primaryBtnClass}>
            {saving ? "Salvando..." : "Salvar empresa"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

// ─── Logo ────────────────────────────────────────────────────────────────────

function LogoSection({ logoUrl }: { logoUrl: string | null }) {
  return (
    <Section
      title="Logo"
      description="Usada automaticamente no cabeçalho dos PDFs. Disponível em breve, após configurar armazenamento."
    >
      <div className="flex flex-col gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo da empresa"
            className="h-16 object-contain rounded-xl border border-[#EEF2F9] p-2 bg-[#F7FAFF]"
          />
        ) : (
          <p className="text-[13.5px] text-[#9AA7BD]">Nenhuma logo configurada.</p>
        )}
        <div>
          <Button
            disabled
            title="Disponível após configurar Cloudflare R2 ou AWS S3"
            variant="outline"
            className="rounded-full border-[#E1E8F5] text-[#334155]"
          >
            Fazer upload
          </Button>
        </div>
      </div>
    </Section>
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
    <div className="flex flex-col">
      <div>
        <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Configurações
        </h1>
        <p className="text-[#6B7891] text-[13.5px] mt-0.5">
          Gerencie sua conta, empresa e preferências de PDF
        </p>
      </div>
      <PerfilSection />
      <SenhaSection />
      <EmpresaSection workspace={workspace} onSave={setWorkspace} />
      <LogoSection logoUrl={workspace?.logoUrl ?? null} />
    </div>
  );
}
