import { useState } from 'react';
import type { EjercicioSalida as T } from '../../data/tipos';
import { registrarEjercicio } from '../../lib/progreso';
import { clases, compararSalida } from '../../lib/util';
import { CodeBlock, Consola } from '../CodeBlock';
import { Boton, Explicacion, Resultado, Trampa } from '../ui';

/** «¿Qué imprime este código?»: el usuario escribe la salida y se compara con la real. */
export function EjercicioSalida({ e }: { e: T }) {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<'exacta' | 'espacios' | 'distinta' | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);

  const comprobar = () => {
    const r = compararSalida(texto, e.salida);
    setEstado(r);
    registrarEjercicio(e.id, r !== 'distinta');
  };

  const lineasUsuario = texto.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
  const lineasReales = e.salida.split('\n');

  return (
    <div className="space-y-3">
      <CodeBlock code={e.codigo} />
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Escribe la salida exacta (una línea por cada print):</span>
        <textarea
          value={texto}
          onChange={(ev) => {
            setTexto(ev.target.value);
            setEstado(null);
          }}
          rows={Math.max(3, lineasReales.length + 1)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder="Salida por pantalla…"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-[15px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Boton onClick={comprobar} disabled={!texto.trim()}>
          Comprobar
        </Boton>
        <Boton variante="secundario" icono="ojo" onClick={() => setVerSolucion(!verSolucion)}>
          {verSolucion ? 'Ocultar solución' : 'Ver solución explicada'}
        </Boton>
      </div>

      {estado === 'exacta' && <Resultado ok>¡Correcto! La salida coincide exactamente.</Resultado>}
      {estado === 'espacios' && (
        <Resultado ok>Correcto salvo espacios o comillas. Recuerda: Python imprime las cadenas dentro de listas con comillas simples.</Resultado>
      )}
      {estado === 'distinta' && (
        <div className="space-y-2">
          <Resultado ok={false}>No coincide. Compara línea a línea:</Resultado>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full font-mono text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-left font-sans text-xs text-slate-500 dark:bg-slate-800/60">
                  <th className="px-2 py-1">#</th>
                  <th className="px-2 py-1">Tu salida</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(lineasUsuario.length, lineasReales.length) }, (_, i) => {
                  const ok = (lineasUsuario[i] ?? '').trimEnd() === (lineasReales[i] ?? '');
                  return (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-2 py-1 text-slate-400">{i + 1}</td>
                      <td className={clases('px-2 py-1 whitespace-pre', ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                        {lineasUsuario[i] ?? '∅ (falta)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {verSolucion && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Salida real:</p>
          <Consola texto={e.salida} />
          <Explicacion>{e.explicacion}</Explicacion>
          {e.trampa && <Trampa>{e.trampa}</Trampa>}
        </div>
      )}
    </div>
  );
}
