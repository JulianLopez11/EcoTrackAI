# EcoTrack AI

EcoTrack AI es un MVP educativo para que pequeños negocios estimen su huella de carbono sin formularios complejos. El usuario describe su operación en lenguaje natural y recibe un desglose estimado, la fuente principal de impacto y recomendaciones accionables.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Para verificar la versión de producción:

```bash
npm run lint
npm run build
```

## Tecnologías

- React + TypeScript + Vite
- CSS responsivo propio y `lucide-react` para iconografía
- `localStorage` para conservar los últimos análisis del navegador

## Arquitectura

- `src/lib/analyzer.ts`: selecciona el modo local o el endpoint de IA y conserva un fallback seguro.
- `server/index.ts`: endpoint server-side que conserva las claves fuera del navegador y valida la respuesta estructurada del proveedor.
- `src/lib/schema.ts`: contrato y validación del JSON de extracción compartido.
- `src/lib/calculator.ts`: calcula el resultado educativo, porcentajes y fuente principal sin duplicar combustible y distancia.
- `src/lib/factors.ts`: factores de emisión simplificados, centralizados y fáciles de ajustar.
- `src/App.tsx`: vistas de landing, analizador, resultado, historial y explicación.

## IA real y modo simulado

El MVP funciona de inmediato con `VITE_AI_MODE=mock`, sin API ni backend. Reconoce localmente kWh, camionetas/vehículos, km, litros de gasolina o diésel y kg de residuos.

Para usar IA real, copia `.env.example` a `.env`, configura `VITE_AI_MODE=real`, `AI_MODE=real` y las credenciales server-side `OPENAI_API_KEY`, `OPENAI_MODEL` y opcionalmente `OPENAI_BASE_URL`. En otra terminal ejecuta:

```bash
npm run server
```

El navegador llama a `/api/analyze`, Vite lo redirige al servidor y el servidor valida el JSON antes de responder. La clave nunca se expone al cliente. Si el proveedor falla o devuelve un JSON inválido, la app usa el análisis local y presenta un mensaje amigable.

## Pruebas

```bash
npm run test
```

Las pruebas cubren extracción local, factores simplificados, porcentajes y la regla que evita sumar distancia cuando existen litros de combustible.

Las cifras son estimaciones educativas y no una certificación ambiental oficial.
