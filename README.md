# Generador de Posts para Redes Sociales

Web app para freelances, consultores y emprendedores que necesitan publicar contenido de valor en LinkedIn, Instagram y X sin dedicar horas a escribir.

## Características

- Genera 2 variantes de post por cada petición, usando NVIDIA AI API (modelo gratuito `nvidia/llama-3.3-nemotron-super-49b-v1.5`).
- Selector de red social (LinkedIn / Instagram / X), tono (profesional / cercano / motivacional / controversial), y toggles de emojis/hashtags.
- Preview simulando la interfaz real de cada red social, con contador de caracteres y validación de rango recomendado.
- Texto editable directamente en la preview antes de copiar.
- Historial de los últimos 10 posts generados guardado en `localStorage` (ver, reutilizar y borrar).
- Sin backend ni base de datos: la llamada a la API se hace directamente desde el navegador.

## Configuración de la API Key (NVIDIA AI)

Necesitas una API Key gratuita de NVIDIA AI, obtenida en [build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys). El formato empieza por `nvapi-...`. Sin tarjeta de crédito.

Tienes dos formas de configurarla:

1. **Desde la propia app**: al abrirla por primera vez verás un campo para pegar tu API Key. Se guarda solo en el `localStorage` de tu navegador.
2. **Por variable de entorno** (opcional): copia `.env.example` a `.env` y añade tu clave:

   ```
   VITE_NVIDIA_API_KEY=nvapi-tu-api-key
   ```

   Reinicia `npm run dev` tras crear/modificar el `.env`.

> La app usa un proxy de Vite en desarrollo para evitar problemas CORS con la API de NVIDIA. Usa siempre `npm run dev` para que funcione.

## Desarrollo

```bash
npm run dev
```

El servidor se abre en http://localhost:5173. Para cambiar el puerto usa `--port`:

```bash
npm run dev -- --port 5177
```

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue en Vercel (recomendado)

1. Crea un repositorio en GitHub y sube el código.
2. Ve a [vercel.com](https://vercel.com) e importa el repositorio.
3. Vercel detecta automáticamente Vite y usa el `vercel.json` para redirigir las llamadas a la API de NVIDIA.
4. Añade la variable de entorno `VITE_NVIDIA_API_KEY` en la sección Environment Variables de Vercel con tu API key de NVIDIA.
5. Despliega.

> ⚠️ La API key se incluirá en el JavaScript del cliente, así que úsala solo para proyectos personales. No la compartas públicamente.
