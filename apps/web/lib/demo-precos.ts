import type { TipoOficio } from "@enge-pro/shared";

export interface ItemPadrao {
  id: string;
  descricao: string;
  unidade: string;
  precoDefault: number;
  quantidadeDefault: number;
  checkedDefault: boolean;
}

export const PRECOS_PADRAO: Record<TipoOficio, ItemPadrao[]> = {
  PINTURA: [
    {
      id: "p1",
      descricao: "Pintura de paredes internas (2 demãos)",
      unidade: "m²",
      precoDefault: 22,
      quantidadeDefault: 50,
      checkedDefault: true,
    },
    {
      id: "p2",
      descricao: "Pintura de teto (2 demãos)",
      unidade: "m²",
      precoDefault: 28,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "p3",
      descricao: "Massa corrida PVA (lixamento + emassamento)",
      unidade: "m²",
      precoDefault: 15,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "p4",
      descricao: "Pintura de porta (2 faces)",
      unidade: "un",
      precoDefault: 80,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "p5",
      descricao: "Pintura de janela",
      unidade: "un",
      precoDefault: 60,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "p6",
      descricao: "Pintura de fachada / área externa",
      unidade: "m²",
      precoDefault: 35,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
  ],

  ELETRICA: [
    {
      id: "e1",
      descricao: "Ponto de tomada simples (2P+T)",
      unidade: "ponto",
      precoDefault: 85,
      quantidadeDefault: 5,
      checkedDefault: true,
    },
    {
      id: "e2",
      descricao: "Ponto de iluminação (teto)",
      unidade: "ponto",
      precoDefault: 95,
      quantidadeDefault: 3,
      checkedDefault: true,
    },
    {
      id: "e3",
      descricao: "Ponto de interruptor simples",
      unidade: "ponto",
      precoDefault: 75,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "e4",
      descricao: "Ponto de chuveiro (circuito dedicado 40A)",
      unidade: "ponto",
      precoDefault: 180,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "e5",
      descricao: "Ponto de ar-condicionado (circuito dedicado)",
      unidade: "ponto",
      precoDefault: 160,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "e6",
      descricao: "Montagem / ampliação de quadro de distribuição",
      unidade: "verba",
      precoDefault: 350,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "e7",
      descricao: "Passagem de eletroduto embutido",
      unidade: "ml",
      precoDefault: 28,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
  ],

  REVESTIMENTO: [
    {
      id: "r1",
      descricao: "Assentamento de piso (cerâmico / porcelanato)",
      unidade: "m²",
      precoDefault: 65,
      quantidadeDefault: 20,
      checkedDefault: true,
    },
    {
      id: "r2",
      descricao: "Assentamento de azulejo (parede)",
      unidade: "m²",
      precoDefault: 70,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "r3",
      descricao: "Rejuntamento",
      unidade: "m²",
      precoDefault: 15,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "r4",
      descricao: "Nivelamento / regularização de contrapiso",
      unidade: "m²",
      precoDefault: 35,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "r5",
      descricao: "Rodapé cerâmico",
      unidade: "ml",
      precoDefault: 20,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "r6",
      descricao: "Impermeabilização (box / área molhada)",
      unidade: "m²",
      precoDefault: 55,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "r7",
      descricao: "Demolição de revestimento existente",
      unidade: "m²",
      precoDefault: 25,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
  ],

  HIDRAULICA: [
    {
      id: "h1",
      descricao: "Ponto de água (instalação de ramal)",
      unidade: "ponto",
      precoDefault: 130,
      quantidadeDefault: 2,
      checkedDefault: true,
    },
    {
      id: "h2",
      descricao: "Ponto de esgoto",
      unidade: "ponto",
      precoDefault: 140,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "h3",
      descricao: "Instalação de vaso sanitário",
      unidade: "un",
      precoDefault: 180,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "h4",
      descricao: "Instalação de pia / cuba",
      unidade: "un",
      precoDefault: 150,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "h5",
      descricao: "Instalação de torneira / registro / válvula",
      unidade: "un",
      precoDefault: 80,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "h6",
      descricao: "Passagem de tubulação (PVC / CPVC)",
      unidade: "ml",
      precoDefault: 45,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
    {
      id: "h7",
      descricao: "Instalação de caixa d'água",
      unidade: "verba",
      precoDefault: 250,
      quantidadeDefault: 0,
      checkedDefault: false,
    },
  ],

  OUTRO: [
    {
      id: "o1",
      descricao: "Serviço 1",
      unidade: "verba",
      precoDefault: 0,
      quantidadeDefault: 1,
      checkedDefault: true,
    },
    {
      id: "o2",
      descricao: "Serviço 2",
      unidade: "verba",
      precoDefault: 0,
      quantidadeDefault: 1,
      checkedDefault: false,
    },
  ],
};

export const OFICIO_LABELS: Record<TipoOficio, string> = {
  PINTURA: "Pintor",
  ELETRICA: "Eletricista",
  REVESTIMENTO: "Piso / Revestimento",
  HIDRAULICA: "Hidráulica",
  OUTRO: "Outro serviço",
};
