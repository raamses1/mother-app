import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Receta, getRecetas } from '../storage';
import { colors, categoriaEmoji } from '../theme';

export default function CalculatorScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [personas, setPersonas] = useState('');

  useFocusEffect(
    useCallback(() => {
      getRecetas().then(setRecetas);
    }, [])
  );

  const factor = recetaSeleccionada && personas
    ? parseFloat(personas) / recetaSeleccionada.porcionesBase
    : 1;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora 🧮</Text>
        <Text style={styles.subtitle}>Escala recetas para eventos</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecciona una receta</Text>
        {recetas.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.recetaItem, recetaSeleccionada?.id === r.id && styles.recetaActiva]}
            onPress={() => { setRecetaSeleccionada(r); setPersonas(''); }}
          >
            <Text style={styles.recetaEmoji}>{categoriaEmoji[r.categoria] || '🍽️'}</Text>
            <Text style={[styles.recetaText, recetaSeleccionada?.id === r.id && styles.recetaTextActiva]}>
              {r.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {recetaSeleccionada && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Para cuántas personas?</Text>
          <TextInput
            style={styles.input}
            placeholder={`Base: ${recetaSeleccionada.porcionesBase} personas`}
            keyboardType="numeric"
            value={personas}
            onChangeText={setPersonas}
            placeholderTextColor={colors.textLight}
          />

          {personas !== '' && (
            <View style={styles.resultado}>
              <View style={styles.resultadoHeader}>
                <Text style={styles.resultadoEmoji}>
                  {categoriaEmoji[recetaSeleccionada.categoria] || '🍽️'}
                </Text>
                <View>
                  <Text style={styles.resultadoTitle}>{recetaSeleccionada.nombre}</Text>
                  <Text style={styles.resultadoPersonas}>Para {personas} personas</Text>
                </View>
              </View>

              <View style={styles.costoBox}>
                <Text style={styles.costoLabel}>Costo total estimado</Text>
                <Text style={styles.costoValor}>
                  ${(recetaSeleccionada.costoAproximado * factor).toFixed(2)}
                </Text>
              </View>

              <Text style={styles.ingredientesTitle}>Ingredientes necesarios</Text>
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
  recetaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#eee', elevation: 1 },
  recetaActiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  recetaEmoji: { fontSize: 24, marginRight: 12 },
  recetaText: { fontSize: 15, fontWeight: '500', color: colors.text },
  recetaTextActiva: { color: 'white', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: colors.card, marginBottom: 16, fontSize: 16 },
  resultado: { backgroundColor: colors.card, borderRadius: 16, padding: 16, elevation: 3 },
  resultadoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultadoEmoji: { fontSize: 40, marginRight: 12 },
  resultadoTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  resultadoPersonas: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  costoBox: { backgroundColor: colors.background, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  costoLabel: { fontSize: 13, color: colors.textLight },
  costoValor: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginTop: 4 },
  ingredientesTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  ingredienteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ingredienteNombre: { fontSize: 14, color: colors.text },
  ingredienteCantidad: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});