import { useSyncExternalStore } from 'react';

// Progreso del estudiante guardado en localStorage (siempre envuelto en try/catch:
// en modo privado o con el almacenamiento bloqueado la web funciona igual, sin guardar).

const CLAVE = 'estudio-bigdata-progreso-v1';

export type Resultado = 'ok' | 'fail';

export interface RegistroPregunta {
  ok: number;
  fail: number;
  ultimo: Resultado;
  t: number;
}

export interface RegistroFlashcard {
  estado: 'sabe' | 'repasar';
  /** Veces seguidas que se ha marcado «Lo sé» */
  racha: number;
  t: number;
}

export interface RegistroEjercicio {
  ultimo: Resultado;
  intentos: number;
  t: number;
}

export interface ResultadoSimulacro {
  fecha: number;
  nota: number;
  aciertos: number;
  total: number;
  segundos: number;
  porBloque: Record<string, { aciertos: number; total: number }>;
}

export interface Progreso {
  preguntas: Record<string, RegistroPregunta>;
  flashcards: Record<string, RegistroFlashcard>;
  ejercicios: Record<string, RegistroEjercicio>;
  simulacros: ResultadoSimulacro[];
}

const VACIO: Progreso = { preguntas: {}, flashcards: {}, ejercicios: {}, simulacros: [] };

function cargar(): Progreso {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return VACIO;
    const datos = JSON.parse(raw) as Partial<Progreso>;
    return {
      preguntas: datos.preguntas ?? {},
      flashcards: datos.flashcards ?? {},
      ejercicios: datos.ejercicios ?? {},
      simulacros: Array.isArray(datos.simulacros) ? datos.simulacros : [],
    };
  } catch {
    return VACIO;
  }
}

let estado: Progreso = cargar();
const oyentes = new Set<() => void>();

function guardar(nuevo: Progreso) {
  estado = nuevo;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento: el progreso dura solo esta sesión.
  }
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function useProgreso(): Progreso {
  return useSyncExternalStore(suscribir, () => estado, () => estado);
}

export function registrarPregunta(id: string, ok: boolean) {
  const prev = estado.preguntas[id];
  guardar({
    ...estado,
    preguntas: {
      ...estado.preguntas,
      [id]: {
        ok: (prev?.ok ?? 0) + (ok ? 1 : 0),
        fail: (prev?.fail ?? 0) + (ok ? 0 : 1),
        ultimo: ok ? 'ok' : 'fail',
        t: Date.now(),
      },
    },
  });
}

export function registrarFlashcard(id: string, sabe: boolean) {
  const prev = estado.flashcards[id];
  guardar({
    ...estado,
    flashcards: {
      ...estado.flashcards,
      [id]: {
        estado: sabe ? 'sabe' : 'repasar',
        racha: sabe ? (prev?.racha ?? 0) + 1 : 0,
        t: Date.now(),
      },
    },
  });
}

export function registrarEjercicio(id: string, ok: boolean) {
  const prev = estado.ejercicios[id];
  guardar({
    ...estado,
    ejercicios: {
      ...estado.ejercicios,
      [id]: { ultimo: ok ? 'ok' : 'fail', intentos: (prev?.intentos ?? 0) + 1, t: Date.now() },
    },
  });
}

export function guardarSimulacro(r: ResultadoSimulacro) {
  guardar({ ...estado, simulacros: [r, ...estado.simulacros].slice(0, 20) });
}

export function borrarProgreso() {
  guardar(VACIO);
}

// ---------- Tema claro/oscuro ----------

const CLAVE_TEMA = 'estudio-tema';

export function esOscuro(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function cambiarTema(oscuro: boolean) {
  document.documentElement.classList.toggle('dark', oscuro);
  try {
    localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro');
  } catch {
    // ignorar
  }
}
