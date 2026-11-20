import { useMemo, useState } from 'react';
import { PreguntaVista } from '../components/PreguntaVista';
import { BarraProgreso, Boton, FiltroBloques, Pestanas, Tarjeta, Titulo, Vacio } from '../components/ui';
import { PREGUNTAS } from '../data/preguntas';
import type { BloqueId } from '../data/tipos';
import { ejerciciosFallados } from '../lib/dominio';
import { registrarPregunta, useProgreso, type Progreso } from '../lib/progreso';
import type { Ruta } from '../lib/ruta';
import { barajar, clases } from '../lib/util';

type Modo = 'todas' | 'fallos' | 'nuevas';

function seleccionar(bloque: BloqueId | 'todos', modo: Modo, p: Progreso): string[] {
  return barajar(
    PREGUNTAS.filter((q) => bloque === 'todos' || q.bloque === bloque)
      .filter((q) => {
        if (modo === 'fallos') return p.preguntas[q.id]?.ultimo === 'fail';
        if (modo === 'nuevas') return !p.preguntas[q.id];
        return true;
      })
      .map((q) => q.id),
  );
}

export default function Test({ ruta }: { ruta: Ruta }) {
  const progreso = useProgreso();
  const [bloque, setBloque] = useState<BloqueId | 'todos'>((ruta.query.get('bloque') as BloqueId | null) ?? 'todos');
  const [modo, setModo] = useState<Modo>((ruta.query.get('modo') as Modo | null) ?? 'todas');
  const [lista, setLista] = useState<string[]>(() => seleccionar(bloque, modo, progreso));
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [resultados, setResultados] = useState<Record<string, boolean>>({});

  const empezar = (b: BloqueId | 'todos', m: Modo, ids?: string[]) => {
    setLista(ids ?? seleccionar(b, m, progreso));
    setIdx(0);
    setElegida(null);
    setRespondida(false);
    setResultados({});
  };

  const conteos = useMemo(() => {
    const r: Partial<Record<BloqueId | 'todos', number>> = {};
    for (const q of PREGUNTAS) {
      const pasa = modo === 'fallos' ? progreso.preguntas[q.id]?.ultimo === 'fail' : modo === 'nuevas' ? !progreso.preguntas[q.id] : true;
      if (!pasa) continue;
      r.todos = (r.todos ?? 0) + 1;
      r[q.bloque] = (r[q.bloque] ?? 0) + 1;
    }
    return r;
    // Se recalculan al cambiar de modo o al empezar una ronda (no en cada respuesta)
  }, [modo, lista]);

  const actual = PREGUNTAS.find((q) => q.id === lista[idx]);
  const terminado = lista.length > 0 && idx >= lista.length;
  const aciertos = Object.values(resultados).filter(Boolean).length;
  const falladasRonda = Object.entries(resultados)
    .filter(([, ok]) => !ok)
    .map(([id]) => id);
  const codigoFallado = ejerciciosFallados(progreso).length;

  const comprobar = () => {
    if (!actual || elegida === null) return;
    const ok = elegida === actual.correcta;
    registrarPregunta(actual.id, ok);
    setResultados((r) => ({ ...r, [actual.id]: ok }));
    setRespondida(true);
  };

  const siguiente = () => {
    setIdx((i) => i + 1);
    setElegida(null);
    setRespondida(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Titulo sub="Preguntas tipo examen con explicación tras responder. Las falladas se guardan para repasar.">Test</Titulo>

      <div className="space-y-3">
        <Pestanas<Modo>
          valor={modo}
          onCambio={(m) => {
            setModo(m);
            empezar(bloque, m);
          }}
          opciones={[
            { id: 'todas', nombre: 'Todas' },
            { id: 'fallos', nombre: 'Mis fallos' },
            { id: 'nuevas', nombre: 'Sin responder' },
          ]}
        />
        <FiltroBloques
          valor={bloque}
          conteos={conteos}
          onCambio={(b) => {
            setBloque(b);
            empezar(b, modo);
          }}
        />
      </div>

      <div className="mt-4">
        {lista.length === 0 ? (
          <Vacio>
            {modo === 'fallos' ? (
              <>
                <p className="font-semibold">¡No tienes preguntas falladas pendientes en este filtro!</p>
                {codigoFallado > 0 && (
                  <p className="mt-2">
                    Tienes {codigoFallado} ejercicio{codigoFallado > 1 ? 's' : ''} de código fallado{codigoFallado > 1 ? 's' : ''}:{' '}
                    <a className="font-semibold text-indigo-600 underline dark:text-indigo-400" href="#/codigo?modo=fallos">
                      repasarlos
                    </a>
                  </p>
                )}
              </>
            ) : modo === 'nuevas' ? (
              'Ya has respondido todas las preguntas de este filtro.'
            ) : (
              'No hay preguntas para este filtro.'
            )}
          </Vacio>
        ) : terminado ? (
          <Tarjeta className="space-y-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Ronda terminada</p>
            <p
              className={clases(
                'text-4xl font-bold tabular-nums',
                aciertos / lista.length >= 0.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {aciertos}/{lista.length}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {falladasRonda.length > 0 && (
                <Boton variante="peligro" icono="reiniciar" onClick={() => empezar(bloque, modo, barajar(falladasRonda))}>
                  Repetir las {falladasRonda.length} falladas
                </Boton>
              )}
              <Boton variante="secundario" onClick={() => empezar(bloque, modo)}>
                Nueva ronda
              </Boton>
            </div>
            {codigoFallado > 0 && modo === 'fallos' && (
              <p className="text-sm">
                También tienes {codigoFallado} ejercicio{codigoFallado > 1 ? 's' : ''} de código pendiente{codigoFallado > 1 ? 's' : ''}:{' '}
                <a className="font-semibold text-indigo-600 underline dark:text-indigo-400" href="#/codigo?modo=fallos">
                  ir a Código
                </a>
              </p>
            )}
          </Tarjeta>
        ) : (
          actual && (
            <>
              <div className="mb-3 flex items-center gap-3">
                <BarraProgreso valor={(100 * idx) / lista.length} />
                <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  ✓ {aciertos} · ✗ {Object.keys(resultados).length - aciertos}
                </span>
              </div>
              <Tarjeta>
                <PreguntaVista
                  key={actual.id}
                  p={actual}
                  elegida={elegida}
                  onElegir={setElegida}
                  mostrar={respondida}
                  numero={`${idx + 1} / ${lista.length}`}
                />
              </Tarjeta>
              <div className="sticky bottom-20 z-10 mt-4 md:bottom-4">
                {respondida ? (
                  <Boton className="w-full min-h-12" onClick={siguiente} icono="der">
                    {idx + 1 < lista.length ? 'Siguiente' : 'Ver resultado'}
                  </Boton>
                ) : (
                  <Boton className="w-full min-h-12" onClick={comprobar} disabled={elegida === null}>
                    Comprobar
                  </Boton>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
