import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Familiar, Receta, getFamiliares, saveFamiliares, getRecetas } from '../storage';
import { colors } from '../theme';

export default function FamilyScreen() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [nombre, setNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [familiarEditando, setFamiliarEditando] = useState<Familiar | null>(null);
  const [nuevoIngrediente, setNuevoIngrediente] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  async function cargarDatos() {
    const f = await getFamiliares();
    const r = await getRecetas();
    const migrados = f.map(familiar => ({
      ...familiar,
      ingredientesRestringidos: familiar.ingredientesRestringidos ?? [],
      recetasRestringidas: familiar.recetasRestringidas ?? [],
    }));
    setFamiliares(migrados);
    await saveFamiliares(migrados);
    setRecetas(r);
  }

  async function agregarFamiliar() {
    if (!nombre.trim()) return;
    const nuevo: Familiar = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      activo: true,
      ingredientesRestringidos: [],
      recetasRestringidas: [],
    };
    const actualizados = [...familiares, nuevo];
    setFamiliares(actualizados);
    await saveFamiliares(actualizados);
    setNombre('');
  }

  async function toggleActivo(id: string) {
    const actualizados = familiares.map(f =>
      f.id === id ? { ...f, activo: !f.activo } : f
    );
    setFamiliares(actualizados);
    await saveFamiliares(actualizados);
  }

  async function eliminarFamiliar(id: string) {
    Alert.alert('Eliminar familiar', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const actualizados = familiares.filter(f => f.id !== id);
          setFamiliares(actualizados);
          await saveFamiliares(actualizados);
        }
      }
    ]);
  }

  function abrirEditar(familiar: Familiar) {
    setFamiliarEditando({ ...familiar });
    setModalVisible(true);
  }

  async function guardarEdicion() {
    if (!familiarEditando) return;
    const actualizados = familiares.map(f =>
      f.id === familiarEditando.id ? familiarEditando : f
    );
    setFamiliares(actualizados);
    await saveFamiliares(actualizados);
    cerrarModal();
  }

  function agregarIngredienteRestringido() {
    if (!nuevoIngrediente.trim() || !familiarEditando) return;
    setFamiliarEditando({
      ...familiarEditando,
      ingredientesRestringidos: [...familiarEditando.ingredientesRestringidos, nuevoIngrediente.trim()]
    });
    setNuevoIngrediente('');
  }

  function quitarIngredienteRestringido(ingrediente: string) {
    if (!familiarEditando) return;
    setFamiliarEditando({
      ...familiarEditando,
      ingredientesRestringidos: familiarEditando.ingredientesRestringidos.filter(i => i !== ingrediente)
    });
  }

  function toggleRecetaRestringida(recetaId: string) {
    if (!familiarEditando) return;
    const yaRestringida = familiarEditando.recetasRestringidas.includes(recetaId);
    setFamiliarEditando({
      ...familiarEditando,
      recetasRestringidas: yaRestringida
        ? familiarEditando.recetasRestringidas.filter(id => id !== recetaId)
        : [...familiarEditando.recetasRestringidas, recetaId]
    });
  }

  function cerrarModal() {
    setModalVisible(false);
    setFamiliarEditando(null);
    setNuevoIngrediente('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Familia 👨‍👩‍👧</Text>
        <Text style={styles.subtitle}>{familiares.length} integrantes registrados</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del familiar"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity style={styles.addBtn} onPress={agregarFamiliar}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={familiares}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.activo && styles.cardInactivo]}>
            <TouchableOpacity style={styles.cardMain} onPress={() => toggleActivo(item.id)}>
              <View style={styles.cardLeft}>
                <Text style={styles.avatar}>{item.nombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNombre}>{item.nombre}</Text>
                <Text style={styles.cardStatus}>
                  {item.activo ? '✅ Come hoy' : '❌ No come hoy'}
                </Text>
                {item.ingredientesRestringidos.length > 0 && (
                  <Text style={styles.restriccion}>
                    🚫 {item.ingredientesRestringidos.join(', ')}
                  </Text>
                )}
                {item.recetasRestringidas.length > 0 && (
                  <Text style={styles.restriccion}>
                    🚫 {item.recetasRestringidas.length} receta(s) restringida(s)
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => abrirEditar(item)} style={styles.actionBtn}>
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarFamiliar(item.id)} style={styles.actionBtn}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>✏️ {familiarEditando?.nombre}</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={familiarEditando?.nombre}
            onChangeText={v => setFamiliarEditando(prev => prev ? { ...prev, nombre: v } : null)}
          />

          <Text style={styles.label}>Ingredientes que no le gustan</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ej. chile, cebolla..."
              value={nuevoIngrediente}
              onChangeText={setNuevoIngrediente}
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity style={styles.addBtn} onPress={agregarIngredienteRestringido}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {familiarEditando?.ingredientesRestringidos.map(ing => (
              <TouchableOpacity
                key={ing}
                style={styles.chip}
                onPress={() => quitarIngredienteRestringido(ing)}
              >
                <Text style={styles.chipText}>{ing} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Recetas que no come</Text>
          {recetas.map(r => {
            const restringida = familiarEditando?.recetasRestringidas.includes(r.id);
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.recetaItem, restringida && styles.recetaRestringida]}
                onPress={() => toggleRecetaRestringida(r.id)}
              >
                <Text style={[styles.recetaText, restringida && styles.recetaRestringidaText]}>
                  {restringida ? '🚫 ' : '✅ '}{r.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.guardar} onPress={guardarEdicion}>
            <Text style={styles.guardarText}>Guardar cambios</Text>
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
  inputRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: colors.card },
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', width: 48 },
  addBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardInactivo: { opacity: 0.5 },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cardLeft: { marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, textAlign: 'center', lineHeight: 44, fontSize: 20, fontWeight: 'bold', color: 'white', overflow: 'hidden' },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardStatus: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  restriccion: { fontSize: 12, color: colors.danger, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8 },
  editText: { fontSize: 18 },
  deleteText: { fontSize: 18 },
  modal: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: colors.danger, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: 'white', fontSize: 13 },
  recetaItem: { padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: '#eee' },
  recetaRestringida: { backgroundColor: '#fdecea', borderColor: colors.danger },
  recetaText: { fontSize: 14, color: colors.text },
  recetaRestringidaText: { color: colors.danger },
  guardar: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, marginTop: 24 },
  guardarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelar: { padding: 16, alignItems: 'center', marginBottom: 40 },
  cancelarText: { color: colors.textLight, fontSize: 16 },
});