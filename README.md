# MikroRemote Desktop

Aplicación de escritorio para administrar routers MikroTik, generar configuraciones VPN WireGuard e instalar MikroTik CHR en servidores VPS.

Construido con **Tauri 2.0** + **React 19** + **TypeScript** + **Tailwind CSS v4** + **Rust**.

## Funcionalidades

### WireGuard VPN
- Asistente de 7 pasos para generar configuraciones completas
- Generación de llaves (Curve25519) en Rust nativo
- Scripts `.rsc` para RouterOS (servidor + peers)
- Configuraciones `.conf` para clientes
- Códigos QR para configuración móvil
- Exportar todo como `.zip`

### Conexión a Router MikroTik
- Conexión directa vía API de RouterOS (puerto 8728)
- Información del sistema: identidad, versión, CPU, memoria, uptime
- Listar y eliminar peers WireGuard
- Deploy de scripts directamente al router
- Guardar credenciales de routers en base de datos local

### CHR Deploy
- Instalar MikroTik Cloud Hosted Router en servidores VPS vía SSH
- Detección automática: arquitectura, modo boot, disco, red
- Soporte x86_64 (BIOS/UEFI) y aarch64
- Configuración automática de red (autorun.scr)
- Autenticación por contraseña o llave privada SSH
- Guardar servidores VPS para reutilización

### Almacenamiento
- Base de datos SQLite local
- Persistencia de perfiles WireGuard, routers y servidores VPS
- Importar/exportar perfiles como JSON

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | Tauri 2.0 |
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand |
| Formularios | React Hook Form + Zod |
| Backend | Rust (2021 edition) |
| API MikroTik | mikrotik-rs 0.5 |
| SSH | async-ssh2-tokio 0.8 |
| Base de datos | SQLite (rusqlite 0.31) |
| Criptografia | x25519-dalek 2 |
| Iconos | Lucide React |
| Notificaciones | Sonner |

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) >= 1.70
- [Tauri CLI](https://tauri.app/start/prerequisites/)

### Windows
```
winget install Microsoft.VisualStudio.2022.BuildTools
```
Seleccionar "Desarrollo de escritorio con C++".

## Instalacion

```bash
git clone https://github.com/fichaspot/MikroRemote.git
cd MikroRemote
npm install
```

## Desarrollo

```bash
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

El instalador se genera en `src-tauri/target/release/bundle/`.

## Estructura del Proyecto

```
MikroRemote/
├── src/                          # Frontend React
│   ├── features/
│   │   ├── dashboard/            # Pagina principal
│   │   ├── wireguard/            # Asistente WireGuard (7 pasos)
│   │   ├── routers/              # Conexion a routers MikroTik
│   │   ├── chr-deploy/           # Instalacion CHR en VPS
│   │   └── profiles/             # Gestion de perfiles
│   ├── components/
│   │   ├── ui/                   # Componentes base (shadcn-style)
│   │   └── layout/               # AppShell, navegacion
│   ├── stores/                   # Estado global (Zustand)
│   ├── lib/                      # Wrappers de comandos Tauri
│   └── types/                    # Tipos TypeScript
├── src-tauri/                    # Backend Rust
│   └── src/
│       ├── commands/             # Comandos Tauri
│       │   ├── crypto.rs         # Generacion de llaves WireGuard
│       │   ├── router.rs         # API MikroTik
│       │   ├── chr.rs            # SSH + deploy CHR
│       │   └── database.rs       # CRUD SQLite
│       ├── database/             # Capa de datos
│       ├── router/               # Conexion MikroTik
│       ├── ssh/                  # Tipos SSH
│       └── crypto/               # Criptografia WireGuard
└── package.json
```

## Licencia

Uso privado.
