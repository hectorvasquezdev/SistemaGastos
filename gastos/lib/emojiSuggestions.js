const EMOJI_MAP = [
  { keywords: ['aliment', 'comida', 'almuerzo', 'cena', 'desayuno', 'restaurant', 'menú', 'menu', 'snack', 'cocina', 'plato', 'lunch', 'dinner'], emoji: '🍽️' },
  { keywords: ['casa', 'alquiler', 'arriendo', 'vivienda', 'hogar', 'departamento', 'habitacion', 'cuarto', 'renta'], emoji: '🏠' },
  { keywords: ['bus', 'transport', 'taxi', 'uber', 'combi', 'pasaje', 'metro', 'tren', 'moto', 'bici', 'movilidad'], emoji: '🚌' },
  { keywords: ['luz', 'agua', 'gas', 'internet', 'servicio', 'telefon', 'celular', 'electricidad', 'cable', 'wifi', 'netflix', 'streaming', 'spotify'], emoji: '💡' },
  { keywords: ['compra', 'shopping', 'tienda', 'moda', 'ropa', 'zapato', 'vestido', 'polo', 'pantalon', 'camisa', 'falda', 'zapatilla', 'short'], emoji: '🛍️' },
  { keywords: ['ahorro', 'ahorr', 'reserva', 'fondo', 'inversion', 'inversión', 'alcancía', 'alcancia'], emoji: '🐷' },
  { keywords: ['concierto', 'música', 'musica', 'evento', 'show', 'festival', 'teatro', 'artista', 'recital', 'cancion', 'canción'], emoji: '🎵' },
  { keywords: ['viaje', 'vuelo', 'hotel', 'turismo', 'avion', 'avión', 'trip', 'vacacion', 'vacación', 'crucero', 'pasaporte'], emoji: '✈️' },
  { keywords: ['fiesta', 'celebra', 'cumple', 'navidad', 'año nuevo', 'festejo', 'boda', 'matrimonio', 'quinceañera', 'quinceanera'], emoji: '🎉' },
  { keywords: ['farmacia', 'medicina', 'medicamento', 'pastilla', 'remedio', 'enfermedad'], emoji: '💊' },
  { keywords: ['juego', 'videojuego', 'gamer', 'gaming', 'consola', 'steam', 'playstation', 'xbox', 'nintendo'], emoji: '🎮' },
  { keywords: ['libro', 'estudio', 'colegio', 'universidad', 'educacion', 'educación', 'curso', 'clase', 'academia', 'escuela', 'taller', 'capacitacion'], emoji: '📚' },
  { keywords: ['gym', 'gimnasio', 'deporte', 'ejercicio', 'fitness', 'crossfit', 'pilates', 'yoga'], emoji: '🏋️' },
  { keywords: ['mascota', 'veterinario', 'animal'], emoji: '🐾' },
  { keywords: ['perro', 'cachorro', 'canino'], emoji: '🐶' },
  { keywords: ['gato', 'felino'], emoji: '🐱' },
  { keywords: ['guitarra', 'instrumento', 'banda', 'musico', 'músico', 'piano', 'bateria', 'batería'], emoji: '🎸' },
  { keywords: ['cerveza', 'licor', 'alcohol', 'trago', 'bar', 'discoteca', 'antro', 'cantina', 'bebida alcoh', 'ron ', 'whisky', 'pisco', 'vino'], emoji: '🍺' },
  { keywords: ['café', 'cafe', 'cafeteria', 'coffee', 'starbucks', 'capuccino', 'latte'], emoji: '☕' },
  { keywords: ['auto', 'carro', 'vehiculo', 'vehículo', 'gasolina', 'combustible', 'aceite', 'mecanic', 'repuesto', 'llanta', 'neumático'], emoji: '🚗' },
  { keywords: ['peluquer', 'salon', 'salón', 'estética', 'estetica', 'spa', 'barberia', 'barbería', 'corte de cabello', 'manicure', 'pedicure'], emoji: '💇' },
  { keywords: ['hospital', 'clínica', 'clinica', 'doctor', 'médico', 'medico', 'consulta médica', 'odontolo', 'dental', 'dentista', 'nutricion', 'psicolog'], emoji: '🏥' },
  { keywords: ['graduaci', 'titulo', 'título', 'diploma', 'posgrado', 'maestria', 'maestría'], emoji: '🎓' },
  { keywords: ['supermercado', 'mercado', 'bodega', 'víveres', 'viveres', 'limpieza', 'higiene', 'abarrotes'], emoji: '🛒' },
  { keywords: ['regalo', 'obsequio', 'present', 'sorpresa'], emoji: '🎁' },
  { keywords: ['playa', 'piscina', 'verano', 'surf'], emoji: '🏖️' },
  { keywords: ['pizza', 'hamburgue', 'burger', 'sandwich', 'fast food', 'comida rapida', 'delivery'], emoji: '🍕' },
  { keywords: ['cine', 'pelicula', 'película', 'serie', 'entretenimiento'], emoji: '🎬' },
  { keywords: ['futbol', 'fútbol', 'partido', 'estadio', 'cancha', 'liga'], emoji: '⚽' },
  { keywords: ['belleza', 'maquillaje', 'cosmetico', 'cosmético', 'perfume', 'crema', 'skincare'], emoji: '🧴' },
  { keywords: ['salud', 'bienestar', 'medica', 'médica'], emoji: '🏥' },
  { keywords: ['otros', 'otro', 'varios', 'miscela', 'general', 'vario', 'diverse', 'extra'], emoji: '✨' },
];

export function suggestEmoji(name) {
  if (!name.trim()) return null;
  const lower = name.toLowerCase();
  for (const { keywords, emoji } of EMOJI_MAP) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return null;
}
