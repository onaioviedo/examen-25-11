import { useMemo, useState, type ReactNode } from 'react';
import { TEMARIO } from '../data/temario';
import { ejecutarRe, pyStr, type FlagsPy, type InfoMatch } from '../lib/pyre';
import { clases } from '../lib/util';
import { Icono } from './Icono';
import { Tabla, Tarjeta } from './ui';

interface Ejemplo {
  nombre: string;
  patron: string;
  texto: string;
  repl: string;
  flags?: Partial<FlagsPy>;
}

const EJEMPLOS: Ejemplo[] = [
  { nombre: 'Código postal', patron: String.raw`\d{5}`, texto: 'CP: 08001, Barcelona', repl: '#####' },
  { nombre: 'Validar AB123', patron: String.raw`[A-Z]{2}\d{3}`, texto: 'AB123', repl: '' },
  { nombre: 'Grupos', patron: String.raw`([A-Z])(\d+)`, texto: 'Pedidos: A12, B345 y C7', repl: String.raw`\2-\1` },
  { nombre: 'No greedy', patron: '<.*?>', texto: '<b>hola</b>', repl: '' },
  { nombre: 'Greedy', patron: '<.*>', texto: '<b>hola</b>', repl: '' },
  { nombre: 'Limpiar espacios', patron: String.raw`\s+`, texto: 'uno    dos   tres', repl: ' ' },
  { nombre: 'Separadores', patron: String.raw`[,;]\s*`, texto: 'a, b;c ;d', repl: ' | ' },
  { nombre: 'Palabra completa', patron: String.raw`\bgato\b`, texto: 'el gato y el gatopardo', repl: 'perro' },
  { nombre: 'Teléfonos', patron: String.raw`\d{9}`, texto: 'Llamar al 600123456 o al 911222333', repl: 'XXX' },
  { nombre: 'Email básico', patron: String.raw`[\w.]+@\w+\.\w+`, texto: 'Escribe a ana.lopez@correo.com o a pepe@web.es', repl: '<email>' },
  { nombre: 'MULTILINE', patron: String.raw`^\w+`, texto: 'uno dos\ntres cuatro', repl: '*', flags: { MULTILINE: true } },
];

const FUNCIONES = {
  cabecera: ['Función', 'Devuelve'],
  filas: [
    ['search(p, t)', 'Match de la 1.ª coincidencia en cualquier posición, o None'],
    ['match(p, t)', 'Match solo si coincide desde el inicio, o None'],
    ['fullmatch(p, t)', 'Match si TODO el texto coincide (validar), o None'],
    ['findall(p, t)', 'Lista de cadenas (o tuplas si hay varios grupos)'],
    ['finditer(p, t)', 'Iterador de objetos Match'],
    ['sub(p, r, t)', 'Nueva cadena con las coincidencias sustituidas'],
    ['split(p, t)', 'Lista de trozos (los grupos capturados se incluyen)'],
    ['compile(p, flags)', 'Patrón reutilizable con .search(), .findall()…'],
  ],
};

function Fila({ llamada, children }: { llamada: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
      <p className="overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{llamada}</p>
      <div className="mt-1 overflow-x-auto font-mono text-sm">{children}</div>
    </div>
  );
}

function VerMatch({ m }: { m: InfoMatch | null }) {
  if (!m) return <span className="text-rose-600 dark:text-rose-400">None</span>;
  return (
    <div className="space-y-0.5">
      <p className="whitespace-nowrap text-emerald-700 dark:text-emerald-400">{m.repr}</p>
      <p className="text-xs whitespace-nowrap text-slate-600 dark:text-slate-400">
        .group() = {pyStr(m.group)} · .start() = {m.start} · .end() = {m.end} · .span() = ({m.start}, {m.end})
      </p>
      {m.grupos.map((g) => (
        <p key={g.indice} className="text-xs whitespace-nowrap text-slate-600 dark:text-slate-400">
          .group({g.indice}) = {g.valor === null ? 'None' : pyStr(g.valor)}
          {g.span && ` · span(${g.indice}) = (${g.span[0]}, ${g.span[1]})`}
        </p>
      ))}
    </div>
  );
}

