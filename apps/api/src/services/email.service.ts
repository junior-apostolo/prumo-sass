import type { IEmailService } from "../interfaces/auth.interfaces.js";

type MinLogger = { info: (msg: string) => void };

export class ConsoleEmailService implements IEmailService {
  constructor(private readonly logger: MinLogger) {}

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    // Workaround B-002: substituir por ResendEmailService quando o email estiver configurado
    this.logger.info(`[EMAIL] Reset de senha para ${to} → ${resetUrl}`);
  }
}
