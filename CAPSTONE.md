# EcoTrack AI · Capstone

## 1. Problema

Los pequeños negocios sí generan información útil sobre consumo, entregas y residuos, pero normalmente no tienen tiempo ni conocimiento ambiental para convertirla en una medición. Los formularios extensos hacen que la primera medición nunca ocurra.

## 2. Solución propuesta

EcoTrack AI recibe una descripción en lenguaje cotidiano, identifica datos medibles y presenta una estimación de CO₂ equivalente acompañada de recomendaciones sencillas. Es un MVP educativo: ayuda a orientar decisiones, no reemplaza una certificación ni un inventario formal.

## 3. Personalidad y vibe

La interfaz es amable, serena y clara. Se pensó como un “cuaderno de impacto” para negocios reales: verde bosque y menta para comunicar sostenibilidad, marfil para reducir la sensación técnica y espacios generosos para mantener el análisis fácil de leer. El tono evita el lenguaje especializado y propone acciones concretas.

## 4. Master Prompt utilizado

> Construye EcoTrack AI, una experiencia SaaS mobile-first para pequeños negocios. Debe convertir descripciones de actividades en lenguaje natural en una estimación educativa de emisiones, explicar visualmente la fuente principal y sugerir acciones simples. Usa una identidad ecológica, moderna, confiable y no técnica. Mantén la extracción, el cálculo y la presentación desacoplados; si no hay credenciales, usa un simulador completamente funcional.

## 5. Arquitectura

```
Interfaz React
  → analyzer.ts (modo mock o cliente del endpoint)
  → /api/analyze en server/index.ts (IA y validación segura)
  → schema.ts (contrato JSON compartido)
  → calculator.ts → factors.ts (cálculo educativo configurable)
  → resultado + localStorage (presentación e historial)
```

Esta separación permite cambiar el proveedor de IA sin reescribir las pantallas ni la lógica de cálculo.

## 6. Tecnologías utilizadas

React, TypeScript, Vite, CSS moderno propio, lucide-react y localStorage. Se eligieron por rapidez de iteración, tipado y una entrega simple sin backend obligatorio para la demostración.

## 7. Flujo de usuario

1. En la landing, el usuario conoce la propuesta y abre el analizador.
2. Escribe sus actividades o selecciona un ejemplo.
3. EcoTrack muestra el estado de análisis y valida que encuentre datos medibles.
4. Ve el total estimado, el desglose, la fuente principal y las recomendaciones.
5. El resultado se conserva localmente y puede revisarse desde Historial.

## 8. Funcionamiento de la IA

El MVP tiene dos modos. `VITE_AI_MODE=mock` usa patrones locales para reconocer kWh, vehículos, km, litros de gasolina o diésel y residuos, sin red ni credenciales. `VITE_AI_MODE=real` envía el texto a `/api/analyze`; el endpoint `server/index.ts` usa `OPENAI_API_KEY` solo en el servidor, solicita JSON con un esquema estricto y valida cada campo antes de devolverlo. El contrato contiene electricidad, vehículos, distancia, gasolina, diésel, residuos, actividades adicionales y confianza. Si el proveedor falla, el cliente no se rompe: usa el análisis local y comunica que entregó una estimación de respaldo.

## 9. Factores de emisión utilizados

Valores simplificados, centralizados en `src/lib/factors.ts`:

| Fuente | Factor |
| --- | ---: |
| Electricidad | 0.42 kg CO₂e / kWh |
| Diésel | 2.68 kg CO₂e / litro |
| Gasolina | 2.31 kg CO₂e / litro |
| Distancia vehicular sin litros | 0.25 kg CO₂e / km |
| Residuos | 0.45 kg CO₂e / kg |

Los cálculos devuelven total, desglose, porcentajes y fuente principal. Cuando existen litros de combustible y kilómetros, se priorizan los litros y se ignora la estimación por distancia para evitar doble conteo. Son cifras de orientación didáctica; deben ajustarse al país, energía y metodología antes de usarse en un reporte real. La interfaz muestra explícitamente que no es una certificación oficial.

## 10. Proceso de desarrollo iterativo

Se inspeccionó el repositorio vacío, se definió una dirección de diseño antes de construir y se trabajó primero la arquitectura de datos. Después se implementaron las vistas y estados de interfaz, se añadió persistencia local y finalmente se validó con lint y build. El diseño se revisó para que el panel de conversación fuera el foco visual y no se convirtiera en una colección genérica de tarjetas.

## 11. Cambios solicitados mediante lenguaje natural

La especificación en lenguaje natural se tradujo directamente en decisiones implementables: “tipo chat” se resolvió con una entrada de texto conversacional; “fácil de entender” con una gráfica de barras y fuente principal; “no técnica” con recomendaciones en verbos simples; y “historial básico” con almacenamiento local sin autenticación.

## 12. Problema técnico encontrado

Una conexión directa desde el navegador a una API de IA requeriría exponer o transportar una credencial, lo cual es inseguro y dificulta la demostración sin configuración externa.

## 13. Cómo se resolvió utilizando IA

Se creó un adaptador local con el contrato de una respuesta de IA estructurada. Así el producto conserva una experiencia completa y demostrable, mientras que la integración real queda aislada en una sola función para una futura API del servidor. La asistencia de IA acelera la exploración de la interfaz, la generación de escenarios de prueba y la separación de responsabilidades.

## 14. Vibe Coding vs. desarrollo tradicional

Vibe Coding permitió pasar del propósito, tono y flujo descritos en lenguaje natural a una primera versión integrada con rapidez. El desarrollo tradicional sigue siendo esencial para definir contratos, validar cálculos, probar accesibilidad y proteger credenciales. En este proyecto, ambos enfoques se complementan: la IA acelera la iteración, mientras que la estructura tipada y la validación mantienen la calidad.

## 15. Conclusiones

EcoTrack AI demuestra que una primera aproximación al impacto ambiental puede ser cercana y útil. Al reducir la fricción de entrada, un negocio puede empezar a medir antes de optimizar. El siguiente paso sería incorporar factores regionales, autenticación, un backend de IA seguro y comparativas mensuales.
