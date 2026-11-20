import { useMemo, useState, type ReactNode } from 'react';
import { CONJUNTOS } from '../data/alumnos';
import { acumulado, cuartiles, dictPython, dispersion, mediana, moda, ordenar, suma, type InfoCuartiles } from '../lib/estadistica';
import { clases, fmt, leerNumero, pyFloat } from '../lib/util';
import { CodeBlock } from './CodeBlock';
import { Icono } from './Icono';
import { Boton, Explicacion, Resultado, Tarjeta, Trampa } from './ui';

const lista = (v: number[]) => `[${v.join(', ')}]`;

interface Pide {
  etiqueta: string;
  valor: number | number[];
}

/** Un paso del cálculo. En modo práctica se oculta el desarrollo hasta que lo intentas o lo pides. */
function Paso({
  numero,
  titulo,
  pregunta,
  pide,
  practica,
  children,
}: {
  numero: number;
  titulo: string;
  pregunta: string;
  pide: Pide[];
  practica: boolean;
  children: ReactNode;
}) {
  const [valores, setValores] = useState<string[]>(() => pide.map(() => ''));
  const [res, setRes] = useState<boolean[] | null>(null);
  const [ver, setVer] = useState(false);

  const comprobar = () => {
    setRes(
      pide.map((p, i) => {
        if (Array.isArray(p.valor)) {
          const escritos = valores[i]
            .split(/[\s;,]+/)
            .map(leerNumero)
            .filter((x): x is number => x !== null)
            .sort((a, b) => a - b);
          const esperados = [...p.valor].sort((a, b) => a - b);
          return escritos.length === esperados.length && escritos.every((x, k) => Math.abs(x - esperados[k]) < 0.01);
        }
        const x = leerNumero(valores[i]);
        return x !== null && Math.abs(x - p.valor) <= 0.011;
      }),
    );
  };

  const mostrar = !practica || ver;

  return (
    <Tarjeta className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{numero}</span>
        <h3 className="font-semibold">{titulo}</h3>
      </div>
      {practica && (
        <div className="space-y-2">
          <p className="text-[15px]">{pregunta}</p>
          <div className="flex flex-wrap items-end gap-2">
            {pide.map((p, i) => (
              <label key={p.etiqueta} className="text-sm">
                <span className="mb-0.5 block text-xs text-slate-500 dark:text-slate-400">{p.etiqueta}</span>
                <input
                  inputMode="decimal"
                  value={valores[i]}
                  onChange={(e) => {
                    const v = [...valores];
                    v[i] = e.target.value;
                    setValores(v);
                    setRes(null);
                  }}
                  className={clases(
                    'h-11 w-28 rounded-xl border bg-white px-3 font-mono text-[16px] outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-slate-950',
                    res?.[i] === true && 'border-emerald-500',
                    res?.[i] === false && 'border-rose-500',
                    !res && 'border-slate-300 dark:border-slate-700',
                  )}
                />
              </label>
            ))}
            <Boton onClick={comprobar} disabled={valores.every((v) => !v.trim())}>
              Comprobar
            </Boton>
            <Boton variante="secundario" icono="ojo" onClick={() => setVer(!ver)}>
              {ver ? 'Ocultar' : 'Ver desarrollo'}
            </Boton>
          </div>
          {res && <Resultado ok={res.every(Boolean)}>{res.every(Boolean) ? '¡Correcto!' : 'Revisa los valores marcados en rojo.'}</Resultado>}
        </div>
      )}
      {mostrar && <div className="space-y-3">{children}</div>}
    </Tarjeta>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-[13px] break-words sm:text-sm dark:bg-slate-800">{children}</p>;
}

/** Boxplot sencillo en SVG */
function Boxplot({ datos, c }: { datos: number[]; c: InfoCuartiles }) {
  const min = Math.min(...datos);
  const max = Math.max(...datos, c.limiteSup);
  const W = 340;
  const pad = 16;
  const x = (v: number) => pad + ((v - min) / (max - min || 1)) * (W - 2 * pad);
  const med = mediana(ordenar(datos)).valor;
  const valoresMarca = Array.from(new Set([c.bigoteInf, c.q1, med, c.q3, c.bigoteSup, c.limiteSup, ...c.atipicos])).sort((a, b) => a - b);
  // Escalona las etiquetas que quedarían pegadas
  let abajo = false;
  const marcas = valoresMarca.map((m, i) => {
    abajo = i > 0 && x(m) - x(valoresMarca[i - 1]) < 16 ? !abajo : false;
    return { m, y: abajo ? 117 : 108 };
  });
  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full max-w-xl" role="img" aria-label="Diagrama de caja y bigotes">
      <line x1={x(c.limiteSup)} x2={x(c.limiteSup)} y1={10} y2={86} className="stroke-rose-400" strokeDasharray="4 4" strokeWidth={1.5} />
      <text x={x(c.limiteSup)} y={10} textAnchor="middle" className="fill-rose-500 text-[10px]">
        límite {fmt(c.limiteSup)}
      </text>
      <line x1={x(c.bigoteInf)} x2={x(c.q1)} y1={50} y2={50} className="stroke-slate-500" strokeWidth={2} />
      <line x1={x(c.q3)} x2={x(c.bigoteSup)} y1={50} y2={50} className="stroke-slate-500" strokeWidth={2} />
      <line x1={x(c.bigoteInf)} x2={x(c.bigoteInf)} y1={38} y2={62} className="stroke-slate-500" strokeWidth={2} />
      <line x1={x(c.bigoteSup)} x2={x(c.bigoteSup)} y1={38} y2={62} className="stroke-slate-500" strokeWidth={2} />
      <rect x={x(c.q1)} y={28} width={Math.max(1, x(c.q3) - x(c.q1))} height={44} rx={4} className="fill-indigo-200 stroke-indigo-600 dark:fill-indigo-500/30" strokeWidth={2} />
      <line x1={x(med)} x2={x(med)} y1={28} y2={72} className="stroke-indigo-800 dark:stroke-indigo-200" strokeWidth={3} />
      {c.atipicos.map((a, i) => (
        <circle key={i} cx={x(a)} cy={50} r={6} className="fill-rose-500" />
      ))}
      <line x1={pad} x2={W - pad} y1={96} y2={96} className="stroke-slate-300 dark:stroke-slate-700" />
      {marcas.map(({ m, y }) => (
        <text key={m} x={x(m)} y={y} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {fmt(m)}
        </text>
      ))}
    </svg>
  );
}

