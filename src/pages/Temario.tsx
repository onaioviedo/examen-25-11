import { useMemo, useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Icono } from '../components/Icono';
import { ChipBloque, FiltroBloques, Tabla, Tarjeta, Titulo, Trampa, Vacio } from '../components/ui';
import { CODIGO_ALUMNOS } from '../data/alumnos';
import { TEMARIO } from '../data/temario';
import type { BloqueId, Concepto } from '../data/tipos';
import type { Ruta } from '../lib/ruta';
import { normalizar } from '../lib/util';

function textoBuscable(c: Concepto): string {
  return normalizar(
    [c.titulo, c.definicion, c.ejemplo, c.codigo, c.trampa, ...(c.tags ?? []), ...(c.tabla?.filas.flat() ?? [])]
      .filter(Boolean)
      .join(' '),
  );
}

function Ficha({ c }: { c: Concepto }) {
  return (
    <Tarjeta className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-snug">{c.titulo}</h2>
        <ChipBloque bloque={c.bloque} />
      </div>
      <p className="text-[15px] text-slate-700 dark:text-slate-300">{c.definicion}</p>
      {c.ejemplo && (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <span className="font-semibold">Ejemplo: </span>
          {c.ejemplo}
        </p>
      )}
      {c.tabla && <Tabla tabla={c.tabla} />}
      {c.codigo && <CodeBlock code={c.codigo} />}
      {c.trampa && <Trampa>{c.trampa}</Trampa>}
    </Tarjeta>
  );
}

export default function Temario({ ruta }: { ruta: Ruta }) {
  const inicial = (ruta.query.get('bloque') as BloqueId | null) ?? 'todos';
  const [bloque, setBloque] = useState<BloqueId | 'todos'>(inicial);
  const [busqueda, setBusqueda] = useState('');
  const [verDatos, setVerDatos] = useState(false);

  const indice = useMemo(() => TEMARIO.map((c) => ({ c, t: textoBuscable(c) })), []);
  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const lista = indice
    .filter(({ c }) => bloque === 'todos' || c.bloque === bloque)
    .filter(({ t }) => terminos.every((w) => t.includes(w)))
    .map(({ c }) => c);

  const conteos = useMemo(() => {
    const r: Partial<Record<BloqueId | 'todos', number>> = { todos: TEMARIO.length };
    for (const c of TEMARIO) r[c.bloque] = (r[c.bloque] ?? 0) + 1;
    return r;
  }, []);

  return (
    <div>
      <Titulo sub="Fichas resumidas: definición corta, ejemplo y trampa típica.">Temario</Titulo>

      <div className="sticky top-14 z-20 -mx-4 space-y-3 bg-slate-50/95 px-4 pt-1 pb-3 backdrop-blur dark:bg-slate-950/95">
        <label className="relative block">
          <span className="sr-only">Buscar concepto</span>
          <Icono nombre="buscar" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar: mediana, super, IQR, fullmatch…"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-9 text-[16px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <FiltroBloques valor={bloque} onCambio={setBloque} conteos={conteos} />
      </div>

      {(bloque === 'todos' || bloque === 'python') && !busqueda && (
        <Tarjeta className="mb-3">
          <button type="button" onClick={() => setVerDatos(!verDatos)} className="flex w-full items-center justify-between text-left">
            <span className="font-semibold">Datos iniciales del examen (alumnos)</span>
            <Icono nombre={verDatos ? 'arriba' : 'abajo'} className="h-4 w-4" />
          </button>
          {verDatos && <CodeBlock code={CODIGO_ALUMNOS} className="mt-3" />}
        </Tarjeta>
      )}

      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
        {lista.length} ficha{lista.length === 1 ? '' : 's'}
      </p>
      <div className="space-y-3">
        {lista.map((c) => (
          <Ficha key={c.id} c={c} />
        ))}
        {lista.length === 0 && <Vacio>No hay fichas que coincidan con «{busqueda}».</Vacio>}
      </div>
    </div>
  );
}
