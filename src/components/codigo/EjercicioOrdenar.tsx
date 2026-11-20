import { useMemo, useState } from 'react';
import type { EjercicioOrdenar as T } from '../../data/tipos';
import { registrarEjercicio } from '../../lib/progreso';
import { barajar, clases } from '../../lib/util';
import { CodeBlock } from '../CodeBlock';
import { Icono } from '../Icono';
import { Boton, Explicacion, Resultado, Trampa } from '../ui';

interface Colocada {
  idx: number;
  sangria: number;
}

function partir(l: string) {
  const texto = l.trimStart();
  return { texto, sangria: Math.round((l.length - texto.length) / 4) };
}

/** Todas las ordenaciones válidas (aplicando cualquier combinación de intercambios permitidos) */
function ordenesValidos(lineas: string[], pares: [number, number][] = []): string[][] {
  const res: string[][] = [];
  for (let mask = 0; mask < 1 << pares.length; mask++) {
    const orden = [...lineas];
    pares.forEach(([a, b], k) => {
      if (mask & (1 << k)) [orden[a], orden[b]] = [orden[b], orden[a]];
    });
    res.push(orden);
  }
  return res;
}

function mezclaInicial(n: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  let m = barajar(base);
  for (let t = 0; t < 5 && m.every((v, i) => v === i); t++) m = barajar(base);
  return m;
}

/** «Ordena las líneas»: se tocan las líneas en el orden correcto para construir el programa. */
export function EjercicioOrdenar({ e }: { e: T }) {
  const partes = useMemo(() => e.lineas.map(partir), [e.lineas]);
  const validos = useMemo(() => ordenesValidos(e.lineas, e.intercambiables), [e.lineas, e.intercambiables]);
  const [dificil, setDificil] = useState(false);
  const [pool, setPool] = useState<number[]>(() => mezclaInicial(e.lineas.length));
  const [colocadas, setColocadas] = useState<Colocada[]>([]);
  const [corregido, setCorregido] = useState<boolean[] | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);

  const reiniciar = (nuevoDificil = dificil) => {
    setDificil(nuevoDificil);
    setPool(mezclaInicial(e.lineas.length));
    setColocadas([]);
    setCorregido(null);
  };

  const colocar = (idx: number) => {
    setPool((p) => p.filter((x) => x !== idx));
    setColocadas((c) => [...c, { idx, sangria: dificil ? 0 : partes[idx].sangria }]);
    setCorregido(null);
  };

  const quitar = (pos: number) => {
    const c = colocadas[pos];
    setColocadas((cs) => cs.filter((_, i) => i !== pos));
    setPool((p) => [...p, c.idx]);
    setCorregido(null);
  };

  const cambiarSangria = (pos: number, delta: number) => {
    setColocadas((cs) => cs.map((c, i) => (i === pos ? { ...c, sangria: Math.max(0, Math.min(4, c.sangria + delta)) } : c)));
    setCorregido(null);
  };

  const comprobar = () => {
    const candidato = colocadas.map((c) => ' '.repeat(c.sangria * 4) + partes[c.idx].texto);
    let mejor: boolean[] = [];
    for (const v of validos) {
      const marcas = candidato.map((l, i) => l === v[i]);
      if (marcas.filter(Boolean).length > mejor.filter(Boolean).length || mejor.length === 0) mejor = marcas;
    }
    setCorregido(mejor);
    registrarEjercicio(e.id, mejor.every(Boolean));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={dificil} onChange={(ev) => reiniciar(ev.target.checked)} className="h-4 w-4 accent-indigo-600" />
        Modo difícil: sin sangría (la pones tú con ⇤ ⇥, como en el examen a mano)
      </label>

      <div>
        <p className="mb-1 text-sm font-semibold">Tu programa ({colocadas.length}/{e.lineas.length}):</p>
        <div className="min-h-16 space-y-1 rounded-xl bg-[#282c34] p-2">
          {colocadas.length === 0 && <p className="p-2 text-sm text-slate-400">Toca las líneas de abajo en orden…</p>}
          {colocadas.map((c, pos) => (
            <div
              key={`${c.idx}-${pos}`}
              className={clases(
                'flex items-stretch gap-1 rounded-lg',
                corregido?.[pos] === true && 'bg-emerald-500/20 ring-1 ring-emerald-500',
                corregido?.[pos] === false && 'bg-rose-500/20 ring-1 ring-rose-500',
              )}
            >
              <span className="w-5 shrink-0 pt-1.5 text-right font-mono text-xs text-slate-500 select-none">{pos + 1}</span>
              <button
                type="button"
                onClick={() => quitar(pos)}
                title="Devolver la línea"
                className="min-w-0 flex-1 overflow-x-auto rounded-md px-1.5 py-1 text-left font-mono text-[13px] whitespace-pre text-slate-100 hover:bg-white/10 sm:text-sm"
              >
                {'    '.repeat(c.sangria)}
                {partes[c.idx].texto}
              </button>
              {dificil && (
                <span className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => cambiarSangria(pos, -1)}
                    aria-label="Quitar sangría"
                    className="rounded-md px-1.5 text-slate-300 hover:bg-white/10"
                  >
                    <Icono nombre="desangria" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarSangria(pos, 1)}
                    aria-label="Añadir sangría"
                    className="rounded-md px-1.5 text-slate-300 hover:bg-white/10"
                  >
                    <Icono nombre="sangria" className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {pool.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-semibold">Líneas disponibles:</p>
          <div className="space-y-1.5">
            {pool.map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => colocar(idx)}
                className="block w-full overflow-x-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-left font-mono text-[13px] whitespace-pre hover:border-indigo-400 hover:bg-indigo-50 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                {dificil ? partes[idx].texto : e.lineas[idx]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Boton onClick={comprobar} disabled={pool.length > 0}>
          Comprobar
        </Boton>
        <Boton variante="secundario" icono="deshacer" onClick={() => colocadas.length && quitar(colocadas.length - 1)} disabled={!colocadas.length}>
          Deshacer
        </Boton>
        <Boton variante="secundario" icono="reiniciar" onClick={() => reiniciar()}>
          Reiniciar
        </Boton>
        <Boton variante="secundario" icono="ojo" onClick={() => setVerSolucion(!verSolucion)}>
          {verSolucion ? 'Ocultar solución' : 'Ver solución explicada'}
        </Boton>
      </div>

      {corregido && (
        <Resultado ok={corregido.every(Boolean)}>
          {corregido.every(Boolean)
            ? '¡Orden (y sangría) correctos!'
            : `${corregido.filter(Boolean).length} de ${corregido.length} líneas en su sitio. Toca una línea para devolverla.`}
        </Resultado>
      )}

      {verSolucion && (
        <div className="space-y-2">
          <CodeBlock code={e.lineas.join('\n')} numeros />
          <Explicacion>{e.explicacion}</Explicacion>
          {e.trampa && <Trampa>{e.trampa}</Trampa>}
        </div>
      )}
    </div>
  );
}
