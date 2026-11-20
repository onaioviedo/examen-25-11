import { Highlight, themes } from 'prism-react-renderer';
import { Fragment, useMemo, useState } from 'react';
import type { EjercicioHueco as T } from '../../data/tipos';
import { registrarEjercicio } from '../../lib/progreso';
import { clases } from '../../lib/util';
import { CodeBlock } from '../CodeBlock';
import { Boton, Explicacion, Resultado, Trampa } from '../ui';

const norm = (s: string) => s.replace(/\s+/g, '').replace(/'/g, '"');

/** Código con huecos (___) que se rellenan en línea. */
export function EjercicioHueco({ e }: { e: T }) {
  const n = e.huecos.length;
  const [valores, setValores] = useState<string[]>(() => Array(n).fill(''));
  const [corregido, setCorregido] = useState<boolean[] | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);

  // Sustituye cada ___ por un marcador único para poder colocar inputs tras el resaltado
  const plantilla = useMemo(() => {
    let k = 0;
    return e.codigo.replace(/___/g, () => `__HUECO${k++}__`);
  }, [e.codigo]);

  const solucion = useMemo(() => {
    let k = 0;
    return e.codigo.replace(/___/g, () => e.huecos[k++][0]);
  }, [e.codigo, e.huecos]);

  const comprobar = () => {
    const r = valores.map((v, i) => e.huecos[i].some((ok) => norm(ok) === norm(v)));
    setCorregido(r);
    registrarEjercicio(e.id, r.every(Boolean));
  };

  const renderTexto = (contenido: string, clave: string) =>
    contenido.split(/(__HUECO\d+__)/).map((parte, i) => {
      const m = parte.match(/^__HUECO(\d+)__$/);
      if (!m) return <Fragment key={`${clave}-${i}`}>{parte}</Fragment>;
      const h = Number(m[1]);
      const estado = corregido?.[h];
      return (
        <input
          key={`${clave}-${i}`}
          value={valores[h]}
          aria-label={`Hueco ${h + 1}`}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onChange={(ev) => {
            const v = [...valores];
            v[h] = ev.target.value;
            setValores(v);
            setCorregido(null);
          }}
          placeholder={String(h + 1)}
          style={{ width: `${Math.max(3, valores[h].length + 1.5)}ch` }}
          className={clases(
            'mx-0.5 rounded-md border-2 bg-slate-800 px-1 py-0 text-center font-mono text-[13px] text-amber-200 outline-none placeholder:text-slate-500 focus:border-indigo-400 sm:text-sm',
            estado === undefined && 'border-dashed border-slate-500',
            estado === true && 'border-emerald-500',
            estado === false && 'border-rose-500',
          )}
        />
      );
    });

  return (
    <div className="space-y-3">
      <Highlight theme={themes.oneDark} code={plantilla} language="python">
        {({ className: c, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clases(c, 'overflow-x-auto rounded-xl px-3 py-3 text-[13px] leading-loose sm:text-sm')} style={{ ...style, margin: 0 }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, k) => {
                  const tp = getTokenProps({ token });
                  return token.content.includes('__HUECO') ? (
                    <span key={k} className={tp.className} style={tp.style}>
                      {renderTexto(token.content, `${i}-${k}`)}
                    </span>
                  ) : (
                    <span key={k} {...tp} />
                  );
                })}
              </div>
            ))}
          </pre>
        )}
      </Highlight>

      <div className="flex flex-wrap gap-2">
        <Boton onClick={comprobar} disabled={valores.every((v) => !v.trim())}>
          Comprobar
        </Boton>
        <Boton variante="secundario" icono="ojo" onClick={() => setVerSolucion(!verSolucion)}>
          {verSolucion ? 'Ocultar solución' : 'Ver solución explicada'}
        </Boton>
      </div>

      {corregido && (
        <Resultado ok={corregido.every(Boolean)}>
          {corregido.every(Boolean)
            ? '¡Todos los huecos son correctos!'
            : `${corregido.filter(Boolean).length} de ${n} huecos correctos (en rojo los que fallan).`}
        </Resultado>
      )}

      {verSolucion && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Código completo:</p>
          <CodeBlock code={solucion} />
          <p className="text-sm">
            Respuestas:{' '}
            {e.huecos.map((h, i) => (
              <span key={i} className="mr-2 inline-block">
                <b>{i + 1}</b>: <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">{h.join(' / ')}</code>
              </span>
            ))}
          </p>
          <Explicacion>{e.explicacion}</Explicacion>
          {e.trampa && <Trampa>{e.trampa}</Trampa>}
        </div>
      )}
    </div>
  );
}
