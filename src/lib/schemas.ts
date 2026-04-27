import * as z from "zod";

const requiredText = (label: string) => z.string().trim().min(1, `${label} obrigatório`);
const requiredCoordinate = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? Number.NaN : value),
    z.coerce.number({ message: `${label} inválida` }),
  );

export const managedUserSchema = z.object({
  name: requiredText("Nome"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: requiredText("Nível de acesso"),
});

export const postFormSchema = z.object({
  name: requiredText("Nome do posto"),
  beach_id: requiredText("Praia"),
  latitude: requiredCoordinate("Latitude"),
  longitude: requiredCoordinate("Longitude"),
  radius: z.coerce.number().int().positive().default(500),
});

export const beachFormSchema = z.object({
  name: requiredText("Nome da praia"),
  city_id: requiredText("Cidade"),
  area: requiredText("Área"),
  is_active: z.boolean(),
});

export const zoneFormSchema = z.object({
  name: requiredText("Nome da zona"),
  beach_id: requiredText("Praia"),
  status_level: z.enum(["BAIXO", "MEDIO", "ALTO"]),
  coordinates: z.array(z.array(z.number())).min(4, "Desenhe a área no mapa"),
});
