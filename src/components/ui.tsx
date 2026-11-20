import type { ReactNode } from 'react';
import { BLOQUES, infoBloque } from '../data/bloques';
import type { BloqueId, Tabla as TablaT } from '../data/tipos';
import { clases } from '../lib/util';
import { Icono, type NombreIcono } from './Icono';

export function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clases(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

type Variante = 'primario' | 'secundario' | 'exito' | 'peligro' | 'fantasma';

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900',
  secundario:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  exito: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
  peligro: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
  fantasma: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
};

export function Boton({
  children,
  onClick,
  variante = 'primario',
  className,
  disabled,
  icono,
  type = 'button',
  title,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variante?: Variante;
  className?: string;
  disabled?: boolean;
  icono?: NombreIcono;
  type?: 'button' | 'submit';
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clases(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTES[variante],
        className,
      )}
    >
      {icono && <Icono nombre={icono} className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ChipBloque({ bloque }: { bloque: BloqueId }) {
  const b = infoBloque(bloque);
  return <span className={clases('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', b.chip)}>{b.corto}</span>;
}

/** Fila de filtros: Todos + un chip por bloque */
export function FiltroBloques({
  valor,
  onCambio,
  conteos,
}: {
  valor: BloqueId | 'todos';
  onCambio: (v: BloqueId | 'todos') => void;
  conteos?: Partial<Record<BloqueId | 'todos', number>>;
}) {
  const opciones: { id: BloqueId | 'todos'; nombre: string }[] = [
    { id: 'todos', nombre: 'Todos' },
    ...BLOQUES.map((b) => ({ id: b.id, nombre: b.corto })),
  ];
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambio(o.id)}
          aria-pressed={valor === o.id}
          className={clases(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            valor === o.id
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
          )}
        >
          {o.nombre}
          {conteos?.[o.id] !== undefined && <span className="ml-1.5 opacity-70">{conteos[o.id]}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pestanas<T extends string>({
  valor,
  onCambio,
  opciones,
}: {
  valor: T;
  onCambio: (v: T) => void;
  opciones: { id: T; nombre: string }[];
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4">
      <div className="flex gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onCambio(o.id)}
            aria-pressed={valor === o.id}
            className={clases(
              'shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3',
              valor === o.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BarraProgreso({ valor, color = 'bg-indigo-500', className }: { valor: number; color?: string; className?: string }) {
  return (
    <div className={clases('h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}>
      <div className={clases('h-full rounded-full transition-all', color)} style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
    </div>
  );
}

export function Tabla({ tabla, compacta }: { tabla: TablaT; compacta?: boolean }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className={clases('w-full border-collapse text-left', compacta ? 'text-xs' : 'text-sm')}>
        <thead>
          <tr>
            {tabla.cabecera.map((c) => (
              <th
                key={c}
                className="border-b-2 border-slate-200 px-2 py-1.5 font-semibold whitespace-nowrap text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
              {fila.map((celda, k) => (
                <td key={k} className={clases('px-2 py-1.5 align-top', k === 0 && 'font-medium')}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Recuadro de «trampa típica» */
export function Trampa({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <span className="font-semibold">Trampa típica: </span>
        {children}
      </div>
    </div>
  );
}

export function Explicacion({ children, titulo = 'Explicación' }: { children: ReactNode; titulo?: string }) {
  return (
    <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
      <Icono nombre="bombilla" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <span className="font-semibold">{titulo}: </span>
        {children}
      </div>
    </div>
  );
}

export function Resultado({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={clases(
        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold',
        ok
          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200'
          : 'bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200',
      )}
    >
      <Icono nombre={ok ? 'check' : 'x'} className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
      {sub && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </div>
  );
}