export function Calculadora() {
  const [conjuntoId, setConjuntoId] = useState(CONJUNTOS[0].id);
  const [personal, setPersonal] = useState('4 6 6 8 10 12 14 36');
  const [practica, setPractica] = useState(true);

  const conjunto = CONJUNTOS.find((c) => c.id === conjuntoId);
  const datos = useMemo(() => {
    if (conjunto) return conjunto.valores;
    return personal
      .split(/[\s;,]+/)
      .map(leerNumero)
      .filter((x): x is number => x !== null);
  }, [conjunto, personal]);
  const etiquetas = conjunto?.etiquetas;

  const n = datos.length;
  const valido = n >= 2;
  const total = suma(datos);
  const media = total / n;
  const ord = ordenar(datos);
  const med = mediana(ord);
  const mo = moda(datos);
  const disp = dispersion(datos);
  const cua = cuartiles(ord);
  const [r0, r1] = disp.raizEntre;
  const clave = `${conjuntoId}-${datos.join(',')}-${practica}`;

  return (
    <div className="space-y-4">
      <Tarjeta className="space-y-3">
        <p className="text-sm font-semibold">Datos del examen</p>
        <div className="flex flex-wrap gap-2">
          {CONJUNTOS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setConjuntoId(c.id)}
              className={clases(
                'rounded-full border px-3 py-1.5 text-sm',
                c.id === conjuntoId
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              {c.nombre}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setConjuntoId('personal')}
            className={clases(
              'rounded-full border px-3 py-1.5 text-sm',
              conjuntoId === 'personal' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
            )}
          >
            Mis datos
          </button>
        </div>
        {conjunto ? (
          <div className="text-sm">
            <p className="text-slate-600 dark:text-slate-400">{conjunto.descripcion}</p>
            <p className="mt-1 font-mono">datos = {lista(datos)}</p>
          </div>
        ) : (
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Separa con espacios o «;» (decimales con punto):</span>
            <input
              value={personal}
              onChange={(e) => setPersonal(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-[16px] dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={practica} onChange={(e) => setPractica(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
          Modo práctica: calcula tú primero (se oculta el desarrollo)
        </label>
      </Tarjeta>

      {!valido ? (
        <Tarjeta>Introduce al menos dos números.</Tarjeta>
      ) : (
        <div key={clave} className="space-y-4">
          <Paso numero={1} titulo="Media con acumulador" pregunta={`Calcula la media de los ${n} valores.`} pide={[{ etiqueta: 'Media', valor: media }]} practica={practica}>
            <CodeBlock code={`suma_total = 0\nfor valor in datos:\n    suma_total += valor\nmedia = suma_total / len(datos)`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left dark:border-slate-700">
                    <th className="px-2 py-1">Vuelta</th>
                    {etiquetas && <th className="px-2 py-1">Dato</th>}
                    <th className="px-2 py-1 text-right">valor</th>
                    <th className="px-2 py-1 text-right">suma_total</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {acumulado(datos).map((f, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-2 py-1">{i + 1}</td>
                      {etiquetas && <td className="px-2 py-1">{etiquetas[i]}</td>}
                      <td className="px-2 py-1 text-right">{fmt(f.valor)}</td>
                      <td className="px-2 py-1 text-right font-semibold">{fmt(f.suma)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Formula>
              media = {fmt(total)} / {n} = <b>{fmt(media)}</b> → Python imprime {pyFloat(media)}
            </Formula>
          </Paso>

          <Paso
            numero={2}
            titulo="Mediana (par/impar con % y //)"
            pregunta="Ordena los datos y calcula la mediana."
            pide={[{ etiqueta: 'Mediana', valor: med.valor }]}
            practica={practica}
          >
            <Formula>ordenados = {lista(ord)}</Formula>
            <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
              {ord.map((v, i) => (
                <div
                  key={i}
                  className={clases(
                    'rounded-lg border p-1 text-center',
                    med.indices.includes(i) ? 'border-indigo-500 bg-indigo-100 font-bold dark:bg-indigo-500/20' : 'border-slate-200 dark:border-slate-700',
                  )}
                >
                  <div className="tabular-nums">{fmt(v)}</div>
                  <div className="font-mono text-[10px] text-slate-500">[{i}]</div>
                </div>
              ))}
            </div>
            <Formula>
              n = {n} → n % 2 = {med.resto} → {med.par ? 'PAR' : 'IMPAR'} · n // 2 = {med.mitad}
            </Formula>
            {med.par ? (
              <Formula>
                (datos[{med.mitad} - 1] + datos[{med.mitad}]) / 2 = (datos[{med.indices[0]}] + datos[{med.indices[1]}]) / 2 = ({fmt(med.valores[0])} +{' '}
                {fmt(med.valores[1])}) / 2 = <b>{fmt(med.valor)}</b>
              </Formula>
            ) : (
              <Formula>
                datos[n // 2] = datos[{med.mitad}] = <b>{fmt(med.valor)}</b>
              </Formula>
            )}
            <Trampa>Hay que ordenar ANTES (en el examen, con Bubble Sort). Y el índice se calcula con //: n / 2 da un float.</Trampa>
          </Paso>

          <Paso
            numero={3}
            titulo="Moda con diccionario de frecuencias"
            pregunta="¿Cuál es la moda? (si hay varias, sepáralas con espacios)"
            pide={[{ etiqueta: 'Moda(s)', valor: mo.modas }]}
            practica={practica}
          >
            <div className="space-y-1">
              {mo.frecuencias.map(([v, c]) => (
                <div key={v} className="flex items-center gap-2 text-sm">
                  <span className="w-12 text-right font-mono tabular-nums">{fmt(v)}</span>
                  <div className="h-5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                    <div
                      className={clases('h-full rounded', c === mo.maxFrecuencia ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600')}
                      style={{ width: `${(100 * c) / mo.maxFrecuencia}%` }}
                    />
                  </div>
                  <span className="w-6 font-mono tabular-nums">{c}</span>
                </div>
              ))}
            </div>
            <Formula>frecuencias = {dictPython(mo.frecuencias)}</Formula>
            <Formula>
              max(frecuencias.values()) = {mo.maxFrecuencia} → modas = <b>{lista(mo.modas)}</b>
            </Formula>
            {mo.sinModa ? (
              <Explicacion titulo="Sin moda">
                Todos los valores aparecen una vez: el código devolvería todos en la lista, pero en estadística se dice que no hay moda.
              </Explicacion>
            ) : (
              mo.modas.length > 1 && <Explicacion titulo="Varias modas">Hay empate en la frecuencia máxima: por eso se guarda una lista.</Explicacion>
            )}
            <Trampa>max(frecuencias) devolvería la CLAVE mayor ({fmt(Math.max(...mo.frecuencias.map(([k]) => k)))}), no la frecuencia mayor.</Trampa>
          </Paso>

          <Paso
            numero={4}
            titulo="Desviaciones y varianza poblacional (÷ n)"
            pregunta="Calcula la suma de las desviaciones al cuadrado y la varianza (÷ n)."
            pide={[
              { etiqueta: 'Suma cuadrados', valor: disp.sumaCuadrados },
              { etiqueta: 'Varianza', valor: disp.varianza },
            ]}
            practica={practica}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left dark:border-slate-700">
                    {etiquetas && <th className="px-2 py-1">Dato</th>}
                    <th className="px-2 py-1 text-right">x</th>
                    <th className="px-2 py-1 text-right">x − {fmt(disp.media)}</th>
                    <th className="px-2 py-1 text-right">(x − media)²</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {disp.filas.map((f, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      {etiquetas && <td className="px-2 py-1">{etiquetas[i]}</td>}
                      <td className="px-2 py-1 text-right">{fmt(f.valor)}</td>
                      <td className={clases('px-2 py-1 text-right', f.desviacion < 0 && 'text-rose-600 dark:text-rose-400')}>{fmt(f.desviacion)}</td>
                      <td className="px-2 py-1 text-right">{fmt(f.cuadrado)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    {etiquetas && <td className="px-2 py-1">Suma</td>}
                    <td className="px-2 py-1 text-right">{fmt(total)}</td>
                    <td className="px-2 py-1 text-right">{fmt(suma(disp.filas.map((f) => f.desviacion)))}</td>
                    <td className="px-2 py-1 text-right">{fmt(disp.sumaCuadrados)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Formula>
              varianza = {fmt(disp.sumaCuadrados)} / {n} = <b>{fmt(disp.varianza)}</b>
            </Formula>
            <Explicacion titulo="Comprobación">
              Las desviaciones siempre suman 0. Si no te sale 0, hay un error de cuentas. Con ÷ (n − 1) (varianza muestral) saldría{' '}
              {fmt(disp.varianzaMuestral)}; el examen pide ÷ n.
            </Explicacion>
          </Paso>

          <Paso
            numero={5}
            titulo="Desviación estándar = varianza ** 0.5"
            pregunta="Estima la raíz cuadrada de la varianza (2 decimales)."
            pide={[{ etiqueta: 'Desv. estándar', valor: Math.round(disp.desviacion * 100) / 100 }]}
            practica={practica}
          >
            <Formula>
              desviacion_estandar = {fmt(disp.varianza)} ** 0.5 = <b>{fmt(disp.desviacion)}</b> (Python: {pyFloat(disp.desviacion)})
            </Formula>
            <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
              <p className="mb-1 flex items-center gap-1 font-semibold">
                <Icono nombre="bombilla" className="h-4 w-4" /> Sin calculadora
              </p>
              {Number.isInteger(disp.desviacion) ? (
                <p>
                  {fmt(disp.varianza)} es un cuadrado perfecto: {disp.desviacion}² = {fmt(disp.varianza)}.
                </p>
              ) : (
                <>
                  <p>
                    {r0}² = {r0 * r0} y {r1}² = {r1 * r1} → √{fmt(disp.varianza)} está entre {r0} y {r1}.
                  </p>
                  <p className="mt-1">
                    Aproximación lineal: {r0} + ({fmt(disp.varianza)} − {r0 * r0}) / ({r1 * r1} − {r0 * r0}) = {r0} + {fmt(disp.varianza - r0 * r0)}/
                    {r1 * r1 - r0 * r0} ≈ <b>{fmt(r0 + (disp.varianza - r0 * r0) / (r1 * r1 - r0 * r0))}</b>
                  </p>
                </>
              )}
            </div>
            <Trampa>En Python la potencia es **. varianza ^ 0.5 da TypeError.</Trampa>
          </Paso>

          {cua && (
            <Paso
              numero={6}
              titulo="Cuartiles, IQR y atípicos (EDA)"
              pregunta="Calcula Q1, Q3 (mediana de cada mitad) y el límite superior Q3 + 1,5·IQR."
              pide={[
                { etiqueta: 'Q1', valor: cua.q1 },
                { etiqueta: 'Q3', valor: cua.q3 },
                { etiqueta: 'Límite sup.', valor: cua.limiteSup },
              ]}
              practica={practica}
            >
              <Formula>
                mitad inferior = {lista(cua.inferior)} → Q1 = <b>{fmt(cua.q1)}</b>
              </Formula>
              <Formula>
                mitad superior = {lista(cua.superior)} → Q3 = <b>{fmt(cua.q3)}</b>
              </Formula>
              <Formula>
                IQR = Q3 − Q1 = {fmt(cua.q3)} − {fmt(cua.q1)} = <b>{fmt(cua.iqr)}</b>
              </Formula>
              <Formula>
                límites: {fmt(cua.q1)} − 1,5·{fmt(cua.iqr)} = <b>{fmt(cua.limiteInf)}</b> · {fmt(cua.q3)} + 1,5·{fmt(cua.iqr)} = <b>{fmt(cua.limiteSup)}</b>
              </Formula>
              <Formula>
                atípicos: {cua.atipicos.length ? lista(cua.atipicos) : 'ninguno'} · bigotes: {fmt(cua.bigoteInf)} y {fmt(cua.bigoteSup)}
              </Formula>
              <Boxplot datos={datos} c={cua} />
              <Explicacion titulo="Límite vs bigote">
                El límite ({fmt(cua.limiteSup)}) es un umbral calculado; el bigote termina en el mayor valor observado que no lo supera (
                {fmt(cua.bigoteSup)}). Método de las mitades (el del Caso 2); otras herramientas interpolan y pueden dar cuartiles algo distintos.
              </Explicacion>
            </Paso>
          )}

          {conjunto && (
            <Resultado ok>
              Resumen para el examen: {conjunto.foco}
            </Resultado>
          )}
        </div>
      )}
    </div>
  );
}
