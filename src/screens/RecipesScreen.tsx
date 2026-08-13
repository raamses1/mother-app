import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert
} from 'react-native';
import { Receta, Ingrediente, getRecetas, saveRecetas, CATEGORIAS, UNIDADES } from '../storage';
import { Picker } from '@react-native-picker/picker';

export default function RecipesScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [nombre, setNombre] = useState('');
const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [tiempo, setTiempo] = useState('');
  const [costo, setCosto] = useState('');
  const [porciones, setPorciones] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nombre: '', cantidad: 0, unidad: '' }
  ]);

  useEffect(() => {
    cargarRecetas();
  }, []);

  async function cargarRecetas() {
    const data = await getRecetas();
    setRecetas(data);
  }

  function agregarIngrediente() {
    setIngredientes([...ingredientes, { nombre: '', cantidad: 0, unidad: '' }]);
  }

  function actualizarIngrediente(index: number, campo: keyof Ingrediente, valor: string) {
    const nuevos = [...ingredientes];
    if (campo === 'cantidad') {
      nuevos[index] = { ...nuevos[index], cantidad: parseFloat(valor) || 0 };
    } else {
      nuevos[index] = { ...nuevos[index], [campo]: valor };
    }
    setIngredientes(nuevos);
  }

  async function guardarReceta() {
    if (!nombre.trim() || !categoria.trim()) {
      Alert.alert('Error', 'Nombre y categoría son obligatorios');
      return;
    }

    const nueva: Receta = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      tiempoPreparacion: parseInt(tiempo) || 0,
      costoAproximado: parseFloat(costo) || 0,
      porcionesBase: parseInt(porciones) || 1,
      ingredientes: ingredientes.filter(i => i.nombre.trim() !== ''),
    };

    const actualizadas = [...recetas, nueva];
    setRecetas(actualizadas);
    await saveRecetas(actualizadas);
    cerrarModal();
  }

  function cerrarModal() {
    setModalVisible(false);
    setNombre('');
    setCategoria(CATEGORIAS[0]);
    setTiempo('');
    setCosto('');
    setPorciones('');
    setIngredientes([{ nombre: '', cantidad: 0, unidad: '' }]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recetas 📖</Text>

      {recetas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay recetas todavía</Text>
          <Text style={styles.emptySubtext}>Toca + para agregar la primera</Text>
        </View>
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <Text style={styles.cardInfo}>🕐 {item.tiempoPreparacion} min</Text>
              <Text style={styles.cardInfo}>💰 ${item.costoAproximado}</Text>
              <Text style={styles.cardInfo}>🍽️ {item.porcionesBase} porciones</Text>
              <View style={styles.categoria}>
                <Text style={styles.categoriaText}>{item.categoria}</Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Nueva Receta</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Arroz rojo" />

          <Text style={styles.label}>Categoría</Text>
<View style={styles.picker}>
  <Picker selectedValue={categoria} onValueChange={setCategoria}>
    {CATEGORIAS.map(c => (
      <Picker.Item key={c} label={c} value={c} />
    ))}
  </Picker>
</View>

          <Text style={styles.label}>Tiempo de preparación (min)</Text>
          <TextInput style={styles.input} value={tiempo} onChangeText={setTiempo} keyboardType="numeric" placeholder="Ej. 30" />

          <Text style={styles.label}>Costo aproximado ($)</Text>
          <TextInput style={styles.input} value={costo} onChangeText={setCosto} keyboardType="numeric" placeholder="Ej. 150" />

          <Text style={styles.label}>Porciones base</Text>
          <TextInput style={styles.input} value={porciones} onChangeText={setPorciones} keyboardType="numeric" placeholder="Ej. 4" />

          <Text style={styles.label}>Ingredientes</Text>
          {ingredientes.map((ing, index) => (
  <View key={index} style={styles.ingredienteBlock}>
    <TextInput
      style={styles.input}
      placeholder="Ingrediente"
      value={ing.nombre}
      onChangeText={v => actualizarIngrediente(index, 'nombre', v)}
    />
    <View style={styles.ingredienteRow}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={ing.cantidad ? ing.cantidad.toString() : ''}
        onChangeText={v => actualizarIngrediente(index, 'cantidad', v)}
      />
      <View style={[styles.picker, { flex: 1 }]}>
        <Picker
          selectedValue={ing.unidad}
          onValueChange={v => actualizarIngrediente(index, 'unidad', v)}
        >
          {UNIDADES.map(u => (
            <Picker.Item key={u} label={u} value={u} />
          ))}
        </Picker>
      </View>
    </View>
  </View>
))}

          <TouchableOpacity style={styles.addIngrediente} onPress={agregarIngrediente}>
            <Text style={styles.addIngredienteText}>+ Agregar ingrediente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guardar} onPress={guardarReceta}>
            <Text style={styles.guardarText}>Guardar Receta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelar} onPress={cerrarModal}>
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, marginTop: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2 },
  cardNombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  categoria: { backgroundColor: '#f4a522', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8 },
  categoriaText: { color: 'white', fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#f4a522', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  modal: { flex: 1, padding: 24, paddingTop: 60 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  ingredienteRow: { flexDirection: 'row', gap: 8 },
  addIngrediente: { padding: 12, alignItems: 'center', marginBottom: 12 },
  addIngredienteText: { color: '#f4a522', fontWeight: '600', fontSize: 16 },
  guardar: { backgroundColor: '#f4a522', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  guardarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelar: { padding: 16, alignItems: 'center', marginBottom: 40 },
  cancelarText: { color: '#999', fontSize: 16 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  ingredienteBlock: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
});