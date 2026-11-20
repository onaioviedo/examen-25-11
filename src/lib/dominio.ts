import { EJERCICIOS } from '../data/ejercicios';
import { FLASHCARDS } from '../data/flashcards';
import { PREGUNTAS } from '../data/preguntas';
import type { BloqueId } from '../data/tipos';
import type { Progreso } from './progreso';

export interface DominioBloque {
  pct: number;
  test: { ok: number; total: number; vistas: number };
  flash: { ok: number; total: number };
  codigo: { ok: number; total: number };
}

/**
 * % de dominio de un bloque = elementos dominados / elementos totales, donde cuenta como dominado:
 * una pregunta cuyo último intento fue correcto, una flashcard marcada «Lo sé» y un ejercicio resuelto.
 */
export function dominioBloque(p: Progreso, bloque: BloqueId): DominioBloque {
  const preg = PREGUNTAS.filter((q) => q.bloque === bloque);
  const flash = FLASHCARDS.filter((f) => f.bloque === bloque);
  const ejer = EJERCICIOS.filter((e) => e.bloque === bloque);
  const test = {
    ok: preg.filter((q) => p.preguntas[q.id]?.ultimo === 'ok').length,
    total: preg.length,
    vistas: preg.filter((q) => p.preguntas[q.id]).length,
  };
  const fl = { ok: flash.filter((f) => p.flashcards[f.id]?.estado === 'sabe').length, total: flash.length };
  const co = { ok: ejer.filter((e) => p.ejercicios[e.id]?.ultimo === 'ok').length, total: ejer.length };
  const total = test.total + fl.total + co.total;
  const ok = test.ok + fl.ok + co.ok;
  return { pct: total ? Math.round((100 * ok) / total) : 0, test, flash: fl, codigo: co };
}

export function preguntasFalladas(p: Progreso) {
  return PREGUNTAS.filter((q) => p.preguntas[q.id]?.ultimo === 'fail');
}

export function ejerciciosFallados(p: Progreso) {
  return EJERCICIOS.filter((e) => p.ejercicios[e.id]?.ultimo === 'fail');
}
