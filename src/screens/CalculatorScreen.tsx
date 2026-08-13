import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ScrollView
} from 'react-native';
import { Receta, getRecetas } from '../storage';

export default function CalculatorScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [personas, setPersonas] = useState('');

  useEffect(() => {
    getRecetas().then(setRecetas);
  }, []);

  const factor = recetaSeleccionada && personas
    ? parseFloat(personas) / recetaSeleccionada.porcionesBase
    : 1;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calculadora 🧮</Text>
      <Text style={styles.subtitle}>Escala cualquier receta para eventos</Text>

      <Text style={styles.label}>Selecciona una receta</Text>
      {recetas.map(r => (
        <TouchableOpacity
          key={r.id}
          style={[styles.recetaChip, recetaSeleccionada?.id === r.id && styles.recetaActiva]}
          onPress={() => setRecetaSeleccionada(r)}
        >
          <Text style={[styles.recetaText, recetaSeleccionada?.id === r.id && styles.recetaTextActiva]}>
            {r.nombre}
          </Text>
        </TouchableOpacity>
      ))}

      {recetaSeleccionada && (
        <>
          <Text style={styles.label}>¿Para cuántas personas?</Text>
          <TextInput
            style={styles.input}
            placeholder={`Base: ${recetaSeleccionada.porcionesBase} personas`}
            keyboardType="numeric"
            value={personas}
            onChangeText={setPersonas}
          />

          {personas !== '' && (
            <View style={styles.resultado}>
              <Text style={styles.resultadoTitle}>
                {recetaSeleccionada.nombre} para {personas} personas
              </Text>

              <Text style={styles.costoTotal}>
                💰 Costo total estimado: ${(recetaSeleccionada.costoAproximado * factor).toFixed(2)}
              </Text>

              <Text style={styles.ingredientesTitle}>Ingredientes necesarios:</Text>
              {recetaSeleccionada.ingredientes.map((ing, index) => (
                <View key={index} style={styles.ingredienteRow}>
                  <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                  <Text style={styles.ingredienteCantidad}>
                    {(ing.cantidad * factor).toFixed(1)} {ing.unidad}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  recetaChip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: '#f5f5f5' },
  recetaActiva: { backgroundColor: '#f4a522', borderColor: '#f4a522' },
  recetaText: { color: '#666', fontWeight: '500' },
  recetaTextActiva: { color: 'white', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  resultado: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginTop: 8 },
  resultadoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  costoTotal: { fontSize: 16, color: '#f4a522', fontWeight: '700', marginBottom: 16 },
  ingredientesTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  ingredienteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ingredienteNombre: { fontSize: 14, color: '#333' },
  ingredienteCantidad: { fontSize: 14, color: '#f4a522', fontWeight: '600' },
});