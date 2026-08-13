import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFamiliares, getRecetas, Familiar, Receta, CATEGORIAS } from '../storage';

export default function HomeScreen() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [sugerencias, setSugerencias] = useState<Receta[]>([]);
  const [buscado, setBuscado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const f = await getFamiliares();
    const r = await getRecetas();
    setFamiliares(f);
    setRecetas(r);
  }

  async function toggleFamiliar(id: string) {
    const actualizados = familiares.map(f =>
      f.id === id ? { ...f, activo: !f.activo } : f
    );
    setFamiliares(actualizados);
  }

  function recomendar() {
    const activos = familiares.filter(f => f.activo).length;
    const presupuestoNum = parseFloat(presupuesto) || Infinity;

    const filtradas = recetas.filter(r => {
      const dentroPresupuesto = r.costoAproximado <= presupuestoNum;
      const categoriaOk = categoria === 'Todas' || r.categoria === categoria;
      return dentroPresupuesto && categoriaOk;
    });

    const ordenadas = filtradas.sort((a, b) => {
      const difA = Math.abs(a.porcionesBase - activos);
      const difB = Math.abs(b.porcionesBase - activos);
      return difA - difB;
    });

    setSugerencias(ordenadas);
    setBuscado(true);
  }

  const activosCount = familiares.filter(f => f.activo).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué cocinamos hoy? 👵</Text>

      <Text style={styles.label}>¿Quiénes comen hoy? ({activosCount} personas)</Text>
      <FlatList
        horizontal
        data={familiares}
        keyExtractor={item => item.id}
        style={styles.familiarList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.familiarChip, item.activo && styles.familiarActivo]}
            onPress={() => toggleFamiliar(item.id)}
          >
            <Text style={[styles.familiarNombre, item.activo && styles.familiarNombreActivo]}>
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.picker}>
        <Picker selectedValue={categoria} onValueChange={setCategoria}>
          <Picker.Item label="Todas" value="Todas" />
          {CATEGORIAS.map(c => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Presupuesto máximo (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 200"
        keyboardType="numeric"
        value={presupuesto}
        onChangeText={setPresupuesto}
      />

      <TouchableOpacity style={styles.boton} onPress={recomendar}>
        <Text style={styles.botonText}>Ver sugerencias 🍽️</Text>
      </TouchableOpacity>

      {buscado && sugerencias.length === 0 && (
        <Text style={styles.vacio}>No hay recetas que coincidan</Text>
      )}

      {buscado && sugerencias.length > 0 && (
        <>
          <Text style={styles.subtitulo}>Sugerencias para {activosCount} personas:</Text>
          <FlatList
            data={sugerencias}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardNombre}>{item.nombre}</Text>
                <Text style={styles.cardInfo}>🕐 {item.tiempoPreparacion} min</Text>
                <Text style={styles.cardInfo}>💰 ${item.costoAproximado}</Text>
                <Text style={styles.cardInfo}>🍽️ {item.porcionesBase} porciones base</Text>
                <View style={styles.categoriaTag}>
                  <Text style={styles.categoriaText}>{item.categoria}</Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  familiarList: { marginBottom: 16 },
  familiarChip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#f5f5f5' },
  familiarActivo: { backgroundColor: '#f4a522', borderColor: '#f4a522' },
  familiarNombre: { color: '#666' },
  familiarNombreActivo: { color: 'white', fontWeight: '600' },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  boton: { backgroundColor: '#f4a522', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  botonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  vacio: { textAlign: 'center', color: '#999', marginTop: 24, fontSize: 16 },
  subtitulo: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2 },
  cardNombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  categoriaTag: { backgroundColor: '#f4a522', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8 },
  categoriaText: { color: 'white', fontSize: 12, fontWeight: '600' },
});