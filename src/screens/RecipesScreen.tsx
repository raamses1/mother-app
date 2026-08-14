import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { Receta, Ingrediente, getRecetas, saveRecetas, CATEGORIAS, UNIDADES } from '../storage';
import { colors, categoriaEmoji } from '../theme';

export default function RecipesScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recetaEditandoId, setRecetaEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [tiempo, setTiempo] = useState('');
  const [costo, setCosto] = useState('');
  const [porciones, setPorciones] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nombre: '', cantidad: 0, unidad: UNIDADES[0] }
  ]);

  useFocusEffect(
    useCallback(() => {
      cargarRecetas();
    }, [])
  );

  async function cargarRecetas() {
    const data = await getRecetas();
    setRecetas(data);
  }

  function agregarIngrediente() {
    setIngredientes([...ingredientes, { nombre: '', cantidad: 0, unidad: UNIDADES[0] }]);
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
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    const receta: Receta = {
      id: recetaEditandoId || Date.now().toString(),
      nombre: nombre.trim(),
      categoria,
      tiempoPreparacion: parseInt(tiempo) || 0,
      costoAproximado: parseFloat(costo) || 0,
      porcionesBase: parseInt(porciones) || 1,
      ingredientes: ingredientes.filter(i => i.nombre.trim() !== ''),
    };

    let actualizadas;
    if (recetaEditandoId) {
      actualizadas = recetas.map(r => r.id === recetaEditandoId ? receta : r);
    } else {
      actualizadas = [...recetas, receta];
    }

    setRecetas(actualizadas);
    await saveRecetas(actualizadas);
    cerrarModal();
  }

  async function eliminarReceta(id: string) {
    Alert.alert('Eliminar receta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const actualizadas = recetas.filter(r => r.id !== id);
          setRecetas(actualizadas);
          await saveRecetas(actualizadas);
        }
      }
    ]);
  }

  function abrirEditar(receta: Receta) {
    setNombre(receta.nombre);
    setCategoria(receta.categoria);
    setTiempo(receta.tiempoPreparacion.toString());
    setCosto(receta.costoAproximado.toString());
    setPorciones(receta.porcionesBase.toString());
    setIngredientes(receta.ingredientes.length > 0 ? receta.ingredientes : [{ nombre: '', cantidad: 0, unidad: UNIDADES[0] }]);
    setRecetaEditandoId(receta.id);
    setModalVisible(true);
  }

  function cerrarModal() {
    setModalVisible(false);
    setNombre('');
    setCategoria(CATEGORIAS[0]);
    setTiempo('');
    setCosto('');
    setPorciones('');
    setIngredientes([{ nombre: '', cantidad: 0, unidad: UNIDADES[0] }]);
    setRecetaEditandoId(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recetas 📖</Text>
        <Text style={styles.subtitle}>{recetas.length} recetas guardadas</Text>
      </View>

      {recetas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍳</Text>
          <Text style={styles.emptyText}>No hay recetas todavía</Text>
          <Text style={styles.emptySubtext}>Toca + para agregar la primera</Text>
        </View>
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
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
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => abrirEditar(item)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => eliminarReceta(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
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
          <Text style={styles.modalTitle}>
            {recetaEditandoId ? '✏️ Editar Receta' : '🍳 Nueva Receta'}
          </Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Arroz rojo" />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.picker}>
            <Picker selectedValue={categoria} onValueChange={setCategoria}>
              {CATEGORIAS.map(c => (
                <Picker.Item key={c} label={`${categoriaEmoji[c] || '🍽️'} ${c}`} value={c} />
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
                placeholder="Nombre del ingrediente"
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
            <Text style={styles.guardarText}>
              {recetaEditandoId ? 'Guardar cambios' : 'Guardar Receta'}
            </Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  list: { padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptySubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmoji: { fontSize: 36, marginRight: 12 },
  cardHeaderText: { flex: 1 },
  cardNombre: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  categoriaTag: { backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  categoriaText: { color: 'white', fontSize: 11, fontWeight: '600' },
  cardStats: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginBottom: 10 },
  stat: { alignItems: 'center' },
  statEmoji: { fontSize: 16 },
  statText: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  editBtn: { padding: 6 },
  editBtnText: { color: colors.primary, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: colors.danger, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  modal: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: colors.text },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: colors.card },
  picker: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 12, backgroundColor: colors.card },
  ingredienteBlock: { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  ingredienteRow: { flexDirection: 'row', gap: 8 },
  addIngrediente: { padding: 12, alignItems: 'center', marginBottom: 12 },
  addIngredienteText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  guardar: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  guardarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelar: { padding: 16, alignItems: 'center', marginBottom: 40 },
  cancelarText: { color: colors.textLight, fontSize: 16 },
});