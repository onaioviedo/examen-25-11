import { Highlight, themes } from 'prism-react-renderer';
import { clases } from '../lib/util';

/** Bloque de código Python con resaltado de sintaxis. */
export function CodeBlock({
  code,
  lineaActiva,
  numeros = false,
  className,
}: {
  code: string;
  /** Línea a resaltar (0-based), p. ej. en el visualizador */
  lineaActiva?: number;
  numeros?: boolean;
  className?: string;
}) {
  return (
    <Highlight theme={themes.oneDark} code={code.replace(/\s+$/, '')} language="python">
      {({ className: c, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={clases(c, 'overflow-x-auto rounded-xl py-3 text-[13px] leading-relaxed sm:text-sm', className)}
          style={{ ...style, margin: 0 }}
        >
          {tokens.map((line, i) => {
            const lp = getLineProps({ line });
            return (
              <div
                key={i}
                {...lp}
                className={clases(
                  lp.className,
                  'px-3',
                  lineaActiva === i && 'border-l-4 border-amber-400 bg-amber-400/15 pl-2',
                )}
              >
                {numeros && <span className="mr-3 inline-block w-4 text-right text-slate-500 select-none">{i + 1}</span>}
                {line.map((token, k) => (
                  <span key={k} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

/** Salida de consola (texto plano, monoespaciado) */
export function Consola({ texto, className }: { texto: string; className?: string }) {
  return (
    <pre
      className={clases(
        'overflow-x-auto rounded-xl bg-slate-900 px-3 py-2.5 font-mono text-[13px] leading-relaxed whitespace-pre text-emerald-300 sm:text-sm',
        className,
      )}
    >
      {texto}
    </pre>
  );
}
