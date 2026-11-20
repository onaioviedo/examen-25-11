import { useEffect, useMemo, useState } from 'react';
import { HORAS_BUBBLE } from '../data/alumnos';
import { CODIGO_BUBBLE, generarPasos } from '../lib/bubble';
import { clases } from '../lib/util';
import { CodeBlock } from './CodeBlock';
import { Icono } from './Icono';
import { Boton, Tarjeta } from './ui';

export function BubbleSort() {
  const { pasos, pasadas } = useMemo(() => generarPasos(HORAS_BUBBLE), []);
  const [k, setK] = useState(0);
  const paso = pasos[k];
  const n = HORAS_BUBBLE.length;

  const ir = (nuevo: number) => setK(Math.max(0, Math.min(pasos.length - 1, nuevo)));

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') setK((x) => Math.min(pasos.length - 1, x + 1));
      if (e.key === 'ArrowLeft') setK((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [pasos.length]);

  const pasadaActual = paso.i;
  // Final de la pasada en curso (o de la siguiente, si estamos entre pasadas)
  const finDePasada = pasadas.find((p) => p.pasoFin > k)?.pasoFin;
  const comparando = paso.j !== null && ['comparar', 'aux', 'asig1', 'asig2'].includes(paso.tipo);

  return (
    <div className="space-y-4">
      <Tarjeta className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Bubble Sort paso a paso</h2>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            Paso {k + 1} / {pasos.length}
          </span>
        </div>

        {/* Lista */}
        <div className="grid grid-cols-10 gap-1 sm:gap-2">
          {paso.lista.map((v, idx) => {
            const ordenada = idx >= paso.ordenadasDesde;
            const enComparacion = comparando && (idx === paso.j || idx === paso.j! + 1);
            const cambiada = paso.cambiadas.includes(idx);
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={clases(
                    'grid aspect-square w-full place-items-center rounded-lg border-2 text-base font-bold tabular-nums transition-colors sm:text-xl',
                    ordenada && 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100',
                    !ordenada && enComparacion && paso.comparacion?.resultado && 'border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100',
                    !ordenada && enComparacion && !paso.comparacion?.resultado && 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100',
                    !ordenada && !enComparacion && 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
                    cambiada && 'ring-4 ring-indigo-400/60',
                  )}
                >
                  {v}
                </div>
                <span className="font-mono text-[10px] text-slate-500 sm:text-xs">{idx}</span>
                <span className="h-4 font-mono text-[10px] font-bold text-indigo-600 sm:text-xs dark:text-indigo-400">
                  {comparando && idx === paso.j ? 'j' : comparando && idx === paso.j! + 1 ? 'j+1' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Variables */}
        <div className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">n = {n}</div>
          <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">i = {paso.i ?? '—'}</div>
          <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">j = {paso.j ?? '—'}</div>
          <div
            className={clases(
              'rounded-lg px-2 py-1.5',
              paso.auxiliar !== null ? 'bg-indigo-100 font-bold text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-100' : 'bg-slate-100 dark:bg-slate-800',
            )}
          >
            auxiliar = {paso.auxiliar ?? '—'}
          </div>
        </div>

        {paso.i !== null && (
          <p className="font-mono text-sm">
            range(n - 1 - i) = range({n} - 1 - {paso.i}) = range({n - 1 - paso.i}) → j de 0 a {n - 2 - paso.i}
          </p>
        )}
        {paso.comparacion && paso.j !== null && (
          <p className="font-mono text-sm">
            horas[{paso.j}] &gt; horas[{paso.j + 1}] → {paso.comparacion.a} &gt; {paso.comparacion.b} →{' '}
            <b className={paso.comparacion.resultado ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
              {paso.comparacion.resultado ? 'True' : 'False'}
            </b>
          </p>
        )}

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[15px] dark:border-indigo-500/30 dark:bg-indigo-500/10">{paso.mensaje}</div>

        {/* Controles */}
        <div className="grid grid-cols-3 gap-2">
          <Boton variante="secundario" onClick={() => ir(k - 1)} disabled={k === 0} icono="izq">
            Anterior
          </Boton>
          <Boton onClick={() => ir(k + 1)} disabled={k === pasos.length - 1}>
            Siguiente <Icono nombre="der" className="h-4 w-4" />
          </Boton>
          <Boton variante="secundario" onClick={() => setK(0)} icono="reiniciar">
            Reiniciar
          </Boton>
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="fantasma" className="text-xs" disabled={finDePasada === undefined} onClick={() => finDePasada !== undefined && ir(finDePasada)}>
            Saltar al final de la pasada
          </Boton>
          <Boton variante="fantasma" className="text-xs" onClick={() => ir(pasos.length - 1)}>
            Ir al final
          </Boton>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="mr-2 inline-block h-3 w-3 rounded-sm border-2 border-amber-500 bg-amber-100 align-middle" /> se comparan, no se cambian ·{' '}
          <span className="mx-1 inline-block h-3 w-3 rounded-sm border-2 border-rose-500 bg-rose-100 align-middle" /> se intercambian ·{' '}
          <span className="mx-1 inline-block h-3 w-3 rounded-sm border-2 border-emerald-500 bg-emerald-100 align-middle" /> ya ordenadas. Teclado: ← →
        </p>
      </Tarjeta>

      <div className="grid gap-4 md:grid-cols-2">
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Código</h3>
          <CodeBlock code={CODIGO_BUBBLE} lineaActiva={paso.linea} numeros />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Comparaciones: <b className="tabular-nums">{paso.comparaciones}</b> · Intercambios: <b className="tabular-nums">{paso.intercambios}</b>
          </p>
        </Tarjeta>

        <Tarjeta>
          <h3 className="mb-2 font-semibold">Tabla de pasadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left dark:border-slate-700">
                  <th className="px-1.5 py-1">Pasada</th>
                  <th className="px-1.5 py-1">i</th>
                  <th className="px-1.5 py-1">range de j</th>
                  <th className="px-1.5 py-1">j toma</th>
                  <th className="px-1.5 py-1">Interc.</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {pasadas.map((p) => (
                  <tr
                    key={p.i}
                    onClick={() => ir(p.pasoInicio)}
                    className={clases(
                      'cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
                      p.i === pasadaActual && 'bg-amber-100 font-bold dark:bg-amber-500/15',
                    )}
                  >
                    <td className="px-1.5 py-1">{p.pasada}</td>
                    <td className="px-1.5 py-1">{p.i}</td>
                    <td className="px-1.5 py-1">range({p.rango})</td>
                    <td className="px-1.5 py-1">{p.jMax === 0 ? '0' : `0 a ${p.jMax}`}</td>
                    <td className="px-1.5 py-1">{p.intercambios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Toca una fila para ir al inicio de esa pasada.</p>
        </Tarjeta>
      </div>

      <Tarjeta className="space-y-2 text-sm">
        <h3 className="font-semibold">Preguntas que caen</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>¿Qué valor toma j en la pasada 3?</b> i = 2 → range(7) → j de 0 a 6.
          </li>
          <li>
            <b>¿Qué pasa si quitas el «- i»?</b> Ordena igual, pero compara también las posiciones finales ya ordenadas (81 comparaciones en vez de 45).
          </li>
          <li>
            <b>¿Y si quitas el «- 1»?</b> En la primera pasada j llega a 9 y horas[10] da IndexError.
          </li>
          <li>
            <b>¿Por qué n − 1 pasadas?</b> Cada pasada coloca un elemento al final; cuando quedan 9 colocados, el primero ya está en su sitio.
          </li>
        </ul>
      </Tarjeta>
    </div>
  );
}
