// Cálculos «a mano» que replican el código Python del examen paso a paso.

export function suma(v: number[]): number {
  let s = 0;
  for (const x of v) s += x;
  return s;
}

/** Acumulador paso a paso: [{valor, suma}] */
export function acumulado(v: number[]): { valor: number; suma: number }[] {
  let s = 0;
  return v.map((valor) => {
    s += valor;
    return { valor, suma: s };
  });
}

export function ordenar(v: number[]): number[] {
  return [...v].sort((a, b) => a - b);
}

export interface InfoMediana {
  n: number;
  resto: number;
  mitad: number;
  par: boolean;
  indices: number[];
  valores: number[];
  valor: number;
}

export function mediana(ordenados: number[]): InfoMediana {
  const n = ordenados.length;
  const mitad = Math.floor(n / 2);
  const par = n % 2 === 0;
  const indices = par ? [mitad - 1, mitad] : [mitad];
  const valores = indices.map((i) => ordenados[i]);
  const valor = par ? (valores[0] + valores[1]) / 2 : valores[0];
  return { n, resto: n % 2, mitad, par, indices, valores, valor };
}

export interface InfoModa {
  /** Diccionario de frecuencias en orden de inserción (como en Python) */
  frecuencias: [number, number][];
  maxFrecuencia: number;
  modas: number[];
  sinModa: boolean;
}

export function moda(v: number[]): InfoModa {
  const m = new Map<number, number>();
  for (const x of v) m.set(x, (m.get(x) ?? 0) + 1);
  const frecuencias = [...m.entries()];
  const maxFrecuencia = Math.max(...m.values());
  const modas = frecuencias.filter(([, c]) => c === maxFrecuencia).map(([k]) => k);
  return { frecuencias, maxFrecuencia, modas, sinModa: maxFrecuencia === 1 };
}

export function dictPython(frec: [number, number][]): string {
  return '{' + frec.map(([k, c]) => `${k}: ${c}`).join(', ') + '}';
}

export interface InfoDispersion {
  media: number;
  filas: { valor: number; desviacion: number; cuadrado: number }[];
  sumaCuadrados: number;
  varianza: number;
  varianzaMuestral: number;
  desviacion: number;
  /** Cuadrados perfectos entre los que cae la varianza (para estimar la raíz sin calculadora) */
  raizEntre: [number, number];
}

export function dispersion(v: number[]): InfoDispersion {
  const n = v.length;
  const media = suma(v) / n;
  const filas = v.map((valor) => {
    const desviacion = valor - media;
    return { valor, desviacion, cuadrado: desviacion ** 2 };
  });
  const sumaCuadrados = suma(filas.map((f) => f.cuadrado));
  const varianza = sumaCuadrados / n;
  const desviacion = varianza ** 0.5;
  const abajo = Math.floor(desviacion);
  return {
    media,
    filas,
    sumaCuadrados,
    varianza,
    varianzaMuestral: n > 1 ? sumaCuadrados / (n - 1) : NaN,
    desviacion,
    raizEntre: [abajo, abajo + 1],
  };
}

export interface InfoCuartiles {
  inferior: number[];
  superior: number[];
  q1: number;
  q3: number;
  iqr: number;
  limiteInf: number;
  limiteSup: number;
  atipicos: number[];
  bigoteInf: number;
  bigoteSup: number;
}

/** Cuartiles por el método de las mitades (el que usa el Caso 2 del examen) */
export function cuartiles(ordenados: number[]): InfoCuartiles | null {
  const n = ordenados.length;
  if (n < 4) return null;
  const mitad = Math.floor(n / 2);
  const inferior = ordenados.slice(0, mitad);
  const superior = n % 2 === 0 ? ordenados.slice(mitad) : ordenados.slice(mitad + 1);
  const q1 = mediana(inferior).valor;
  const q3 = mediana(superior).valor;
  const iqr = q3 - q1;
  const limiteInf = q1 - 1.5 * iqr;
  const limiteSup = q3 + 1.5 * iqr;
  const dentro = ordenados.filter((x) => x >= limiteInf && x <= limiteSup);
  return {
    inferior,
    superior,
    q1,
    q3,
    iqr,
    limiteInf,
    limiteSup,
    atipicos: ordenados.filter((x) => x < limiteInf || x > limiteSup),
    bigoteInf: Math.min(...dentro),
    bigoteSup: Math.max(...dentro),
  };
}
