export type IbgeCity = {
  id: number;
  nome: string;
};

export type BrazilianState = {
  uf: string;
  nome: string;
};

export const ESTADOS_BR: BrazilianState[] = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapa" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceara" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espirito Santo" },
  { uf: "GO", nome: "Goias" },
  { uf: "MA", nome: "Maranhao" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Para" },
  { uf: "PB", nome: "Paraiba" },
  { uf: "PR", nome: "Parana" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piaui" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondonia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "Sao Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

export async function fetchIbgeCitiesByState(uf: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
  );

  if (!response.ok) {
    throw new Error(`IBGE indisponivel para ${uf}`);
  }

  const data = (await response.json()) as IbgeCity[];
  return [...data].sort((a, b) => a.nome.localeCompare(b.nome));
}
