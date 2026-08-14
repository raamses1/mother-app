import AsyncStorage from '@react-native-async-storage/async-storage';

export const CATEGORIAS = [
  'Guisado',
  'Frito',
  'Asado',
  'Al vapor',
  'Horneado',
  'Caldo',
  'N/A',
];

export const UNIDADES = [
  'tazas',
  'piezas',
  'kg',
  'g',
  'ml',
  'litros',
  'cucharadas',
  'cucharaditas',
  'al gusto',
];

export interface Ingrediente {
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface Receta {
  id: string;
  nombre: string;
  categoria: string;
  tiempoPreparacion: number;
  costoAproximado: number;
  porcionesBase: number;
  ingredientes: Ingrediente[];
}

export interface Familiar {
  id: string;
  nombre: string;
  activo: boolean;
  ingredientesRestringidos: string[];
  recetasRestringidas: string[];
}

const KEYS = {
  recetas: 'recetas',
  familiares: 'familiares',
};

// Recetas
export async function getRecetas(): Promise<Receta[]> {
  const data = await AsyncStorage.getItem(KEYS.recetas);
  return data ? JSON.parse(data) : [];
}

export async function saveRecetas(recetas: Receta[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.recetas, JSON.stringify(recetas));
}

// Familiares
export async function getFamiliares(): Promise<Familiar[]> {
  const data = await AsyncStorage.getItem(KEYS.familiares);
  return data ? JSON.parse(data) : [];
}

export async function saveFamiliares(familiares: Familiar[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.familiares, JSON.stringify(familiares));
}