export function RegexTester() {
  const [patron, setPatron] = useState(EJEMPLOS[0].patron);
  const [texto, setTexto] = useState(EJEMPLOS[0].texto);
  const [repl, setRepl] = useState(EJEMPLOS[0].repl);
  const [flags, setFlags] = useState<FlagsPy>({ IGNORECASE: false, MULTILINE: false, DOTALL: false });
  const [verDiferencias, setVerDiferencias] = useState(false);

  const r = useMemo(() => ejecutarRe(patron, texto, repl, flags), [patron, texto, repl, flags]);

  const flagsTxt = (Object.keys(flags) as (keyof FlagsPy)[])
    .filter((k) => flags[k])
    .map((k) => `re.${k}`)
    .join(' | ');
  const f = flagsTxt ? `, ${flagsTxt}` : '';
  const p = `r"${patron}"`;
  const t = 'texto';

  // Texto con las coincidencias resaltadas
  const resaltado = useMemo(() => {
    const trozos: ReactNode[] = [];
    let ultimo = 0;
    r.finditer.forEach((m, i) => {
      if (m.start > ultimo) trozos.push(texto.slice(ultimo, m.start));
      trozos.push(
        <mark key={i} className={clases('rounded px-0.5', i % 2 ? 'bg-amber-200 dark:bg-amber-500/40' : 'bg-emerald-200 dark:bg-emerald-500/40', 'text-inherit')}>
          {m.group || '∅'}
        </mark>,
      );
      ultimo = Math.max(ultimo, m.end);
    });
    trozos.push(texto.slice(ultimo));
    return trozos;
  }, [r.finditer, texto]);

  const meta = TEMARIO.find((c) => c.id === 't-re-meta')?.tabla;
  const cuant = TEMARIO.find((c) => c.id === 't-re-cuantificadores')?.tabla;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-4">
        <Tarjeta className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm font-semibold">Ejemplos</p>
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
              {EJEMPLOS.map((e) => (
                <button
                  key={e.nombre}
                  type="button"
                  onClick={() => {
                    setPatron(e.patron);
                    setTexto(e.texto);
                    setRepl(e.repl);
                    setFlags({ IGNORECASE: false, MULTILINE: false, DOTALL: false, ...e.flags });
                  }}
                  className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900"
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Patrón</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white font-mono focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950">
              <span className="pl-3 text-slate-400">r"</span>
              <input
                value={patron}
                onChange={(e) => setPatron(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 bg-transparent px-0.5 text-[16px] outline-none"
              />
              <span className="pr-3 text-slate-400">"</span>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Texto</span>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-[16px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Reemplazo para sub() <span className="font-normal text-slate-500">(\1 o \g&lt;1&gt; para grupos)</span>
            </span>
            <input
              value={repl}
              onChange={(e) => setRepl(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-[16px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {(Object.keys(flags) as (keyof FlagsPy)[]).map((k) => (
              <label key={k} className="flex items-center gap-1.5 font-mono">
                <input type="checkbox" checked={flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} className="h-4 w-4 accent-indigo-600" />
                re.{k}
              </label>
            ))}
          </div>
        </Tarjeta>

        {r.error ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 font-mono text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            Patrón no válido: {r.error}
          </div>
        ) : (
          <>
            <Tarjeta>
              <p className="mb-1 text-sm font-semibold">
                Coincidencias en el texto ({r.finditer.length}){r.numGrupos > 0 && ` · ${r.numGrupos} grupo${r.numGrupos > 1 ? 's' : ''} capturante${r.numGrupos > 1 ? 's' : ''}`}
              </p>
              <p className="font-mono text-[15px] break-all whitespace-pre-wrap">{resaltado}</p>
            </Tarjeta>

            <Tarjeta className="py-1">
              <Fila llamada={`re.search(${p}, ${t}${f})`}>
                <VerMatch m={r.search} />
              </Fila>
              <Fila llamada={`re.match(${p}, ${t}${f})`}>
                <VerMatch m={r.match} />
              </Fila>
              <Fila llamada={`re.fullmatch(${p}, ${t}${f})`}>
                <VerMatch m={r.fullmatch} />
              </Fila>
              <Fila llamada={`re.findall(${p}, ${t}${f})`}>
                <span className="whitespace-nowrap">{r.findall}</span>
              </Fila>
              <Fila llamada={`[m.group() for m in re.finditer(${p}, ${t}${f})]`}>
                <span className="whitespace-nowrap">[{r.finditer.map((m) => pyStr(m.group)).join(', ')}]</span>
              </Fila>
              <Fila llamada={`re.sub(${p}, r"${repl}", ${t}${f})`}>
                <span className="whitespace-nowrap">{r.sub}</span>
              </Fila>
              <Fila llamada={`re.split(${p}, ${t}${f})`}>
                <span className="whitespace-nowrap">{r.split}</span>
              </Fila>
            </Tarjeta>
          </>
        )}

        {r.avisos.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            {r.avisos.map((a) => (
              <p key={a} className="flex gap-2">
                <Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0" />
                {a}
              </p>
            ))}
          </div>
        )}

        <Tarjeta>
          <button type="button" onClick={() => setVerDiferencias(!verDiferencias)} className="flex w-full items-center justify-between text-left text-sm font-semibold">
            Diferencias entre esta simulación (JavaScript) y el módulo re de Python
            <Icono nombre={verDiferencias ? 'arriba' : 'abajo'} className="h-4 w-4 shrink-0" />
          </button>
          {verDiferencias && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>Se usa RegExp de JavaScript. Para los patrones básicos del temario el resultado es el mismo que en Python.</li>
              <li>
                En Python 3, <code>\w</code>, <code>\d</code> y <code>\b</code> reconocen Unicode (á, ñ…); en JavaScript solo ASCII. Con tildes o eñes el resultado
                puede variar (se avisa automáticamente).
              </li>
              <li>
                Grupos con nombre: Python usa <code>(?P&lt;nombre&gt;…)</code>; aquí se traduce a la sintaxis de JS.
              </li>
              <li>
                En sub(), Python usa <code>\1</code> o <code>\g&lt;1&gt;</code>; JS usa <code>$1</code>. Se convierte solo.
              </li>
              <li>Con patrones que admiten coincidencias vacías (p. ej. <code>\d*</code>), findall y split pueden dar resultados algo distintos.</li>
              <li>Los mensajes de error de sintaxis son los de JavaScript, no los de Python.</li>
            </ul>
          )}
        </Tarjeta>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Chuleta: símbolos</h3>
          {meta && <Tabla tabla={meta} compacta />}
        </Tarjeta>
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Cuantificadores</h3>
          {cuant && <Tabla tabla={cuant} compacta />}
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Añade <code>?</code> para la versión no codiciosa: <code>*?</code>, <code>+?</code>. Clases: <code>[abc]</code> <code>[0-9]</code>{' '}
            <code>[^0-9]</code>. Grupos: <code>( )</code> captura, <code>(?: )</code> no. Alternativa: <code>a|b</code>.
          </p>
        </Tarjeta>
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Funciones</h3>
          <Tabla tabla={FUNCIONES} compacta />
        </Tarjeta>
      </aside>
    </div>
  );
}
