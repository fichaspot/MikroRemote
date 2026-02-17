import { z } from "zod";

export const serverConfigSchema = z.object({
  address: z.string().min(1, "La dirección del servidor es requerida"),
  listenPort: z.coerce.number().min(1).max(65535, "El puerto debe ser entre 1 y 65535"),
  interfaceName: z
    .string()
    .min(1, "El nombre de interfaz es requerido")
    .regex(/^[a-zA-Z0-9_-]+$/, "Solo alfanuméricos, guion y guion bajo"),
});

export const networkConfigSchema = z.object({
  subnet: z
    .string()
    .min(1, "La subred es requerida")
    .regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Formato de IP inválido"),
  subnetMask: z.coerce.number().min(8).max(30, "La máscara debe ser entre 8 y 30"),
  clientStartIp: z
    .string()
    .min(1, "La IP inicial de clientes es requerida")
    .regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Formato de IP inválido"),
  clientCount: z.coerce.number().min(1, "Mínimo 1 cliente").max(253, "Máximo 253 clientes"),
  serverIp: z
    .string()
    .min(1, "La IP del servidor es requerida")
    .regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Formato de IP inválido"),
});

export const clientConfigSchema = z.object({
  name: z.string().min(1, "El nombre del cliente es requerido"),
  ip: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Formato de IP inválido"),
  dns: z.string().min(1, "El DNS es requerido"),
  allowedIps: z.string().min(1, "Las IPs permitidas son requeridas"),
  endpoint: z.string().min(1, "El endpoint es requerido"),
  keepalive: z.coerce.number().min(0).max(600),
});

export const serverKeysSchema = z.object({
  privateKey: z
    .string()
    .min(1, "La llave privada es requerida")
    .length(44, "La llave debe tener 44 caracteres (base64)"),
  publicKey: z.string().length(44, "La llave debe tener 44 caracteres (base64)"),
});
