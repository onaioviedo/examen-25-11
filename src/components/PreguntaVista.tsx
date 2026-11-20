import type { Pregunta } from '../data/tipos';
import { clases } from '../lib/util';
import { CodeBlock } from './CodeBlock';
import { Icono } from './Icono';
import { ChipBloque, Explicacion, Trampa } from './ui';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Muestra una pregunta de test. Con `mostrar`, marca la correcta y enseña la explicación. */
export function PreguntaVista({
  p,
  elegida,
  onElegir,
  mostrar,
  numero,
}: {
  p: Pregunta;
  elegida: number | null;
  onElegir: (i: number) => void;
  mostrar: boolean;
  numero?: string;
}) {
  const opciones = p.tipo === 'vf' ? ['Verdadero', 'Falso'] : p.opciones;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ChipBloque bloque={p.bloque} />
        <span>{p.tipo === 'vf' ? 'Verdadero / Falso' : 'Opción múltiple'}</span>
        {numero && <span className="ml-auto tabular-nums">{numero}</span>}
      </div>
      <p className="text-[17px] leading-snug font-semibold">{p.enunciado}</p>
      {p.codigo && <CodeBlock code={p.codigo} />}
      <div className={clases('grid gap-2', p.tipo === 'vf' && 'grid-cols-2')}>
        {opciones.map((op, i) => {
          const esCorrecta = i === p.correcta;
          const esElegida = i === elegida;
          return (
            <button
              key={i}
              type="button"
              disabled={mostrar}
              onClick={() => onElegir(i)}
              aria-pressed={esElegida}
              className={clases(
                'flex min-h-12 items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-[15px] transition-colors',
                !mostrar && !esElegida && 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
                !mostrar && esElegida && 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 dark:bg-indigo-500/15',
                mostrar && esCorrecta && 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100',
                mostrar && esElegida && !esCorrecta && 'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-500/15 dark:text-rose-100',
                mostrar && !esCorrecta && !esElegida && 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900',
              )}
            >
              {p.tipo === 'mc' && (
                <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {LETRAS[i]}
                </span>
              )}
              <span className="flex-1">{op}</span>
              {mostrar && esCorrecta && <Icono nombre="check" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
              {mostrar && esElegida && !esCorrecta && <Icono nombre="x" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
            </button>
          );
        })}
      </div>
      {mostrar && (
        <div className="space-y-2">
          <Explicacion>{p.explicacion}</Explicacion>
          {p.trampa && <Trampa>{p.trampa}</Trampa>}
        </div>
      )}
    </div>
  );
}
