export interface Campus {
  id: string;
  name: string;
  city: string;
  state: string;
  aliases: string[];
}

export const CAMPUSES: Campus[] = [
  {
    id: "sao-paulo",
    name: "UNIP São Paulo",
    city: "São Paulo",
    state: "SP",
    aliases: ["são paulo", "sao paulo", "sp", "capital", "indianópolis", "indianopolis"],
  },
  {
    id: "tatape",
    name: "UNIP Tatuapé",
    city: "São Paulo",
    state: "SP",
    aliases: ["tatuapé", "tatuape"],
  },
  {
    id: "marques",
    name: "UNIP Marquês",
    city: "São Paulo",
    state: "SP",
    aliases: ["marquês", "marques"],
  },
  {
    id: "alphaville",
    name: "UNIP Alphaville",
    city: "Barueri",
    state: "SP",
    aliases: ["alphaville", "barueri"],
  },
  {
    id: "sorocaba",
    name: "UNIP Sorocaba",
    city: "Sorocaba",
    state: "SP",
    aliases: ["sorocaba"],
  },
  {
    id: "campinas",
    name: "UNIP Campinas",
    city: "Campinas",
    state: "SP",
    aliases: ["campinas"],
  },
  {
    id: "santos",
    name: "UNIP Santos",
    city: "Santos",
    state: "SP",
    aliases: ["santos", "baixada", "baixada santista"],
  },
  {
    id: "sjc",
    name: "UNIP São José dos Campos",
    city: "São José dos Campos",
    state: "SP",
    aliases: ["são josé dos campos", "sao jose dos campos", "sjc", "são josé", "sao jose"],
  },
  {
    id: "ribeirao-preto",
    name: "UNIP Ribeirão Preto",
    city: "Ribeirão Preto",
    state: "SP",
    aliases: ["ribeirão preto", "ribeirao preto"],
  },
  {
    id: "brasilia",
    name: "UNIP Brasília",
    city: "Brasília",
    state: "DF",
    aliases: ["brasília", "brasilia", "df"],
  },
  {
    id: "goiania",
    name: "UNIP Goiânia",
    city: "Goiânia",
    state: "GO",
    aliases: ["goiânia", "goiania"],
  },
  {
    id: "manaus",
    name: "UNIP Manaus",
    city: "Manaus",
    state: "AM",
    aliases: ["manaus", "amazonas"],
  },
];

export const DEFAULT_CAMPUS_ID = "sao-paulo";

export function getCampusById(id: string): Campus | undefined {
  return CAMPUSES.find((campus) => campus.id === id);
}

export function findCampusInText(text: string): Campus | undefined {
  const normalized = normalizeText(text);

  const ranked = CAMPUSES.map((campus) => {
    const haystacks = [campus.name, campus.city, ...campus.aliases].map(normalizeText);
    const hit = haystacks.some((item) => item.length > 0 && normalized.includes(item));
    const specificity = Math.max(...haystacks.map((item) => (normalized.includes(item) ? item.length : 0)));
    return { campus, hit, specificity };
  })
    .filter((item) => item.hit)
    .sort((a, b) => b.specificity - a.specificity);

  return ranked[0]?.campus;
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
