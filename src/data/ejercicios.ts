import type { Ejercicio } from './tipos';

// Ejercicios de código para practicar «a mano».
// - salida:  ¿qué imprime? (la salida está verificada ejecutando el código en Python 3)
// - hueco:   cada ___ es un hueco; `huecos` tiene las respuestas aceptadas de cada uno, en orden
// - ordenar: `lineas` en el orden correcto, sangría de 4 espacios
// String.raw conserva las barras invertidas de los patrones regex (\d, \s…).

const py = String.raw;

export const EJERCICIOS: Ejercicio[] = [
  // ───────────────────────── ¿QUÉ IMPRIME? ─────────────────────────
  {
    id: 'e-sal-media',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Media de minutos',
    enunciado: 'Con la lista alumnos del examen, ¿qué imprime exactamente?',
    codigo: py`suma_total = 0
for alumno in alumnos:
    suma_total += alumno["minutos_plataforma"]
media = suma_total / len(alumnos)
print("Media de minutos:", media)`,
    salida: 'Media de minutos: 56.0',
    explicacion: 'Se acumulan 42 + 32 + 62 + 48 + 72 + 38 + 68 + 52 + 88 + 58 = 560 y se divide entre 10. print separa los argumentos con un espacio.',
    trampa: 'El operador / devuelve float: 56.0, no 56.',
  },
  {
    id: 'e-sal-cinco',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Los cinco primeros',
    enunciado: 'Con la lista alumnos del examen, ¿qué imprime?',
    codigo: py`for i in range(5):
    print(i, alumnos[i]["nombre"])`,
    salida: '0 Alba\n1 Marcos\n2 Nerea\n3 Pablo\n4 Sara',
    explicacion: 'range(5) produce 0, 1, 2, 3 y 4: los cinco primeros diccionarios.',
    trampa: 'i empieza en 0 y termina en 4.',
  },
  {
    id: 'e-sal-mediana',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Par, impar y mediana',
    enunciado: '¿Qué imprime?',
    codigo: py`horas = [2, 3, 4, 5, 5, 6, 6, 7, 8, 9]
n = len(horas)
print(n % 2, n // 2)
if n % 2 == 0:
    mediana = (horas[n // 2 - 1] + horas[n // 2]) / 2
else:
    mediana = horas[n // 2]
print("Mediana:", mediana)`,
    salida: '0 5\nMediana: 5.5',
    explicacion: '10 % 2 = 0 (par) y 10 // 2 = 5. Índices 4 y 5 → valores 5 y 6 → (5 + 6) / 2 = 5.5.',
  },
  {
    id: 'e-sal-frecuencias',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Diccionario de frecuencias',
    enunciado: '¿Qué imprime? Respeta el orden de inserción del diccionario.',
    codigo: py`puntos = [58, 48, 78, 68, 88, 58, 78, 68, 98, 78]
frecuencias = {}
for p in puntos:
    if p in frecuencias:
        frecuencias[p] += 1
    else:
        frecuencias[p] = 1
print(frecuencias)
print(max(frecuencias.values()), max(frecuencias))`,
    salida: '{58: 2, 48: 1, 78: 3, 68: 2, 88: 1, 98: 1}\n3 98',
    explicacion: 'El diccionario conserva el orden en que aparecen las claves por primera vez. max(frecuencias.values()) es la frecuencia máxima (3); max(frecuencias) es la clave mayor (98).',
    trampa: 'max sobre un diccionario recorre las claves, no los valores.',
  },
  {
    id: 'e-sal-moda',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Lista de modas',
    enunciado: '¿Qué imprime?',
    codigo: py`frecuencias = {58: 2, 48: 1, 78: 3, 68: 2, 88: 1, 98: 1}
max_frecuencia = max(frecuencias.values())
modas = []
for puntos, cantidad in frecuencias.items():
    if cantidad == max_frecuencia:
        modas.append(puntos)
print("Moda:", modas)
print("Frecuencia:", max_frecuencia)`,
    salida: 'Moda: [78]\nFrecuencia: 3',
    explicacion: 'Solo el 78 tiene la frecuencia máxima (3). modas es una lista, por eso se imprime con corchetes.',
  },
  {
    id: 'e-sal-bubble-corto',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Bubble Sort con print por pasada',
    enunciado: '¿Qué imprime? Fíjate en dónde está el print.',
    codigo: py`horas = [4, 2, 6, 5]
n = len(horas)
for i in range(n - 1):
    for j in range(n - 1 - i):
        if horas[j] > horas[j + 1]:
            auxiliar = horas[j]
            horas[j] = horas[j + 1]
            horas[j + 1] = auxiliar
    print(i, horas)`,
    salida: '0 [2, 4, 5, 6]\n1 [2, 4, 5, 6]\n2 [2, 4, 5, 6]',
    explicacion: 'Pasada i = 0: 4↔2 y 6↔5 → [2, 4, 5, 6]. Las pasadas i = 1 e i = 2 no cambian nada, pero el print está dentro del bucle de i: se imprime en cada una de las n − 1 = 3 pasadas.',
    trampa: 'El algoritmo del examen no se detiene aunque la lista ya esté ordenada.',
  },
  {
    id: 'e-sal-bubble-cuenta',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Comparaciones e intercambios',
    enunciado: '¿Qué imprime? (Puedes usar el visualizador de Bubble Sort para comprobarlo.)',
    codigo: py`horas = [4, 2, 6, 5, 8, 3, 7, 5, 9, 6]
n = len(horas)
comparaciones = 0
intercambios = 0
for i in range(n - 1):
    for j in range(n - 1 - i):
        comparaciones += 1
        if horas[j] > horas[j + 1]:
            auxiliar = horas[j]
            horas[j] = horas[j + 1]
            horas[j + 1] = auxiliar
            intercambios += 1
print(comparaciones, intercambios)
print(horas)`,
    salida: '45 13\n[2, 3, 4, 5, 5, 6, 6, 7, 8, 9]',
    explicacion: 'Comparaciones: 9 + 8 + 7 + … + 1 = 45. Intercambios por pasada: 6 + 3 + 3 + 1 = 13 (después ya no hay más).',
  },
  {
    id: 'e-sal-desviaciones',
    bloque: 'python',
    tipo: 'salida',
    titulo: 'Desviaciones y varianza',
    enunciado: '¿Qué imprime?',
    codigo: py`puntos = [58, 48, 78, 68, 88, 58, 78, 68, 98, 78]
promedio = sum(puntos) / len(puntos)
desviaciones = []
for p in puntos:
    desviaciones.append(p - promedio)
print(promedio)
print(desviaciones[0], desviaciones[8])
suma_cuadrados = 0
for d in desviaciones:
    suma_cuadrados += d ** 2
print(suma_cuadrados / len(desviaciones))`,
    salida: '72.0\n-14.0 26.0\n204.0',
    explicacion: 'promedio = 720 / 10 = 72.0 (float). Al restar un float, las desviaciones también son float: 58 − 72.0 = −14.0 y 98 − 72.0 = 26.0. Suma de cuadrados 2040.0 / 10 = 204.0.',
    trampa: 'Todo lo que se calcula a partir de un float sale con «.0».',
  },
  {
    id: 'e-sal-velocidad',
    bloque: 'poo',
    tipo: 'salida',
    titulo: 'Estado de dos instancias',
    enunciado: '¿Qué imprime?',
    codigo: py`class CochePruebas:
    def __init__(self):
        self.velocidad = 0

    def acelerar(self):
        self.velocidad += 10

    def detener(self):
        self.velocidad = 0

coche_a = CochePruebas()
coche_b = CochePruebas()
coche_a.acelerar()
coche_a.acelerar()
coche_b.acelerar()
print(coche_a.velocidad, coche_b.velocidad)
coche_a.detener()
print(coche_a.velocidad, coche_b.velocidad)`,
    salida: '20 10\n0 10',
    explicacion: 'Cada instancia tiene su propio self.velocidad. detener() solo afecta a coche_a.',
  },
  {
    id: 'e-sal-super-none',
    bloque: 'poo',
    tipo: 'salida',
    titulo: 'print en vez de return (trampa)',
    enunciado: '¿Qué imprime? Atención al método describir() del padre.',
    codigo: py`class Vehiculo:
    def __init__(self, marca, modelo):
        self.marca = marca
        self.modelo = modelo

    def describir(self):
        print(f"{self.marca} {self.modelo}")

class CocheElectrico(Vehiculo):
    def __init__(self, marca, modelo, autonomia_km):
        super().__init__(marca, modelo)
        self.autonomia_km = autonomia_km

    def describir(self):
        base = super().describir()
        return f"{base}; autonomía: {self.autonomia_km} km"

coche = CocheElectrico("Tesla", "Model 3", 500)
print(coche.describir())`,
    salida: 'Tesla Model 3\nNone; autonomía: 500 km',
    explicacion: 'super().describir() ejecuta el print del padre («Tesla Model 3») y, al no tener return, devuelve None. Ese None se mete en la f-string.',
    trampa: 'Para ampliar un método heredado, el padre debe usar return.',
  },
  {
    id: 'e-sal-tupla',
    bloque: 'poo',
    tipo: 'salida',
    titulo: 'La coma que crea una tupla',
    enunciado: '¿Qué imprime?',
    codigo: py`class Coche:
    def __init__(self, marca, modelo):
        self.marca = marca,
        self.modelo = modelo

c = Coche("SEAT", "Leon")
print(c.marca)
print(c.modelo)`,
    salida: "('SEAT',)\nLeon",
    explicacion: 'La coma final de self.marca = marca, crea una tupla de un elemento. self.modelo no tiene coma y guarda la cadena.',
    trampa: 'Error real del archivo de clase.',
  },
  {
    id: 'e-sal-polimorfismo',
    bloque: 'poo',
    tipo: 'salida',
    titulo: 'Polimorfismo y herencia',
    enunciado: '¿Qué imprime? MotorElectrico no redefine arrancar().',
    codigo: py`class Motor:
    def arrancar(self):
        return "Motor en marcha"

class MotorGasolina(Motor):
    def arrancar(self):
        return "Motor gasolina en marcha"

class MotorElectrico(Motor):
    pass

motores = [MotorGasolina(), MotorElectrico(), Motor()]
for motor in motores:
    print(motor.arrancar())`,
    salida: 'Motor gasolina en marcha\nMotor en marcha\nMotor en marcha',
    explicacion: 'MotorGasolina sobrescribe arrancar(). MotorElectrico lo hereda de Motor (Python lo busca en el padre siguiendo el MRO).',
  },
  {
    id: 'e-sal-try',
    bloque: 'poo',
    tipo: 'salida',
    titulo: 'try / except en un bucle',
    enunciado: '¿Qué imprime?',
    codigo: py`datos = ["12", "doce", "7"]
total = 0
for d in datos:
    try:
        total += int(d)
        print("Sumado", d)
    except ValueError:
        print("Ignorado", d)
print("Total:", total)`,
    salida: 'Sumado 12\nIgnorado doce\nSumado 7\nTotal: 19',
    explicacion: 'int("doce") lanza ValueError: no se suma ni se ejecuta el print del try, se salta al except y el bucle continúa. 12 + 7 = 19.',
  },
  {
    id: 'e-sal-findall',
    bloque: 'regex',
    tipo: 'salida',
    titulo: 'findall con y sin grupos',
    enunciado: '¿Qué imprime?',
    codigo: py`import re
texto = "Pedidos: A12, B345 y C7"
print(re.findall(r"\d+", texto))
print(re.findall(r"([A-Z])(\d+)", texto))
print(re.match(r"\d+", texto))`,
    salida: "['12', '345', '7']\n[('A', '12'), ('B', '345'), ('C', '7')]\nNone",
    explicacion: 'Sin grupos: lista de coincidencias. Con dos grupos: lista de tuplas. match solo mira el inicio, y el texto empieza por «P».',
    trampa: 'La «P» de «Pedidos» no va seguida de dígitos, por eso no aparece en las tuplas.',
  },
  {
    id: 'e-sal-sub-split',
    bloque: 'regex',
    tipo: 'salida',
    titulo: 'sub y split',
    enunciado: '¿Qué imprime? Cuidado con los espacios.',
    codigo: py`import re
print(re.sub(r"\s+", " ", "uno    dos   tres"))
print(re.split(r"[,;]\s*", "a, b;c ;d"))`,
    salida: "uno dos tres\n['a', 'b', 'c ', 'd']",
    explicacion: 'sub reduce cada bloque de espacios a uno. En split, el separador es una coma o punto y coma seguido de espacios opcionales: el espacio ANTES de «;» queda pegado a «c ».',
    trampa: '\\s* solo consume los espacios que van detrás del separador.',
  },
  {
    id: 'e-sal-span',
    bloque: 'regex',
    tipo: 'salida',
    titulo: 'group, span y fullmatch',
    enunciado: '¿Qué imprime?',
    codigo: py`import re
m = re.search(r"\d{5}", "CP: 08001, Barcelona")
print(m.group(), m.span())
print(re.fullmatch(r"\d{5}", "080011"))
print(re.search(r"\d{5}", "080011").group())`,
    salida: '08001 (4, 9)\nNone\n08001',
    explicacion: 'Los dígitos empiezan en la posición 4 y el final es exclusivo (9). fullmatch falla con 6 dígitos; search encuentra los 5 primeros.',
    trampa: 'Por eso search no sirve para validar.',
  },
  {
    id: 'e-sal-greedy',
    bloque: 'regex',
    tipo: 'salida',
    titulo: 'Greedy vs no greedy',
    enunciado: '¿Qué imprime?',
    codigo: py`import re
html = "<b>hola</b>"
print(re.search(r"<.*>", html).group())
print(re.search(r"<.*?>", html).group())
print(re.findall(r"<.*?>", html))`,
    salida: "<b>hola</b>\n<b>\n['<b>', '</b>']",
    explicacion: '.* consume todo lo posible; .*? lo mínimo. findall con el patrón no codicioso encuentra las dos etiquetas.',
    trampa: 'print de una cadena no muestra comillas; print de una lista sí.',
  },

  // ───────────────────────── COMPLETA EL HUECO ─────────────────────────
  {
    id: 'e-hue-bubble',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Bubble Sort',
    enunciado: 'Completa el Bubble Sort del examen.',
    codigo: py`n = len(horas)
for i in range(___):
    for j in range(n - 1 - ___):
        if horas[j] ___ horas[j + 1]:
            auxiliar = horas[j]
            horas[j] = ___
            horas[j + 1] = ___`,
    huecos: [['n - 1'], ['i'], ['>'], ['horas[j + 1]'], ['auxiliar']],
    explicacion: 'n − 1 pasadas; el bucle interior revisa una posición menos cada vez (− i); si el de la izquierda es mayor se intercambian usando auxiliar.',
    trampa: 'Con < ordenarías de mayor a menor.',
  },
  {
    id: 'e-hue-mediana',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Mediana par/impar',
    enunciado: 'Completa el cálculo de la mediana (la lista horas ya está ordenada).',
    codigo: py`n = len(horas)
if n ___ 2 == 0:
    mediana = (horas[n // 2 - ___] + horas[n ___ 2]) / 2
else:
    mediana = horas[___]
print("Mediana:", mediana)`,
    huecos: [['%'], ['1'], ['//'], ['n // 2']],
    explicacion: '% da el resto (0 → par). Con n par, los centrales son n // 2 − 1 y n // 2; con n impar, el central es n // 2.',
    trampa: 'Usar / en el índice da un float → TypeError.',
  },
  {
    id: 'e-hue-moda',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Moda con diccionario',
    enunciado: 'Completa el cálculo de la moda de puntos_prueba.',
    codigo: py`frecuencias = {}
for alumno in alumnos:
    puntos = alumno["puntos_prueba"]
    if puntos ___ frecuencias:
        frecuencias[puntos] += 1
    else:
        frecuencias[puntos] = ___

max_frecuencia = max(frecuencias.___())
modas = []
for puntos, cantidad in frecuencias.___():
    if cantidad == max_frecuencia:
        modas.___(puntos)`,
    huecos: [['in'], ['1'], ['values'], ['items'], ['append']],
    explicacion: 'in comprueba si la clave existe; la primera vez la frecuencia es 1. values() da las frecuencias; items() da pares (clave, valor).',
  },
  {
    id: 'e-hue-desviacion',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Desviación estándar',
    enunciado: 'Completa el cálculo (promedio ya vale 72.0). Se divide entre n.',
    codigo: py`desviaciones = []
for alumno in alumnos:
    desviacion = alumno["puntos_prueba"] - ___
    alumno["___"] = desviacion
    desviaciones.append(desviacion)

suma_cuadrados = 0
for d in desviaciones:
    suma_cuadrados += d ___ 2
varianza = suma_cuadrados / ___
desviacion_estandar = varianza ___ 0.5`,
    huecos: [['promedio'], ['desviacion_media'], ['**'], ['len(desviaciones)', 'len(alumnos)', 'n', '10'], ['**']],
    explicacion: 'Desviación = valor − promedio, guardada en la nueva clave "desviacion_media". Varianza = suma de cuadrados / n = 204. Raíz = ** 0.5.',
    trampa: '^ no es potencia en Python.',
  },
  {
    id: 'e-hue-break',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Cinco primeros con break',
    enunciado: 'Completa la alternativa con contador para mostrar solo los cinco primeros alumnos.',
    codigo: py`contador = ___
for alumno in alumnos:
    print(alumno)
    contador ___ 1
    if contador == ___:
        ___`,
    huecos: [['0'], ['+='], ['5'], ['break']],
    explicacion: 'El contador empieza en 0 fuera del bucle, se incrementa tras cada print y break termina el bucle al llegar a 5.',
  },
  {
    id: 'e-hue-acumulador',
    bloque: 'python',
    tipo: 'hueco',
    titulo: 'Media con acumulador',
    enunciado: 'Completa la media de minutos de plataforma.',
    codigo: py`suma_total = ___
for alumno in ___:
    suma_total ___ alumno["minutos_plataforma"]
media = suma_total / ___(alumnos)
print("Media de minutos:", media)`,
    huecos: [['0'], ['alumnos'], ['+='], ['len']],
    explicacion: 'Acumulador a 0, se suma cada valor y se divide entre len(alumnos) = 10 → 56.0.',
  },
  {
    id: 'e-hue-herencia',
    bloque: 'poo',
    tipo: 'hueco',
    titulo: 'Herencia y super()',
    enunciado: 'Completa la clase hija para que herede de Vehiculo y amplíe describir().',
    codigo: py`class CocheElectrico(___):
    def __init__(self, marca, modelo, autonomia_km):
        ___().__init__(marca, modelo)
        self.autonomia_km = autonomia_km

    def describir(self):
        base = super().___()
        ___ f"{base}; autonomía: {self.autonomia_km} km"`,
    huecos: [['Vehiculo'], ['super'], ['describir'], ['return']],
    explicacion: 'La clase padre va entre paréntesis. super().__init__ inicializa marca y modelo. El método debe devolver (return) la descripción.',
    trampa: 'Si el nombre del método no coincide (descubrir/describir) se produce AttributeError.',
  },
  {
    id: 'e-hue-clase',
    bloque: 'poo',
    tipo: 'hueco',
    titulo: 'Clase CochePruebas',
    enunciado: 'Completa la clase.',
    codigo: py`class CochePruebas:
    def ___(self):
        ___.velocidad = 0

    def acelerar(___):
        self.velocidad ___ 10`,
    huecos: [['__init__'], ['self'], ['self'], ['+=']],
    explicacion: '__init__ inicializa el estado; self es la instancia; acelerar suma 10 al atributo.',
  },
  {
    id: 'e-hue-try',
    bloque: 'poo',
    tipo: 'hueco',
    titulo: 'Excepciones',
    enunciado: 'Completa para que, si el usuario no escribe un entero, se muestre el aviso sin que el programa se detenga.',
    codigo: py`___:
    kilometros = ___(input("Introduce kilómetros: "))
    print("Kilómetros indicados:", kilometros)
except ___:
    print("Debes escribir un número entero.")`,
    huecos: [['try'], ['int'], ['ValueError']],
    explicacion: 'int() con texto no numérico lanza ValueError, que se captura en el except.',
  },
  {
    id: 'e-hue-regex-validar',
    bloque: 'regex',
    tipo: 'hueco',
    titulo: 'Validar un código',
    enunciado: 'Un código válido es exactamente 2 letras mayúsculas + 3 dígitos (todo el texto). Completa.',
    codigo: py`import re
patron = ___"[A-Z]{___}\d{3}"
if re.___(patron, codigo):
    print("Válido")
else:
    print("No válido")`,
    huecos: [['r'], ['2'], ['fullmatch']],
    explicacion: 'r para el raw string, {2} para dos letras y fullmatch para exigir que TODO el texto cumpla el formato.',
    trampa: 'Con search, «XAB123Y» también pasaría.',
  },
  {
    id: 'e-hue-regex-funciones',
    bloque: 'regex',
    tipo: 'hueco',
    titulo: 'Funciones del módulo re',
    enunciado: 'Completa con la función o el patrón que produce el resultado del comentario.',
    codigo: py`import re
texto = "Llamar al 600123456 o al 911222333"
telefonos = re.___(r"\d___", texto)     # ['600123456', '911222333']
limpio = re.___(r"\s+", " ", "uno    dos")   # 'uno dos'
partes = re.split(r"[___]", "a,b;c")          # ['a', 'b', 'c']`,
    huecos: [['findall'], ['+', '{9}'], ['sub'], [',;', ';,']],
    explicacion: 'findall devuelve todas las coincidencias; \\d+ (o \\d{9}) captura cada número completo; sub sustituye; [,;] es una clase con los dos separadores.',
  },

  // ───────────────────────── ORDENA LAS LÍNEAS ─────────────────────────
  {
    id: 'e-ord-bubble',
    bloque: 'python',
    tipo: 'ordenar',
    titulo: 'Bubble Sort completo',
    enunciado: 'Ordena las líneas del Bubble Sort del examen.',
    lineas: [
      'n = len(horas)',
      'for i in range(n - 1):',
      '    for j in range(n - 1 - i):',
      '        if horas[j] > horas[j + 1]:',
      '            auxiliar = horas[j]',
      '            horas[j] = horas[j + 1]',
      '            horas[j + 1] = auxiliar',
      'print("Horas ordenadas:", horas)',
    ],
    explicacion: 'Primero n; el bucle exterior (pasadas) contiene al interior (comparaciones); el intercambio va dentro del if y en orden: guardar, sobrescribir, recuperar. El print va fuera de los bucles.',
    trampa: 'Si el print queda dentro del for, se imprime en cada pasada.',
  },
  {
    id: 'e-ord-media',
    bloque: 'python',
    tipo: 'ordenar',
    titulo: 'Media con acumulador',
    enunciado: 'Ordena el cálculo de la media de minutos.',
    lineas: [
      'suma_total = 0',
      'for alumno in alumnos:',
      '    suma_total += alumno["minutos_plataforma"]',
      'media = suma_total / len(alumnos)',
      'print("Media de minutos:", media)',
    ],
    explicacion: 'El acumulador se inicializa antes del bucle y la división se hace después, fuera del bucle.',
  },
  {
    id: 'e-ord-mediana',
    bloque: 'python',
    tipo: 'ordenar',
    titulo: 'Extraer horas y calcular la mediana',
    enunciado: 'Ordena las líneas (supón que entre la extracción y el cálculo ya se ha ordenado la lista).',
    lineas: [
      'horas = []',
      'for alumno in alumnos:',
      '    horas.append(alumno["horas_estudio"])',
      'n = len(horas)',
      'if n % 2 == 0:',
      '    mediana = (horas[n // 2 - 1] + horas[n // 2]) / 2',
      'else:',
      '    mediana = horas[n // 2]',
      'print("Mediana:", mediana)',
    ],
    explicacion: 'Lista vacía → append en el bucle → n → if par / else impar → print.',
  },
  {
    id: 'e-ord-moda',
    bloque: 'python',
    tipo: 'ordenar',
    titulo: 'Moda con diccionario',
    enunciado: 'Ordena las líneas del cálculo de la moda.',
    lineas: [
      'frecuencias = {}',
      'for alumno in alumnos:',
      '    puntos = alumno["puntos_prueba"]',
      '    if puntos in frecuencias:',
      '        frecuencias[puntos] += 1',
      '    else:',
      '        frecuencias[puntos] = 1',
      'max_frecuencia = max(frecuencias.values())',
      'modas = []',
      'for puntos, cantidad in frecuencias.items():',
      '    if cantidad == max_frecuencia:',
      '        modas.append(puntos)',
      'print("Moda:", modas)',
    ],
    intercambiables: [[7, 8]],
    explicacion: 'Primero se cuentan las frecuencias; después se busca la máxima y se recogen todas las puntuaciones que la alcanzan.',
  },
  {
    id: 'e-ord-desviacion',
    bloque: 'python',
    tipo: 'ordenar',
    titulo: 'Desviaciones, varianza y desviación estándar',
    enunciado: 'Ordena las líneas (promedio ya está calculado). Cada inicialización va justo antes del bucle que la usa.',
    lineas: [
      'desviaciones = []',
      'for alumno in alumnos:',
      '    desviacion = alumno["puntos_prueba"] - promedio',
      '    alumno["desviacion_media"] = desviacion',
      '    desviaciones.append(desviacion)',
      'suma_cuadrados = 0',
      'for desviacion in desviaciones:',
      '    suma_cuadrados += desviacion ** 2',
      'varianza = suma_cuadrados / len(desviaciones)',
      'desviacion_estandar = varianza ** 0.5',
    ],
    intercambiables: [[3, 4]],
    explicacion: 'Primero las desviaciones (en la lista y en la nueva clave), luego la suma de cuadrados, la varianza (÷ n) y por último la raíz.',
  },
  {
    id: 'e-ord-herencia',
    bloque: 'poo',
    tipo: 'ordenar',
    titulo: 'Clase padre e hija',
    enunciado: 'Ordena las líneas para definir Vehiculo y CocheElectrico.',
    lineas: [
      'class Vehiculo:',
      '    def __init__(self, marca, modelo):',
      '        self.marca = marca',
      '        self.modelo = modelo',
      '    def describir(self):',
      '        return f"{self.marca} {self.modelo}"',
      'class CocheElectrico(Vehiculo):',
      '    def __init__(self, marca, modelo, autonomia_km):',
      '        super().__init__(marca, modelo)',
      '        self.autonomia_km = autonomia_km',
    ],
    intercambiables: [[2, 3]],
    explicacion: 'La clase padre se define antes que la hija. En la hija, super().__init__ va primero y después se añade el atributo propio.',
  },
  {
    id: 'e-ord-try',
    bloque: 'poo',
    tipo: 'ordenar',
    titulo: 'try / except',
    enunciado: 'Ordena el programa que pide los kilómetros.',
    lineas: [
      'try:',
      '    kilometros = int(input("Introduce kilómetros: "))',
      '    print("Kilómetros indicados:", kilometros)',
      'except ValueError:',
      '    print("Debes escribir un número entero.")',
      'print("Programa finalizado.")',
    ],
    explicacion: 'El código que puede fallar va en el try; el aviso en el except; el mensaje final fuera de ambos (se ejecuta siempre).',
  },
  {
    id: 'e-ord-regex',
    bloque: 'regex',
    tipo: 'ordenar',
    titulo: 'Buscar un código postal',
    enunciado: 'Ordena las líneas: busca el código postal y comprueba que existe antes de usar group().',
    lineas: [
      'import re',
      'texto = "Código postal: 08001"',
      'coincidencia = re.search(r"\\d{5}", texto)',
      'if coincidencia:',
      '    codigo = coincidencia.group()',
      '    print(codigo)',
      'else:',
      '    print("No encontrado")',
    ],
    explicacion: 'Se importa re, se busca y se comprueba que la coincidencia no es None antes de llamar a group().',
    trampa: 'Llamar a group() sobre None → AttributeError.',
  },
];
