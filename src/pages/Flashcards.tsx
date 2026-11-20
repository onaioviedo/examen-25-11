import { useCallback, useEffect, useMemo, useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { BarraProgreso, Boton, ChipBloque, FiltroBloques, Tarjeta, Titulo, Vacio } from '../components/ui';
import { FLASHCARDS } from '../data/flashcards';
import type { BloqueId, Flashcard } from '../data/tipos';
import { registrarFlashcard, useProgreso, type Progreso } from '../lib/progreso';
import { barajar, clases } from '../lib/util';

/** Cuántas tarjetas pasan antes de que vuelva una marcada «Repasar» */
const HUECO_REPASO = 3;

/**
 * Repetición espaciada simple: primero las marcadas «Repasar», luego las nuevas y al final
 * las que ya sabes (las de menor racha y más antiguas antes).
 */
function crearCola(cartas: Flashcard[], p: Progreso, soloPendientes: boolean): string[] {
  const prioridad = (f: Flashcard) => {
    const r = p.flashcards[f.id];
    if (!r) return 1;
    if (r.estado === 'repasar') return 0;
    return 2 + Math.min(r.racha, 5);
  };
  return barajar(cartas)
    .filter((f) => !soloPendientes || p.flashcards[f.id]?.estado !== 'sabe')
    .sort((a, b) => prioridad(a) - prioridad(b) || (p.flashcards[a.id]?.t ?? 0) - (p.flashcards[b.id]?.t ?? 0))
    .map((f) => f.id);
}

export default function Flashcards() {
  const progreso = useProgreso();
  const [bloque, setBloque] = useState<BloqueId | 'todos'>('todos');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const cartas = useMemo(() => FLASHCARDS.filter((f) => bloque === 'todos' || f.bloque === bloque), [bloque]);
  const [cola, setCola] = useState<string[]>(() => crearCola(cartas, progreso, false));
  const [volteada, setVolteada] = useState(false);
  const [sesion, setSesion] = useState({ sabe: 0, repasar: 0 });

  const reiniciar = useCallback(
    (b: BloqueId | 'todos', solo: boolean) => {
      const filtradas = FLASHCARDS.filter((f) => b === 'todos' || f.bloque === b);
      setCola(crearCola(filtradas, progreso, solo));
      setVolteada(false);
      setSesion({ sabe: 0, repasar: 0 });
    },
    [progreso],
  );

  const actual = FLASHCARDS.find((f) => f.id === cola[0]);
  const dominadas = cartas.filter((f) => progreso.flashcards[f.id]?.estado === 'sabe').length;

  const responder = useCallback(
    (sabe: boolean) => {
      if (!actual) return;
      registrarFlashcard(actual.id, sabe);
      setSesion((s) => ({ sabe: s.sabe + (sabe ? 1 : 0), repasar: s.repasar + (sabe ? 0 : 1) }));
      setVolteada(false);
      setCola((c) => {
        const resto = c.slice(1);
        if (sabe) return resto;
        const pos = Math.min(HUECO_REPASO, resto.length);
        return [...resto.slice(0, pos), c[0], ...resto.slice(pos)];
      });
    },
    [actual],
  );

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        // Si hay un botón enfocado, que actúe él (evita girar dos veces)
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        setVolteada((v) => !v);
      } else if (e.key === 'ArrowRight') responder(true);
      else if (e.key === 'ArrowLeft') responder(false);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [responder]);

  return (
    <div>
      <Titulo sub="Toca la tarjeta para girarla. Las que marques «Repasar» vuelven a salir al poco rato.">Flashcards</Titulo>

      <div className="space-y-3">
        <FiltroBloques
          valor={bloque}
          onCambio={(b) => {
            setBloque(b);
            reiniciar(b, soloPendientes);
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={(e) => {
                setSoloPendientes(e.target.checked);
                reiniciar(bloque, e.target.checked);
              }}
              className="h-4 w-4 accent-indigo-600"
            />
            Solo las que no domino
          </label>
          <span className="text-slate-600 dark:text-slate-400">
            Dominadas <b className="tabular-nums">{dominadas}</b>/{cartas.length}
          </span>
        </div>
        <BarraProgreso valor={(100 * dominadas) / Math.max(1, cartas.length)} color="bg-emerald-500" />
      </div>

      <div className="mt-5">
        {actual ? (
          <>
            <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Quedan {cola.length} en esta ronda</span>
              <span>
                ✓ {sesion.sabe} · ↺ {sesion.repasar}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVolteada(!volteada)}
              className="flip-card block h-80 w-full text-left focus-visible:outline-none"
              aria-label={volteada ? 'Ver la pregunta' : 'Ver la respuesta'}
            >
              <div className={clases('flip-inner relative h-full w-full', volteada && 'is-flipped')}>
                <div className="flip-face absolute inset-0 flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
                  <ChipBloque bloque={actual.bloque} />
                  <p className="my-auto text-center text-xl leading-snug font-semibold">{actual.frente}</p>
                  <p className="text-center text-xs text-slate-400">Toca para ver la respuesta</p>
                </div>
                <div className="flip-face flip-back absolute inset-0 flex flex-col overflow-y-auto rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-md dark:border-indigo-500/30 dark:bg-slate-900">
                  <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">Respuesta</p>
                  <p className="mt-2 text-[15px] leading-relaxed">{actual.reverso}</p>
                  {actual.codigo && <CodeBlock code={actual.codigo} className="mt-3" />}
                </div>
              </div>
            </button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Boton variante="secundario" onClick={() => responder(false)} icono="reiniciar" className="min-h-12 border-rose-300 text-rose-700 dark:border-rose-500/50 dark:text-rose-300">
                Repasar
              </Boton>
              <Boton variante="exito" onClick={() => responder(true)} icono="check" className="min-h-12">
                Lo sé
              </Boton>
            </div>
            <p className="mt-3 hidden text-center text-xs text-slate-500 sm:block">
              Teclado: espacio = girar · ← Repasar · → Lo sé
            </p>
          </>
        ) : cartas.length === 0 ? (
          <Vacio>No hay tarjetas en este bloque.</Vacio>
        ) : (
          <Tarjeta className="text-center">
            <p className="text-lg font-semibold">¡Ronda completada!</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {sesion.sabe} «Lo sé» · {sesion.repasar} «Repasar»
              {soloPendientes && dominadas === cartas.length && ' · ¡Dominas todas las de este bloque!'}
            </p>
            <Boton className="mt-4" icono="reiniciar" onClick={() => reiniciar(bloque, soloPendientes)}>
              Otra ronda
            </Boton>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}
