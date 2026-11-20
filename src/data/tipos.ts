// Tipos compartidos por todos los archivos de datos.
// Para ampliar el contenido basta con añadir objetos a los arrays de src/data/*.ts.

export type BloqueId = 'python' | 'eda' | 'poo' | 'regex';

export interface Tabla {
  cabecera: string[];
  filas: string[][];
}

/** Ficha del temario */
export interface Concepto {
  id: string;
  bloque: BloqueId;
  titulo: string;
  definicion: string;
  /** Ejemplo en texto (se muestra como párrafo) */
  ejemplo?: string;
  /** Ejemplo en código Python (se muestra resaltado) */
  codigo?: string;
  tabla?: Tabla;
  trampa?: string;
  /** Palabras extra para el buscador */
  tags?: string[];
}

export interface Flashcard {
  id: string;
  bloque: BloqueId;
  frente: string;
  reverso: string;
  codigo?: string;
}

/** Pregunta de test: opción múltiple ('mc') o verdadero/falso ('vf') */
export interface Pregunta {
  id: string;
  bloque: BloqueId;
  tipo: 'mc' | 'vf';
  enunciado: string;
  codigo?: string;
  /** En 'vf' se ignoran y se usan ['Verdadero', 'Falso'] */
  opciones: string[];
  /** Índice de la opción correcta (en 'vf': 0 = Verdadero, 1 = Falso) */
  correcta: number;
  explicacion: string;
  trampa?: string;
}

interface EjercicioBase {
  id: string;
  bloque: BloqueId;
  titulo: string;
  enunciado: string;
  explicacion: string;
  trampa?: string;
}

/** ¿Qué imprime este código? */
export interface EjercicioSalida extends EjercicioBase {
  tipo: 'salida';
  codigo: string;
  salida: string;
}

/** Completa el hueco: cada `___` del código es un hueco, en orden */
export interface EjercicioHueco extends EjercicioBase {
  tipo: 'hueco';
  codigo: string;
  /** Respuestas aceptadas para cada hueco (se comparan sin espacios) */
  huecos: string[][];
}

/** Ordena las líneas: `lineas` está en el orden correcto, con sangría de 4 espacios */
export interface EjercicioOrdenar extends EjercicioBase {
  tipo: 'ordenar';
  lineas: string[];
  /** Pares de índices (del orden correcto) que también son válidos intercambiados */
  intercambiables?: [number, number][];
}

export type Ejercicio = EjercicioSalida | EjercicioHueco | EjercicioOrdenar;
