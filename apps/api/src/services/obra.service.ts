import type {
  IObraRepository,
  ObraComResumo,
  ObraRecord,
  ObraStatus,
  CreateObraData,
  UpdateObraData,
} from "../interfaces/obra.interfaces.js";

export class ObraNotFoundError extends Error {
  constructor() { super("Obra não encontrada"); }
}

export class ObraService {
  constructor(private readonly obraRepo: IObraRepository) {}

  async list(workspaceId: string): Promise<ObraComResumo[]> {
    return this.obraRepo.findAll(workspaceId);
  }

  async get(id: string, workspaceId: string): Promise<ObraComResumo> {
    const obra = await this.obraRepo.findById(id, workspaceId);
    if (!obra) throw new ObraNotFoundError();
    return obra;
  }

  async create(workspaceId: string, data: CreateObraData): Promise<ObraRecord> {
    return this.obraRepo.create(workspaceId, data);
  }

  async update(id: string, workspaceId: string, data: UpdateObraData): Promise<ObraRecord> {
    const obra = await this.obraRepo.update(id, workspaceId, data);
    if (!obra) throw new ObraNotFoundError();
    return obra;
  }

  async updateStatus(id: string, workspaceId: string, status: ObraStatus): Promise<ObraRecord> {
    const obra = await this.obraRepo.updateStatus(id, workspaceId, status);
    if (!obra) throw new ObraNotFoundError();
    return obra;
  }

  async archive(id: string, workspaceId: string): Promise<void> {
    const obra = await this.obraRepo.archive(id, workspaceId);
    if (!obra) throw new ObraNotFoundError();
  }
}
