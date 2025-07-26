import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Switch } from 'tamagui';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Tipos para las configuraciones
type Language = 'es' | 'en' | 'fr' | 'pt';
type WeightUnit = 'kg' | 'lbs';
type LengthUnit = 'cm' | 'in';
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY';

type Settings = {
  language: Language;
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  dateFormat: DateFormat;
  darkMode: boolean;
  offlineMode: boolean;
};

// Datos de ejemplo
const initialSettings: Settings = {
  language: 'es',
  weightUnit: 'kg',
  lengthUnit: 'cm',
  dateFormat: 'DD/MM/YYYY',
  darkMode: false,
  offlineMode: false,
};

// Opciones para los selectores
const languageOptions: { value: Language; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'pt', label: 'Português' },
];

const weightUnitOptions: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lbs', label: 'Libras (lbs)' },
];

const lengthUnitOptions: { value: LengthUnit; label: string }[] = [
  { value: 'cm', label: 'Centímetros (cm)' },
  { value: 'in', label: 'Pulgadas (in)' },
];

const dateFormatOptions: { value: DateFormat; label: string }[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const colorScheme = useColorScheme() ?? 'light';

  // Función para actualizar una configuración
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Renderizar un selector de opciones
  const renderSelector = <T extends string>(
    title: string,
    options: { value: T; label: string }[],
    currentValue: T,
    onSelect: (value: T) => void,
    icon: string
  ) => (
    <ThemedView style={styles.settingSection}>
      <ThemedView style={styles.settingHeader}>
        <IconSymbol name={icon} size={20} color={Colors[colorScheme].icon} />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              currentValue === option.value && {
                backgroundColor: Colors[colorScheme].tint,
              },
            ]}
            onPress={() => onSelect(option.value)}
          >
            <ThemedText>
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );

  // Renderizar un toggle switch
  const renderToggle = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: string
  ) => (
    <ThemedView style={styles.settingSection}>
      <ThemedView style={styles.toggleContainer}>
        <ThemedView style={styles.toggleInfo}>
          <ThemedView style={styles.settingHeader}>
            <IconSymbol name={icon} size={20} color={Colors[colorScheme].icon} />
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.toggleDescription}>{description}</ThemedText>
        </ThemedView>

        <Switch
          size="$4"
          defaultChecked={value}
          onCheckedChange={onToggle}
          nativeProps={{
            accessibilityLabel: title,
            trackColor: { false: '#767577', true: Colors[colorScheme].tint }
          }}
        >
          <Switch.Thumb animation="bouncy" />
        </Switch>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Ajustes', headerShown: true }} />

      <ThemedText type="title" style={styles.screenTitle}>Ajustes</ThemedText>

      {renderSelector(
        'Idioma',
        languageOptions,
        settings.language,
        (value) => updateSetting('language', value),
        'globe'
      )}

      {renderSelector(
        'Unidad de Peso',
        weightUnitOptions,
        settings.weightUnit,
        (value) => updateSetting('weightUnit', value),
        'scalemass'
      )}

      {renderSelector(
        'Unidad de Longitud',
        lengthUnitOptions,
        settings.lengthUnit,
        (value) => updateSetting('lengthUnit', value),
        'ruler'
      )}

      {renderSelector(
        'Formato de Fecha',
        dateFormatOptions,
        settings.dateFormat,
        (value) => updateSetting('dateFormat', value),
        'calendar'
      )}

      {renderToggle(
        'Modo Oscuro',
        'Cambiar entre tema claro y oscuro',
        settings.darkMode,
        () => updateSetting('darkMode', !settings.darkMode),
        'moon.fill'
      )}

      {renderToggle(
        'Modo Sin Conexión',
        'Guardar datos localmente sin sincronización',
        settings.offlineMode,
        () => updateSetting('offlineMode', !settings.offlineMode),
        'wifi.slash'
      )}

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>NyanPass v1.0.0</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    marginBottom: 24,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 28,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    opacity: 0.5,
    fontSize: 12,
  },
});