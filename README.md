# SiftlyAI - Frontend

Interfaz web de SiftlyAI, una plataforma que permite comparar respuestas de múltiples modelos de inteligencia artificial al mismo tiempo. Desarrollada con Angular 21.

## Descripción

SiftlyAI envía cada mensaje a varios modelos de IA en paralelo y muestra todas las respuestas lado a lado. Soporta generación de texto, imágenes, video y audio (TTS). Un juez automático basado en Gemini evalúa y marca la mejor respuesta de cada conversación.

### Modelos integrados

**Texto:** Llama 3 (Groq), Command (Cohere), Mistral Small, Gemini, Llama 3.3 70B (NVIDIA NIM), Nemotron 3 Super (NVIDIA NIM)

**Imagen:** Pollinations, Grok Image (xAI), Recraft

**Video:** Wan 2.6 (Alibaba), Veo 3.1 Lite (Google), Grok Video (xAI)

**Audio:** Orpheus TTS (Groq)

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Angular CLI 21

```bash
npm install -g @angular/cli
```

## Instalacion

Clonar el repositorio e instalar dependencias:

```bash
git clone <url-del-repositorio>
cd frontend
npm install
```

## Configuracion

La URL base del backend esta definida como constante en el archivo:

```
src/app/components/chat/chat.component.ts
```

```ts
const API = 'https://gpcueb.org/siftlyai';
```

Si levantás el backend localmente, cambiá esa línea por:

```ts
const API = 'http://localhost:8080';
```

El mismo ajuste aplica para los servicios en `src/app/services/` si alguno referencia la URL directamente.

## Correr en desarrollo

```bash
ng serve
```

La aplicación queda disponible en `http://localhost:4200`. Se recarga automáticamente al guardar cambios.

## Build para producción

```bash
ng build
```

Los archivos compilados quedan en la carpeta `dist/`. Pueden servirse con cualquier servidor web estático (Nginx, Apache, etc.).

## Estructura del proyecto

```
src/
  app/
    components/
      auth/           # Login, registro, verificacion de codigo, OAuth2 callback
      chat/           # Componente principal del chat y reproductor de audio
      admin/          # Panel de administracion
      conversaciones/ # Listado de conversaciones
      shared/         # Navbar, loading, toggle de tema
    guards/           # Proteccion de rutas (auth, admin)
    interceptors/     # Interceptor HTTP para agregar el token JWT
    models/           # Interfaces TypeScript (Mensaje, Conversacion, Usuario, RespuestaIA)
    services/         # Servicios de autenticacion, conversaciones y mensajes
```

## Rutas principales

| Ruta | Descripcion | Protegida |
|---|---|---|
| `/login` | Inicio de sesion | No |
| `/registro` | Crear cuenta | No |
| `/verificar` | Verificacion de correo | No |
| `/chat` | Chat principal | Si |
| `/chat/:id` | Conversacion especifica | Si |
| `/admin` | Panel de administracion | Si (solo admin) |

## Autenticacion

El frontend maneja autenticacion por JWT y OAuth2 (Google). El token se almacena en `localStorage` y se adjunta automaticamente a cada peticion HTTP mediante el interceptor `auth.interceptor.ts`.

## Tecnologias utilizadas

- Angular 21
- TypeScript 5.9
- Bootstrap 5
- marked (renderizado de Markdown)
- RxJS 7
- ngx-toastr

## Backend

Este frontend consume la API REST del backend desarrollado en Spring Boot. El repositorio del backend se encuentra en: `https://github.com/murilllin/SiftlyAIBackend`
