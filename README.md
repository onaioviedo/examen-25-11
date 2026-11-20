# Estudio Big Data — examen escrito

Web de estudio rápida y sin backend para preparar el examen escrito (a mano, sin calculadora) del módulo de Big Data / IA:
**Python básico**, **EDA**, **POO** y **Regex**.

Hecha con Vite + React + TypeScript + Tailwind CSS. Todo es estático y el progreso se guarda en `localStorage` del navegador.

## Qué incluye

| Sección | Para qué sirve |
| --- | --- |
| **Inicio** | % de dominio por bloque, «Repasar mis fallos», «Simulacro rápido», último simulacro y números clave del examen. |
| **Temario** | ≈70 fichas con definición corta, ejemplo y trampa típica. Buscador sin tildes y filtro por bloque. |
| **Flashcards** | 67 tarjetas. «Lo sé» / «Repasar»: las de repasar vuelven a salir a las 3 tarjetas (repetición espaciada simple). |
| **Test** | 91 preguntas (opción múltiple y verdadero/falso) con explicación y trampa. Filtro por bloque y modo «Mis fallos». |
| **Código** | 36 ejercicios: «¿Qué imprime?», «Completa el hueco» y «Ordena las líneas» (con modo sin sangría). |
| **Código › Bubble Sort** | Visualizador paso a paso de `[4, 2, 6, 5, 8, 3, 7, 5, 9, 6]`: i, j, comparación, intercambio con `auxiliar`, posiciones ordenadas y tabla de pasadas. |
| **Código › Estadística a mano** | Media, mediana (`n % 2`, `n // 2`), moda (diccionario), desviaciones, varianza (÷ n), desviación estándar, cuartiles, IQR y boxplot. Modo práctica. |
| **Código › Regex** | Probador de `search`, `match`, `fullmatch`, `findall`, `finditer`, `sub` y `split` (simulados con RegExp de JS, avisando de las diferencias con `re`) + chuleta. |
| **Simulacro** | Examen aleatorio (10/15/20 preguntas) mezclando bloques, ~20 % de «¿qué imprime?», temporizador opcional y nota sobre 10. |

Las salidas de los ejercicios «¿Qué imprime?» se han comprobado ejecutando el código en Python 3.

## Uso en local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente http://localhost:5173). Para probar la versión de producción:

```bash
npm run build      # genera la carpeta dist/
npm run preview
```

## Desplegar en Vercel

### Opción A — desde GitHub (recomendada)

1. Sube el proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New… › Project** → importa el repositorio.
3. Vercel detecta Vite automáticamente. Comprueba que queda así:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Pulsa **Deploy**. Cada `git push` vuelve a desplegar.

### Opción B — con la CLI

```bash
npm i -g vercel
vercel          # primera vez: responde a las preguntas (directorio actual, sin cambiar los ajustes)
vercel --prod   # despliegue de producción
```

El archivo `vercel.json` ya fija `npm run build` y la carpeta `dist`. Como la navegación usa el hash (`#/test`, `#/codigo/bubble`…),
no hace falta configurar reescrituras de rutas.

## Ampliar el contenido

Todo el material está en `src/data/` y no hace falta tocar componentes:

| Archivo | Contenido |
| --- | --- |
| `temario.ts` | Fichas (`titulo`, `definicion`, `ejemplo`, `codigo`, `tabla`, `trampa`, `tags`) |
| `flashcards.ts` | Tarjetas (`frente`, `reverso`, `codigo` opcional) |
| `preguntas.ts` | Test: `tipo: 'mc' \| 'vf'`, `opciones`, `correcta` (índice), `explicacion`, `trampa` |
| `ejercicios.ts` | Código: `salida` (código + salida exacta), `hueco` (`___` en el código + respuestas aceptadas), `ordenar` (líneas en orden correcto) |
| `alumnos.ts` | Datos del examen y conjuntos de la calculadora |
| `bloques.ts` | Nombre y colores de cada bloque |

Los tipos están en `src/data/tipos.ts`. Cada elemento necesita un `id` único: el progreso se guarda por `id`.

## Estructura

```
src/
  data/         contenido (temario, flashcards, preguntas, ejercicios, datos)
  lib/          progreso (localStorage), router por hash, estadística, Bubble Sort, simulador de re
  components/   UI, bloques de código, ejercicios, Bubble Sort, calculadora, Regex
  pages/        Inicio, Temario, Flashcards, Test, Código, Simulacro
```
