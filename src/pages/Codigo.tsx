import { useState } from 'react';
import { BubbleSort } from '../components/BubbleSort';
import { Calculadora } from '../components/Calculadora';
import { EjercicioHueco } from '../components/codigo/EjercicioHueco';
import { EjercicioOrdenar } from '../components/codigo/EjercicioOrdenar';
import { EjercicioSalida } from '../components/codigo/EjercicioSalida';
import { Icono } from '../components/Icono';
import { RegexTester } from '../components/RegexTester';
import { Boton, ChipBloque, FiltroBloques, Pestanas, Tarjeta, Titulo, Vacio } from '../components/ui';
import { EJERCICIOS } from '../data/ejercicios';
import type { BloqueId, Ejercicio } from '../data/tipos';
import { useProgreso } from '../lib/progreso';
import { ir, type Ruta } from '../lib/ruta';
import { clases } from '../lib/util';

type Sub = 'ejercicios' | 'bubble' | 'estadistica' | 'regex';
type TipoFiltro = 'todos' | Ejercicio['tipo'];

const NOMBRE_TIPO: Record<Ejercicio['tipo'], string> = {
  salida: '¿Qué imprime?',
  hueco: 'Completa el hueco',
  ordenar: 'Ordena las líneas',
};

function Ejercicios({ soloFallos: soloFallosInicial }: { soloFallos: boolean }) {
  const progreso = useProgreso();
  const [tipo, setTipo] = useState<TipoFiltro>('todos');
  const [bloque, setBloque] = useState<BloqueId | 'todos'>('todos');
  const [soloFallos, setSoloFallos] = useState(soloFallosInicial);
  const [idActual, setIdActual] = useState<string | null>(null);

  // La lista se fija al cambiar los filtros: así un fallo que resuelves no desaparece de golpe
  const calcular = (t: TipoFiltro, b: BloqueId | 'todos', f: boolean) =>
    EJERCICIOS.filter(
      (e) => (t === 'todos' || e.tipo === t) && (b === 'todos' || e.bloque === b) && (!f || progreso.ejercicios[e.id]?.ultimo === 'fail'),
    ).map((e) => e.id);
  const [ids, setIds] = useState<string[]>(() => calcular(tipo, bloque, soloFallos));
  const refiltrar = (t: TipoFiltro, b: BloqueId | 'todos', f: boolean) => {
    setTipo(t);
    setBloque(b);
    setSoloFallos(f);
    setIds(calcular(t, b, f));
    setIdActual(null);
  };

  const lista = ids.map((id) => EJERCICIOS.find((e) => e.id === id)!);
  const pos = Math.max(0, lista.findIndex((e) => e.id === idActual));
  const actual = lista[pos];
  const resueltos = lista.filter((e) => progreso.ejercicios[e.id]?.ultimo === 'ok').length;

  const irA = (i: number) => {
    setIdActual(lista[i]?.id ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3">
      <Pestanas<TipoFiltro>
        valor={tipo}
        onCambio={(t) => refiltrar(t, bloque, soloFallos)}
        opciones={[
          { id: 'todos', nombre: 'Todos' },
          { id: 'salida', nombre: '¿Qué imprime?' },
          { id: 'hueco', nombre: 'Huecos' },
          { id: 'ordenar', nombre: 'Ordenar' },
        ]}
      />
      <FiltroBloques
        valor={bloque}
        onCambio={(b) => refiltrar(tipo, b, soloFallos)}
      />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={soloFallos}
            onChange={(e) => refiltrar(tipo, bloque, e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          Solo los que fallé
        </label>
        <span className="text-slate-600 dark:text-slate-400">
          Resueltos <b className="tabular-nums">{resueltos}</b>/{lista.length}
        </span>
      </div>

      {lista.length === 0 ? (
        <Vacio>{soloFallos ? '¡No tienes ejercicios fallados con este filtro!' : 'No hay ejercicios con este filtro.'}</Vacio>
      ) : (
        <>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {lista.map((e, i) => {
              const r = progreso.ejercicios[e.id]?.ultimo;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => irA(i)}
                  title={e.titulo}
                  aria-current={i === pos}
                  className={clases(
                    'h-9 min-w-9 shrink-0 rounded-lg border text-sm font-semibold tabular-nums',
                    i === pos && 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-950',
                    r === 'ok' && 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
                    r === 'fail' && 'border-rose-400 bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
                    !r && 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {actual && (
            <Tarjeta className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ChipBloque bloque={actual.bloque} />
                <span className="font-semibold">{NOMBRE_TIPO[actual.tipo]}</span>
                <span className="ml-auto tabular-nums">
                  {pos + 1} / {lista.length}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{actual.titulo}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{actual.enunciado}</p>
              </div>
              {actual.tipo === 'salida' && <EjercicioSalida key={actual.id} e={actual} />}
              {actual.tipo === 'hueco' && <EjercicioHueco key={actual.id} e={actual} />}
              {actual.tipo === 'ordenar' && <EjercicioOrdenar key={actual.id} e={actual} />}
            </Tarjeta>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Boton variante="secundario" icono="izq" disabled={pos === 0} onClick={() => irA(pos - 1)}>
              Anterior
            </Boton>
            <Boton variante="secundario" disabled={pos >= lista.length - 1} onClick={() => irA(pos + 1)}>
              Siguiente <Icono nombre="der" className="h-4 w-4" />
            </Boton>
          </div>
        </>
      )}
    </div>
  );
}

export default function Codigo({ ruta }: { ruta: Ruta }) {
  const sub: Sub = (['bubble', 'estadistica', 'regex'] as const).find((s) => s === ruta.partes[1]) ?? 'ejercicios';

  return (
    <div>
      <Titulo sub="El examen se escribe a mano: practica leyendo y escribiendo código sin ejecutarlo.">Código</Titulo>
      <div className="mb-4">
        <Pestanas<Sub>
          valor={sub}
          onCambio={(s) => ir(s === 'ejercicios' ? '/codigo' : `/codigo/${s}`)}
          opciones={[
            { id: 'ejercicios', nombre: 'Ejercicios' },
            { id: 'bubble', nombre: 'Bubble Sort' },
            { id: 'estadistica', nombre: 'Estadística' },
            { id: 'regex', nombre: 'Regex' },
          ]}
        />
      </div>
      {sub === 'ejercicios' && <Ejercicios soloFallos={ruta.query.get('modo') === 'fallos'} />}
      {sub === 'bubble' && <BubbleSort />}
      {sub === 'estadistica' && <Calculadora />}
      {sub === 'regex' && <RegexTester />}
    </div>
  );
}
