import { useEffect, useRef, useState } from 'react';
import { CodeBlock, Consola } from '../components/CodeBlock';
import { PreguntaVista } from '../components/PreguntaVista';
import { BarraProgreso, Boton, ChipBloque, Explicacion, Tarjeta, Titulo, Trampa } from '../components/ui';
import { BLOQUES } from '../data/bloques';
import { EJERCICIOS } from '../data/ejercicios';
import { PREGUNTAS } from '../data/preguntas';
import type { BloqueId, EjercicioSalida, Pregunta } from '../data/tipos';
import { guardarSimulacro, registrarEjercicio, registrarPregunta, useProgreso } from '../lib/progreso';
import type { Ruta } from '../lib/ruta';
import { barajar, clases, compararSalida, fmt, mmss } from '../lib/util';

type Item = { tipo: 'pregunta'; p: Pregunta } | { tipo: 'salida'; e: EjercicioSalida };
type Respuesta = number | string | null;

const bloqueDe = (it: Item): BloqueId => (it.tipo === 'pregunta' ? it.p.bloque : it.e.bloque);
const idDe = (it: Item) => (it.tipo === 'pregunta' ? it.p.id : it.e.id);

/** ~20 % de «¿qué imprime?» y el resto preguntas de test repartidas entre los cuatro bloques */
function generarExamen(n: number): Item[] {
  const salidas = barajar(EJERCICIOS.filter((e): e is EjercicioSalida => e.tipo === 'salida'));
  const nSalida = Math.round(n * 0.2);
  const items: Item[] = salidas.slice(0, nSalida).map((e) => ({ tipo: 'salida', e }));
  const pools = barajar(BLOQUES.map((b) => barajar(PREGUNTAS.filter((q) => q.bloque === b.id))));
  let k = 0;
  while (items.length < n && pools.some((p) => p.length)) {
    const pool = pools[k++ % pools.length];
    const q = pool.pop();
    if (q) items.push({ tipo: 'pregunta', p: q });
  }
  return barajar(items);
}

function esCorrecta(it: Item, r: Respuesta): boolean {
  if (r === null || r === '') return false;
  if (it.tipo === 'pregunta') return r === it.p.correcta;
  return compararSalida(String(r), it.e.salida) !== 'distinta';
}

function ItemExamen({ it, r, onR, mostrar, numero }: { it: Item; r: Respuesta; onR: (r: Respuesta) => void; mostrar: boolean; numero: string }) {
  if (it.tipo === 'pregunta') {
    return <PreguntaVista p={it.p} elegida={typeof r === 'number' ? r : null} onElegir={onR} mostrar={mostrar} numero={numero} />;
  }
  const e = it.e;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ChipBloque bloque={e.bloque} />
        <span>¿Qué imprime?</span>
        <span className="ml-auto tabular-nums">{numero}</span>
      </div>
      <p className="text-[17px] leading-snug font-semibold">{e.enunciado}</p>
      <CodeBlock code={e.codigo} />
      <textarea
        value={typeof r === 'string' ? r : ''}
        onChange={(ev) => onR(ev.target.value)}
        disabled={mostrar}
        rows={Math.max(3, e.salida.split('\n').length + 1)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="Escribe la salida exacta…"
        className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-[15px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-80 dark:border-slate-700 dark:bg-slate-950"
      />
      {mostrar && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Salida correcta:</p>
          <Consola texto={e.salida} />
          <Explicacion>{e.explicacion}</Explicacion>
          {e.trampa && <Trampa>{e.trampa}</Trampa>}
        </div>
      )}
    </div>
  );
}

