// Genera todos los pasos del Bubble Sort del examen para el visualizador.

export const CODIGO_BUBBLE = `n = len(horas)
for i in range(n - 1):
    for j in range(n - 1 - i):
        if horas[j] > horas[j + 1]:
            auxiliar = horas[j]
            horas[j] = horas[j + 1]
            horas[j + 1] = auxiliar`;

export type TipoPaso = 'inicio' | 'pasada' | 'comparar' | 'aux' | 'asig1' | 'asig2' | 'finPasada' | 'fin';

export interface PasoBubble {
  tipo: TipoPaso;
  i: number | null;
  j: number | null;
  /** Estado de la lista DESPUÉS de este paso */
  lista: number[];
  auxiliar: number | null;
  /** Posiciones >= ordenadasDesde ya están en su sitio definitivo */
  ordenadasDesde: number;
  /** Línea del código que se está ejecutando (0-based) */
  linea: number;
  mensaje: string;
  comparacion: { a: number; b: number; resultado: boolean } | null;
  /** Posiciones que cambian en este paso */
  cambiadas: number[];
  comparaciones: number;
  intercambios: number;
}

export interface PasadaInfo {
  pasada: number;
  i: number;
  rango: number;
  jMax: number;
  intercambios: number;
  /** Índice del primer paso de esta pasada */
  pasoInicio: number;
  pasoFin: number;
}

export function generarPasos(inicial: number[]): { pasos: PasoBubble[]; pasadas: PasadaInfo[] } {
  const horas = [...inicial];
  const n = horas.length;
  const pasos: PasoBubble[] = [];
  const pasadas: PasadaInfo[] = [];
  let comparaciones = 0;
  let intercambios = 0;
  let auxiliar: number | null = null;
  let ordenadasDesde = n;

  const push = (p: Omit<PasoBubble, 'lista' | 'auxiliar' | 'ordenadasDesde' | 'comparaciones' | 'intercambios'>) =>
    pasos.push({ ...p, lista: [...horas], auxiliar, ordenadasDesde, comparaciones, intercambios });

  push({
    tipo: 'inicio',
    i: null,
    j: null,
    linea: 0,
    mensaje: `n = len(horas) = ${n}. n no cambia durante todo el algoritmo. Habrá n - 1 = ${n - 1} pasadas (i de 0 a ${n - 2}).`,
    comparacion: null,
    cambiadas: [],
  });

  for (let i = 0; i < n - 1; i++) {
    const rango = n - 1 - i;
    const pasoInicio = pasos.length;
    let intercambiosPasada = 0;
    push({
      tipo: 'pasada',
      i,
      j: null,
      linea: 1,
      mensaje: `Pasada ${i + 1}: i = ${i}. range(n - 1 - i) = range(${n} - 1 - ${i}) = range(${rango}), así que j toma los valores 0 a ${rango - 1}.`,
      comparacion: null,
      cambiadas: [],
    });

    for (let j = 0; j < rango; j++) {
      const a = horas[j];
      const b = horas[j + 1];
      const resultado = a > b;
      comparaciones++;
      push({
        tipo: 'comparar',
        i,
        j,
        linea: 3,
        mensaje: `j = ${j}: ¿horas[${j}] > horas[${j + 1}]? → ${a} > ${b} → ${resultado ? 'True: hay que intercambiar' : 'False: no se toca nada'}.`,
        comparacion: { a, b, resultado },
        cambiadas: [],
      });
      if (resultado) {
        auxiliar = a;
        push({
          tipo: 'aux',
          i,
          j,
          linea: 4,
          mensaje: `auxiliar = horas[${j}] → auxiliar = ${a}. Guardamos el ${a} para no perderlo.`,
          comparacion: { a, b, resultado },
          cambiadas: [],
        });
        horas[j] = b;
        push({
          tipo: 'asig1',
          i,
          j,
          linea: 5,
          mensaje: `horas[${j}] = horas[${j + 1}] → horas[${j}] = ${b}. Ahora el ${b} aparece dos veces; el ${a} está a salvo en auxiliar.`,
          comparacion: { a, b, resultado },
          cambiadas: [j],
        });
        horas[j + 1] = auxiliar;
        intercambios++;
        intercambiosPasada++;
        push({
          tipo: 'asig2',
          i,
          j,
          linea: 6,
          mensaje: `horas[${j + 1}] = auxiliar → horas[${j + 1}] = ${a}. Intercambio completado.`,
          comparacion: { a, b, resultado },
          cambiadas: [j + 1],
        });
        auxiliar = null;
      }
    }

    ordenadasDesde = n - 1 - i;
    if (i === n - 2) ordenadasDesde = 0;
    push({
      tipo: 'finPasada',
      i,
      j: null,
      linea: 1,
      mensaje:
        `Fin de la pasada ${i + 1}: el ${horas[n - 1 - i]} queda fijo en la posición ${n - 1 - i}` +
        (intercambiosPasada === 0 ? ' (en esta pasada no hubo intercambios).' : ` (${intercambiosPasada} intercambio${intercambiosPasada > 1 ? 's' : ''}).`),
      comparacion: null,
      cambiadas: [],
    });
    pasadas.push({
      pasada: i + 1,
      i,
      rango,
      jMax: rango - 1,
      intercambios: intercambiosPasada,
      pasoInicio,
      pasoFin: pasos.length - 1,
    });
  }

  ordenadasDesde = 0;
  push({
    tipo: 'fin',
    i: null,
    j: null,
    linea: -1,
    mensaje: `Lista ordenada: [${horas.join(', ')}]. ${comparaciones} comparaciones y ${intercambios} intercambios.`,
    comparacion: null,
    cambiadas: [],
  });

  return { pasos, pasadas };
}
