// Simulación aproximada del módulo `re` de Python usando RegExp de JavaScript.
// Devuelve los resultados con el formato con el que Python los imprimiría.

export interface FlagsPy {
  IGNORECASE: boolean;
  MULTILINE: boolean;
  DOTALL: boolean;
}

export class Tupla {
  constructor(public items: (string | null)[]) {}
}

type ValorPy = string | null | number | Tupla | ValorPy[];

/** repr() de Python para cadenas: comillas simples salvo que el texto contenga ' y no " */
export function pyStr(s: string): string {
  const comilla = s.includes("'") && !s.includes('"') ? '"' : "'";
  let r = '';
  for (const c of s) {
    if (c === '\\') r += '\\\\';
    else if (c === comilla) r += '\\' + c;
    else if (c === '\n') r += '\\n';
    else if (c === '\t') r += '\\t';
    else if (c === '\r') r += '\\r';
    else r += c;
  }
  return comilla + r + comilla;
}

export function pyRepr(v: ValorPy): string {
  if (v === null || v === undefined) return 'None';
  if (typeof v === 'string') return pyStr(v);
  if (typeof v === 'number') return String(v);
  if (v instanceof Tupla) {
    const partes = v.items.map((x) => pyRepr(x));
    return partes.length === 1 ? `(${partes[0]},)` : `(${partes.join(', ')})`;
  }
  return `[${v.map((x) => pyRepr(x)).join(', ')}]`;
}

export interface ConversionPatron {
  js: string;
  flagsExtra: Partial<FlagsPy>;
  avisos: string[];
}

