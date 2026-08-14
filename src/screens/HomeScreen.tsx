import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getFamiliares, getRecetas, Familiar, Receta, CATEGORIAS } from '../storage';
import { colors, categoriaEmoji } from '../theme';

export default function HomeScreen() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [sugerencias, setSugerencias] = useState<Receta[]>([]);
  const [buscado, setBuscado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  async function cargarDatos() {
    const f = await getFamiliares();
    const r = await getRecetas();
    setFamiliares(f);
    setRecetas(r);
  }

  function toggleFamiliar(id: string) {
    setFamiliares(prev =>
      prev.map(f => f.id === id ? { ...f, activo: !f.activo } : f)
    );
  }

  function recomendar() {
    const activosList = familiares.filter(f => f.activo);
    const presupuestoNum = parseFloat(presupuesto) || Infinity;

    const filtradas = recetas.filter(r => {
      if (r.costoAproximado > presupuestoNum) return false;
      if (categoria !== 'Todas' && r.categoria !== categoria) return false;
      const recetaRestringida = activosList.some(f => f.recetasRestringidas.includes(r.id));
      if (recetaRestringida) return false;
      const tieneIngredienteRestringido = activosList.some(familiar =>
        familiar.ingredientesRestringidos.some(ing =>
          r.ingredientes.some(i => i.nombre.toLowerCase().includes(ing.toLowerCase()))
        )
      );
      if (tieneIngredienteRestringido) return false;
      return true;
    });

    const ordenadas = filtradas.sort((a, b) => {
      const activos = activosList.length;
      return Math.abs(a.porcionesBase - activos) - Math.abs(b.porcionesBase - activos);
    });

    setSugerencias(ordenadas);
    setBuscado(true);
  }

  const activosCount = familiares.filter(f => f.activo).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué cocinamos hoy?</Text>
        <Text style={styles.subtitle}>👵 Cocina de la abuela</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Quiénes comen hoy? ({activosCount} personas)</Text>
        <FlatList
          horizontal
          data={familiares}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, item.activo && styles.chipActivo]}
              onPress={() => toggleFamiliar(item.id)}
            >
              <Text style={[styles.chipText, item.activo && styles.chipTextActivo]}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categoría</Text>
        <View style={styles.picker}>
          <Picker selectedValue={categoria} onValueChange={setCategoria}>
            <Picker.Item label="🍴 Todas" value="Todas" />
            {CATEGORIAS.map(c => (
              <Picker.Item key={c} label={`${categoriaEmoji[c] || '🍽️'} ${c}`} value={c} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Presupuesto máximo (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="$ ¿Cuánto tienes para gastar?"
          keyboardType="numeric"
          value={presupuesto}
          onChangeText={setPresupuesto}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <TouchableOpacity style={styles.boton} onPress={recomendar}>
        <Text style={styles.botonText}>Ver sugerencias 🍽️</Text>
      </TouchableOpacity>

      {buscado && sugerencias.length === 0 && (
        <View style={styles.vacio}>
          <Text style={styles.vacioEmoji}>😕</Text>
          <Text style={styles.vacioText}>No hay recetas que coincidan</Text>
          <Text style={styles.vacioSubtext}>Intenta con otro presupuesto o categoría</Text>
        </View>
      )}

      {buscado && sugerencias.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {sugerencias.length} sugerencias para {activosCount} personas
          </Text>
          {sugerencias.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{categoriaEmoji[item.categoria] || '🍽️'}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardNombre}>{item.nombre}</Text>
                  <View style={styles.categoriaTag}>
                    <Text style={styles.categoriaText}>{item.categoria}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statEmoji}>🕐</Text>
                  <Text style={styles.statText}>{item.tiempoPreparacion} min</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statEmoji}>💰</Text>
                  <Text style={styles.statText}>${item.costoAproximado}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statEmoji}>🍽️</Text>
                  <Text style={styles.statText}>{item.porcionesBase} porc.</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  chip: { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: colors.card },
  chipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textLight, fontWeight: '500' },
  chipTextActivo: { color: 'white', fontWeight: '700' },
  picker: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: colors.card },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: colors.card, color: colors.text },
  boton: { backgroundColor: colors.primary, margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  botonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  vacio: { alignItems: 'center', padding: 32 },
  vacioEmoji: { fontSize: 48, marginBottom: 12 },
  vacioText: { fontSize: 16, fontWeight: '600', color: colors.text },
  vacioSubtext: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmoji: { fontSize: 36, marginRight: 12 },
  cardHeaderText: { flex: 1 },
  cardNombre: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  categoriaTag: { backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  categoriaText: { color: 'white', fontSize: 11, fontWeight: '600' },
  cardStats: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  stat: { alignItems: 'center' },
  statEmoji: { fontSize: 16 },
  statText: { fontSize: 12, color: colors.textLight, marginTop: 2 },
});