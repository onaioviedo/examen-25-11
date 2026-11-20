// Datos iniciales del examen (Bloque 1) y de los casos prácticos de EDA.

export interface Alumno {
  id: number;
  nombre: string;
  horas_estudio: number;
  puntos_prueba: number;
  ejercicios_entregados: number;
  minutos_plataforma: number;
}

export const ALUMNOS: Alumno[] = [
  { id: 1, nombre: 'Alba', horas_estudio: 4, puntos_prueba: 58, ejercicios_entregados: 5, minutos_plataforma: 42 },
  { id: 2, nombre: 'Marcos', horas_estudio: 2, puntos_prueba: 48, ejercicios_entregados: 3, minutos_plataforma: 32 },
  { id: 3, nombre: 'Nerea', horas_estudio: 6, puntos_prueba: 78, ejercicios_entregados: 8, minutos_plataforma: 62 },
  { id: 4, nombre: 'Pablo', horas_estudio: 5, puntos_prueba: 68, ejercicios_entregados: 6, minutos_plataforma: 48 },
  { id: 5, nombre: 'Sara', horas_estudio: 8, puntos_prueba: 88, ejercicios_entregados: 9, minutos_plataforma: 72 },
  { id: 6, nombre: 'Óscar', horas_estudio: 3, puntos_prueba: 58, ejercicios_entregados: 4, minutos_plataforma: 38 },
  { id: 7, nombre: 'Valeria', horas_estudio: 7, puntos_prueba: 78, ejercicios_entregados: 9, minutos_plataforma: 68 },
  { id: 8, nombre: 'Mateo', horas_estudio: 5, puntos_prueba: 68, ejercicios_entregados: 6, minutos_plataforma: 52 },
  { id: 9, nombre: 'Claudia', horas_estudio: 9, puntos_prueba: 98, ejercicios_entregados: 10, minutos_plataforma: 88 },
  { id: 10, nombre: 'Raúl', horas_estudio: 6, puntos_prueba: 78, ejercicios_entregados: 8, minutos_plataforma: 58 },
];

/** Código Python de los datos iniciales, tal y como aparece en el examen */
export const CODIGO_ALUMNOS = `alumnos = [
    {"id": 1, "nombre": "Alba", "horas_estudio": 4, "puntos_prueba": 58, "ejercicios_entregados": 5, "minutos_plataforma": 42},
    {"id": 2, "nombre": "Marcos", "horas_estudio": 2, "puntos_prueba": 48, "ejercicios_entregados": 3, "minutos_plataforma": 32},
    {"id": 3, "nombre": "Nerea", "horas_estudio": 6, "puntos_prueba": 78, "ejercicios_entregados": 8, "minutos_plataforma": 62},
    {"id": 4, "nombre": "Pablo", "horas_estudio": 5, "puntos_prueba": 68, "ejercicios_entregados": 6, "minutos_plataforma": 48},
    {"id": 5, "nombre": "Sara", "horas_estudio": 8, "puntos_prueba": 88, "ejercicios_entregados": 9, "minutos_plataforma": 72},
    {"id": 6, "nombre": "Óscar", "horas_estudio": 3, "puntos_prueba": 58, "ejercicios_entregados": 4, "minutos_plataforma": 38},
    {"id": 7, "nombre": "Valeria", "horas_estudio": 7, "puntos_prueba": 78, "ejercicios_entregados": 9, "minutos_plataforma": 68},
    {"id": 8, "nombre": "Mateo", "horas_estudio": 5, "puntos_prueba": 68, "ejercicios_entregados": 6, "minutos_plataforma": 52},
    {"id": 9, "nombre": "Claudia", "horas_estudio": 9, "puntos_prueba": 98, "ejercicios_entregados": 10, "minutos_plataforma": 88},
    {"id": 10, "nombre": "Raúl", "horas_estudio": 6, "puntos_prueba": 78, "ejercicios_entregados": 8, "minutos_plataforma": 58},
]`;

/** Lista del visualizador de Bubble Sort (horas_estudio en el orden original) */
export const HORAS_BUBBLE = [4, 2, 6, 5, 8, 3, 7, 5, 9, 6];

export interface ConjuntoDatos {
  id: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  valores: number[];
  /** Etiqueta de cada valor (nombre del alumno, visita…) */
  etiquetas?: string[];
  /** Qué se pide en el examen con estos datos */
  foco: string;
}

export const CONJUNTOS: ConjuntoDatos[] = [
  {
    id: 'minutos',
    nombre: 'Minutos en la plataforma',
    descripcion: 'minutos_plataforma de los 10 alumnos (Ejercicio 3: media).',
    unidad: 'min',
    valores: ALUMNOS.map((a) => a.minutos_plataforma),
    etiquetas: ALUMNOS.map((a) => a.nombre),
    foco: 'Media con acumulador → 560 / 10 = 56.0',
  },
  {
    id: 'horas',
    nombre: 'Horas de estudio',
    descripcion: 'horas_estudio de los 10 alumnos (Ejercicio 4: mediana).',
    unidad: 'h',
    valores: ALUMNOS.map((a) => a.horas_estudio),
    etiquetas: ALUMNOS.map((a) => a.nombre),
    foco: 'Mediana con n par → (5 + 6) / 2 = 5.5',
  },
  {
    id: 'puntos',
    nombre: 'Puntos de la prueba',
    descripcion: 'puntos_prueba de los 10 alumnos (Ejercicios 5 y 6: moda y desviación estándar).',
    unidad: 'puntos',
    valores: ALUMNOS.map((a) => a.puntos_prueba),
    etiquetas: ALUMNOS.map((a) => a.nombre),
    foco: 'Moda 78 (3 veces) · media 72 · varianza 204 · desviación ≈ 14,28',
  },
  {
    id: 'esperas',
    nombre: 'Esperas en la oficina (Caso 2)',
    descripcion: 'Ocho visitas de un lunes. La espera de 36 min está verificada.',
    unidad: 'min',
    valores: [4, 6, 6, 8, 10, 12, 14, 36],
    etiquetas: ['Visita 1', 'Visita 2', 'Visita 3', 'Visita 4', 'Visita 5', 'Visita 6', 'Visita 7', 'Visita 8'],
    foco: 'Media 12 · mediana 9 · moda 6 · Q1 6 · Q3 13 · IQR 7 · límite 23,5',
  },
  {
    id: 'lineaB',
    nombre: 'Duraciones válidas línea B (Caso 1)',
    descripcion: 'Duraciones conocidas de la línea B tras la revisión: V105, V104 (recuperada) y V107.',
    unidad: 'min',
    valores: [20, 23, 52],
    etiquetas: ['V105', 'V104', 'V107'],
    foco: 'Media ≈ 31,7 · mediana 23 · sin moda → imputar V103 con la mediana',
  },
];