export default function Simulacro({ ruta }: { ruta: Ruta }) {
  const progreso = useProgreso();
  const rapido = ruta.query.get('rapido') === '1';
  const [n, setN] = useState(15);
  const [minutos, setMinutos] = useState(0);
  const [items, setItems] = useState<Item[] | null>(() => (rapido ? generarExamen(10) : null));
  const [resp, setResp] = useState<Respuesta[]>(() => (rapido ? Array(10).fill(null) : []));
  const [pos, setPos] = useState(0);
  const [corregido, setCorregido] = useState(false);
  const [restante, setRestante] = useState<number | null>(null);
  const inicio = useRef(Date.now());
  const [revisar, setRevisar] = useState<number | null>(null);

  const empezar = () => {
    const ex = generarExamen(n);
    setItems(ex);
    setResp(Array(ex.length).fill(null));
    setPos(0);
    setCorregido(false);
    setRestante(minutos ? minutos * 60 : null);
    inicio.current = Date.now();
  };

  const entregar = () => {
    if (!items || corregido) return;
    let aciertos = 0;
    const porBloque: Record<string, { aciertos: number; total: number }> = {};
    items.forEach((it, i) => {
      const ok = esCorrecta(it, resp[i]);
      if (ok) aciertos++;
      const b = bloqueDe(it);
      porBloque[b] = { aciertos: (porBloque[b]?.aciertos ?? 0) + (ok ? 1 : 0), total: (porBloque[b]?.total ?? 0) + 1 };
      if (it.tipo === 'pregunta') registrarPregunta(it.p.id, ok);
      else registrarEjercicio(it.e.id, ok);
    });
    guardarSimulacro({
      fecha: Date.now(),
      nota: Math.round((aciertos / items.length) * 100) / 10,
      aciertos,
      total: items.length,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      porBloque,
    });
    setCorregido(true);
    setRestante(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Temporizador: al llegar a 0 se entrega automáticamente
  const entregarRef = useRef(entregar);
  entregarRef.current = entregar;
  useEffect(() => {
    if (restante === null || corregido) return;
    if (restante <= 0) {
      entregarRef.current();
      return;
    }
    const t = setTimeout(() => setRestante((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restante, corregido]);

  // ───── Configuración ─────
  if (!items) {
    const ultimo = progreso.simulacros[0];
    return (
      <div>
        <Titulo sub="Examen aleatorio mezclando bloques. No verás si aciertas hasta entregar.">Simulacro</Titulo>
        <Tarjeta className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Número de preguntas</legend>
            <div className="flex gap-2">
              {[10, 15, 20].map((x) => (
                <Boton key={x} variante={n === x ? 'primario' : 'secundario'} onClick={() => setN(x)} className="flex-1">
                  {x}
                </Boton>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Temporizador</legend>
            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 20, 30].map((m) => (
                <Boton key={m} variante={minutos === m ? 'primario' : 'secundario'} onClick={() => setMinutos(m)}>
                  {m === 0 ? 'Sin' : `${m}′`}
                </Boton>
              ))}
            </div>
          </fieldset>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Incluye preguntas de test de los cuatro bloques y alrededor de un 20 % de ejercicios «¿qué imprime?». Nota final sobre 10.
            Las que falles se guardan en «Repasar mis fallos».
          </p>
          <Boton onClick={empezar} icono="simulacro" className="w-full min-h-12 text-base">
            Empezar simulacro
          </Boton>
        </Tarjeta>
        {progreso.simulacros.length > 0 && (
          <Tarjeta className="mt-4">
            <h2 className="mb-2 font-semibold">Historial</h2>
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {progreso.simulacros.slice(0, 8).map((s) => (
                <li key={s.fecha} className="flex justify-between py-1.5">
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(s.fecha).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
                    {s.aciertos}/{s.total} · {mmss(s.segundos)}
                  </span>
                  <b className={clases('tabular-nums', s.nota >= 5 ? 'text-emerald-600' : 'text-rose-600')}>{fmt(s.nota, 1)}</b>
                </li>
              ))}
            </ul>
            {ultimo && <p className="mt-2 text-xs text-slate-500">La nota se calcula como aciertos / total × 10.</p>}
          </Tarjeta>
        )}
      </div>
    );
  }

  const respondidas = resp.filter((r) => r !== null && r !== '').length;
  const it = items[pos];

  // ───── Resultado ─────
  if (corregido) {
    const aciertos = items.filter((x, i) => esCorrecta(x, resp[i])).length;
    const nota = (aciertos / items.length) * 10;
    return (
      <div className="space-y-4">
        <Titulo>Resultado del simulacro</Titulo>
        <Tarjeta className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nota</p>
          <p className={clases('text-6xl font-bold tabular-nums', nota >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {fmt(nota, 2)}
          </p>
          <p className="mt-1 text-sm">
            {aciertos} de {items.length} correctas · {mmss((Date.now() - inicio.current) / 1000)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-4">
            {BLOQUES.map((b) => {
              const sub = items.map((x, i) => ({ x, i })).filter(({ x }) => bloqueDe(x) === b.id);
              if (!sub.length) return null;
              const ok = sub.filter(({ x, i }) => esCorrecta(x, resp[i])).length;
              return (
                <div key={b.id} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60">
                  <p className={clases('text-xs font-semibold', b.texto)}>{b.corto}</p>
                  <p className="tabular-nums">
                    {ok}/{sub.length}
                  </p>
                  <BarraProgreso valor={(100 * ok) / sub.length} color={b.barra} className="mt-1" />
                </div>
              );
            })}
          </div>
        </Tarjeta>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Boton onClick={empezar} icono="reiniciar" className="flex-1">
            Otro simulacro
          </Boton>
          <Boton variante="secundario" onClick={() => setItems(null)} className="flex-1">
            Cambiar opciones
          </Boton>
        </div>

        <h2 className="pt-2 text-lg font-semibold">Revisión</h2>
        <div className="space-y-2">
          {items.map((x, i) => {
            const ok = esCorrecta(x, resp[i]);
            const abierto = revisar === i;
            const enunciado = x.tipo === 'pregunta' ? x.p.enunciado : `¿Qué imprime? · ${x.e.titulo}`;
            return (
              <Tarjeta key={idDe(x)} className="p-0">
                <button type="button" onClick={() => setRevisar(abierto ? null : i)} className="flex w-full items-start gap-3 p-3 text-left">
                  <span
                    className={clases(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white',
                      ok ? 'bg-emerald-500' : 'bg-rose-500',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm">{enunciado}</span>
                </button>
                {abierto && (
                  <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                    <ItemExamen it={x} r={resp[i]} onR={() => {}} mostrar numero={`${i + 1} / ${items.length}`} />
                  </div>
                )}
              </Tarjeta>
            );
          })}
        </div>
      </div>
    );
  }

  // ───── Examen en curso ─────
  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-4 space-y-2 border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            Simulacro · {respondidas}/{items.length} respondidas
          </span>
          {restante !== null && (
            <span className={clases('font-mono font-bold tabular-nums', restante < 60 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200')}>
              ⏱ {mmss(restante)}
            </span>
          )}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4">
          {items.map((x, i) => (
            <button
              key={idDe(x)}
              type="button"
              onClick={() => setPos(i)}
              className={clases(
                'h-8 min-w-8 shrink-0 rounded-md border text-xs font-semibold tabular-nums',
                i === pos && 'ring-2 ring-indigo-500',
                resp[i] !== null && resp[i] !== ''
                  ? 'border-indigo-400 bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200'
                  : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <Tarjeta>
        <ItemExamen
          key={idDe(it)}
          it={it}
          r={resp[pos]}
          onR={(r) => setResp((rs) => rs.map((x, i) => (i === pos ? r : x)))}
          mostrar={false}
          numero={`${pos + 1} / ${items.length}`}
        />
      </Tarjeta>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Boton variante="secundario" icono="izq" disabled={pos === 0} onClick={() => setPos(pos - 1)}>
          Anterior
        </Boton>
        {pos < items.length - 1 ? (
          <Boton variante="secundario" icono="der" onClick={() => setPos(pos + 1)}>
            Siguiente
          </Boton>
        ) : (
          <Boton
            variante="exito"
            icono="check"
            onClick={() => {
              const sin = items.length - respondidas;
              if (sin === 0 || window.confirm(`Te quedan ${sin} sin responder (contarán como fallo). ¿Entregar?`)) entregar();
            }}
          >
            Entregar
          </Boton>
        )}
      </div>
      {pos < items.length - 1 && (
        <Boton
          variante="fantasma"
          className="mt-3 w-full"
          onClick={() => {
            const sin = items.length - respondidas;
            if (sin === 0 || window.confirm(`Te quedan ${sin} sin responder (contarán como fallo). ¿Entregar?`)) entregar();
          }}
        >
          Entregar ahora
        </Boton>
      )}
    </div>
  );
}
