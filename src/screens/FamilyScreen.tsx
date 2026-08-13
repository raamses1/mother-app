import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Familiar, getFamiliares, saveFamiliares } from '../storage';

export default function FamilyScreen() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    cargarFamiliares();
  }, []);

  async function cargarFamiliares() {
    const data = await getFamiliares();
    setFamiliares(data);
  }

  async function agregarFamiliar() {
    if (!nombre.trim()) return;

    const nuevo: Familiar = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      restricciones: [],
      activo: true,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Familia 👨‍👩‍👧</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del familiar"
          value={nombre}
          onChangeText={setNombre}
        />
        <TouchableOpacity style={styles.button} onPress={agregarFamiliar}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={familiares}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.activo && styles.inactivo]}
            onPress={() => toggleActivo(item.id)}
          >
            <Text style={styles.cardNombre}>{item.nombre}</Text>
            <Text>{item.activo ? '✅ Come hoy' : '❌ No come hoy'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, marginTop: 40 },
  inputRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  button: { backgroundColor: '#f4a522', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center', width: 44 },
  buttonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  inactivo: { opacity: 0.4 },
  cardNombre: { fontSize: 16, fontWeight: '600' },
});