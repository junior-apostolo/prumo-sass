# Feature Spec — M5 Configurações

**ID:** M5
**Status:** PLANNED
**Tasks:** tasks.md Fase 5 (T-096 a T-107)
**Depends on:** M1 (Auth)

---

## Requisitos

| ID    | Requisito |
|-------|-----------|
| RF-28 | Atualizar nome, email e senha do usuário |
| RF-29 | Configurar dados do workspace: nome da empresa, CNPJ, telefone, email de contato, endereço |
| RF-30 | Upload de logo da empresa (PNG/JPG, máx. 2 MB) — usada no PDF dos orçamentos |
| RNF-08 | Uploads validados por tipo MIME e tamanho no servidor (não confiar no cliente) |

## Comportamentos

**Perfil pessoal (RF-28):**
- Atualizar nome e email (validar unicidade do email)
- Trocar senha: exige senha atual antes de aceitar nova
- Validação mínima de nova senha: 8 chars, 1 número

**Dados da empresa (RF-29):**
- Campos: nome da empresa, CNPJ (com máscara), telefone, email de contato, endereço
- Esses dados aparecem no cabeçalho e rodapé do PDF gerado no M3

**Upload de logo (RF-30):**
- Aceitar: image/png, image/jpeg
- Tamanho máximo: 2 MB — validado no servidor com multer (RNF-08)
- Validação no cliente: dimensões mínimas 200×200px (preview antes de enviar)
- Upload para Cloudflare R2 ou AWS S3 → salvar URL no `Workspace.logoUrl`
- Logo usada automaticamente no PDF se `logoUrl` estiver preenchido

## Armazenamento de arquivos

- Cliente de storage: `@aws-sdk/client-s3` (compatível com R2 e S3)
- `src/lib/storage.ts`: função `uploadFile(key, buffer, mimeType)` → URL pública
- Credenciais via variáveis de ambiente: `STORAGE_ENDPOINT`, `STORAGE_KEY`, `STORAGE_SECRET`, `STORAGE_BUCKET`

## Endpoints

```
GET    /settings/workspace          → dados atuais do workspace
PUT    /settings/workspace          → atualizar dados da empresa
POST   /settings/workspace/logo     → upload logo (multipart/form-data, máx 2MB)
PUT    /settings/profile            → atualizar nome e email
PUT    /settings/password           → trocar senha (exige senha atual)
```

## Critério de pronto

Atualizar nome → trocar senha → fazer login com nova senha → fazer upload de logo → gerar PDF de um orçamento e verificar que a logo aparece no cabeçalho do PDF.