/** Traduce la sintaxis propia de Python a la de JavaScript cuando es posible */
export function convertirPatron(patron: string): ConversionPatron {
  const avisos: string[] = [];
  const flagsExtra: Partial<FlagsPy> = {};
  let js = patron;

  // Flags en línea al principio: (?i), (?m), (?s), (?ims)…
  const inline = js.match(/^\(\?([aiLmsux]+)\)/);
  if (inline) {
    if (inline[1].includes('i')) flagsExtra.IGNORECASE = true;
    if (inline[1].includes('m')) flagsExtra.MULTILINE = true;
    if (inline[1].includes('s')) flagsExtra.DOTALL = true;
    js = js.slice(inline[0].length);
    avisos.push(`Flags en línea «${inline[0]}» convertidas a opciones.`);
  }
  if (js.includes('(?P<')) {
    js = js.replace(/\(\?P</g, '(?<');
    avisos.push('Grupo con nombre (?P<nombre>…) convertido a la sintaxis de JS (?<nombre>…).');
  }
  if (/\(\?P=\w+\)/.test(js)) {
    js = js.replace(/\(\?P=(\w+)\)/g, '\\k<$1>');
    avisos.push('Referencia (?P=nombre) convertida a \\k<nombre>.');
  }
  if (js.includes('\\A')) {
    js = js.replace(/\\A/g, '(?<![\\s\\S])');
    avisos.push('\\A (inicio absoluto) simulado.');
  }
  if (js.includes('\\Z')) {
    js = js.replace(/\\Z/g, '(?![\\s\\S])');
    avisos.push('\\Z (final absoluto) simulado.');
  }
  if (/\{,\d+\}/.test(js)) {
    avisos.push('Python 3.11+ acepta {,n} (de 0 a n); en JS se lee como texto literal. Escribe {0,n}.');
  }
  return { js, flagsExtra, avisos };
}

function flagsJs(f: FlagsPy): string {
  return (f.IGNORECASE ? 'i' : '') + (f.MULTILINE ? 'm' : '') + (f.DOTALL ? 's' : '');
}

export interface InfoMatch {
  repr: string;
  group: string;
  start: number;
  end: number;
  grupos: { indice: string; valor: string | null; span: [number, number] | null }[];
}

function infoDe(m: RegExpExecArray): InfoMatch {
  const start = m.index;
  const end = m.index + m[0].length;
  const grupos: InfoMatch['grupos'] = [];
  const indices = (m as RegExpExecArray & { indices?: ([number, number] | undefined)[] }).indices;
  for (let g = 1; g < m.length; g++) {
    const sp = indices?.[g];
    grupos.push({ indice: String(g), valor: m[g] ?? null, span: sp ? [sp[0], sp[1]] : null });
  }
  if (m.groups) {
    for (const [nombre, valor] of Object.entries(m.groups)) {
      grupos.push({ indice: `'${nombre}'`, valor: valor ?? null, span: null });
    }
  }
  return {
    repr: `<re.Match object; span=(${start}, ${end}), match=${pyStr(m[0])}>`,
    group: m[0],
    start,
    end,
    grupos,
  };
}

export interface ResultadoRe {
  error: string | null;
  avisos: string[];
  search: InfoMatch | null;
  match: InfoMatch | null;
  fullmatch: InfoMatch | null;
  findall: string;
  finditer: InfoMatch[];
  sub: string;
  split: string;
  numGrupos: number;
}

/** Convierte el reemplazo de Python (\1, \g<1>, \g<nombre>) al de JS ($1, $<nombre>) */
function convertirReemplazo(repl: string): string {
  let r = '';
  for (let i = 0; i < repl.length; i++) {
    const c = repl[i];
    if (c === '$') {
      r += '$$';
    } else if (c === '\\' && i + 1 < repl.length) {
      const sig = repl[i + 1];
      const g = repl.slice(i).match(/^\\g<(\w+)>/);
      const num = repl.slice(i).match(/^\\(\d{1,2})/);
      if (g) {
        r += /^\d+$/.test(g[1]) ? `$${g[1]}` : `$<${g[1]}>`;
        i += g[0].length - 1;
      } else if (num) {
        r += `$${num[1]}`;
        i += num[0].length - 1;
      } else if (sig === 'n') {
        r += '\n';
        i++;
      } else if (sig === 't') {
        r += '\t';
        i++;
      } else if (sig === '\\') {
        r += '\\';
        i++;
      } else {
        r += c;
      }
    } else {
      r += c;
    }
  }
  return r;
}

export function ejecutarRe(patron: string, texto: string, repl: string, flags: FlagsPy): ResultadoRe {
  const conv = convertirPatron(patron);
  const f: FlagsPy = { ...flags, ...conv.flagsExtra };
  const base = flagsJs(f);
  const avisos = [...conv.avisos];
  const vacio: ResultadoRe = {
    error: null,
    avisos,
    search: null,
    match: null,
    fullmatch: null,
    findall: '[]',
    finditer: [],
    sub: pyStr(texto),
    split: pyRepr([texto]),
    numGrupos: 0,
  };

  let reBusqueda: RegExp;
  try {
    reBusqueda = new RegExp(conv.js, base + 'd');
  } catch (e) {
    return { ...vacio, error: (e as Error).message.replace(/^Invalid regular expression: /, '') };
  }

  // Aviso Unicode: \w, \b, \d en Python 3 reconocen letras con tilde, ñ, etc.
  if (/\\[wWbB]/.test(patron) && /[^\x00-\x7F]/.test(texto)) {
    avisos.push(
      'Tu texto tiene caracteres no ASCII (á, ñ…). En Python 3, \\w y \\b los tratan como letras; en JavaScript no. El resultado real en Python puede ser distinto.',
    );
  }

  // search: primera coincidencia en cualquier posición
  const ms = reBusqueda.exec(texto);
  const search = ms ? infoDe(ms) : null;

  // match: solo desde la posición 0 (flag sticky)
  const reMatch = new RegExp(conv.js, base + 'dy');
  reMatch.lastIndex = 0;
  const mm = reMatch.exec(texto);
  const match = mm ? infoDe(mm) : null;

  // fullmatch: desde 0 y hasta el final absoluto del texto
  const reFull = new RegExp(`(?:${conv.js})(?![\\s\\S])`, base + 'dy');
  reFull.lastIndex = 0;
  const mf = reFull.exec(texto);
  const fullmatch = mf ? infoDe(mf) : null;

  // findall / finditer
  const reG = new RegExp(conv.js, base + 'dg');
  const todos = [...texto.matchAll(reG)] as RegExpExecArray[];
  const numGrupos = new RegExp(`${conv.js}|`, base).exec('')!.length - 1;
  const lista: ValorPy[] = todos.map((m) => {
    if (numGrupos === 0) return m[0];
    if (numGrupos === 1) return m[1] ?? '';
    return new Tupla(m.slice(1).map((g) => g ?? ''));
  });
  if (todos.some((m) => m[0] === '')) {
    avisos.push('El patrón admite coincidencias vacías: findall/split pueden diferir ligeramente de Python.');
  }

  // sub
  let sub: string;
  try {
    sub = pyStr(texto.replace(reG, convertirReemplazo(repl)));
  } catch (e) {
    sub = `Error: ${(e as Error).message}`;
  }

  // split (como en Python, los grupos capturados aparecen en el resultado)
  const trozos: ValorPy[] = texto
    .split(new RegExp(conv.js, base + 'g'))
    .map((t) => (t as string | undefined) ?? null);

  return {
    error: null,
    avisos,
    search,
    match,
    fullmatch,
    findall: pyRepr(lista),
    finditer: todos.map(infoDe),
    sub,
    split: pyRepr(trozos),
    numGrupos,
  };
}
