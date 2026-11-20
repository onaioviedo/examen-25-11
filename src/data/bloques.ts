import type { BloqueId } from './tipos';

export interface InfoBloque {
  id: BloqueId;
  nombre: string;
  corto: string;
  descripcion: string;
  /** Clases Tailwind (escritas completas para que Tailwind las detecte) */
  chip: string;
  barra: string;
  borde: string;
  texto: string;
}

export const BLOQUES: InfoBloque[] = [
  {
    id: 'python',
    nombre: 'Python básico',
    corto: 'Python',
    descripcion: 'Listas de diccionarios, bucles, Bubble Sort, media, mediana, moda y desviación estándar sin librerías.',
    chip: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    barra: 'bg-sky-500',
    borde: 'border-sky-300 dark:border-sky-500/40',
    texto: 'text-sky-700 dark:text-sky-300',
  },
  {
    id: 'eda',
    nombre: 'EDA',
    corto: 'EDA',
    descripcion: 'Conceptos de análisis exploratorio, limpieza de datos, imputación, cuartiles, outliers y gráficos.',
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    barra: 'bg-emerald-500',
    borde: 'border-emerald-300 dark:border-emerald-500/40',
    texto: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'poo',
    nombre: 'POO',
    corto: 'POO',
    descripcion: 'Clases, instancias, __init__, self, herencia, super(), sobrescritura, polimorfismo y excepciones.',
    chip: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    barra: 'bg-violet-500',
    borde: 'border-violet-300 dark:border-violet-500/40',
    texto: 'text-violet-700 dark:text-violet-300',
  },
  {
    id: 'regex',
    nombre: 'Regex',
    corto: 'Regex',
    descripcion: 'Módulo re: metacaracteres, clases, cuantificadores, grupos, search/match/fullmatch, findall, sub y split.',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    barra: 'bg-amber-500',
    borde: 'border-amber-300 dark:border-amber-500/40',
    texto: 'text-amber-700 dark:text-amber-300',
  },
];

export function infoBloque(id: BloqueId): InfoBloque {
  return BLOQUES.find((b) => b.id === id) ?? BLOQUES[0];
}
