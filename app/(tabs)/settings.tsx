import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Switch } from 'tamagui';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UserProfile from '@/components/UserProfile';
import { APP_LANGUAGES } from '@/constants/appLanguages';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LengthUnitSchema, type TDateFormat, type TLengthUnit, type TSettings, type TWeightUnit, WeightUnitSchema } from '@/services/models';
import { storageService } from '@/services/storage';


// Configuración inicial
const initialSettings: TSettings = {
  language: APP_LANGUAGES.EN,
  weightUnit: 'kg',
  lengthUnit: 'cm',
  dateFormat: 'DD/MM/YYYY',
  darkMode: false,
  offlineMode: false,
};

// Opciones para los selectores
const languageOptions: { value: APP_LANGUAGES; label: string }[] = [
  { value: APP_LANGUAGES.ES, label: 'Español' },
  { value: APP_LANGUAGES.EN, label: 'English' },
  { value: APP_LANGUAGES.FR, label: 'Français' },
  { value: APP_LANGUAGES.PT, label: 'Português' },
];

const weightUnitOptions: { value: TWeightUnit; label: string }[] = [
  { value: WeightUnitSchema.enum.kg, label: 'Kilogramos (kg)' },
  { value: WeightUnitSchema.enum.lbs, label: 'Libras (lbs)' },
];

const lengthUnitOptions: { value: TLengthUnit; label: string }[] = [
  { value: LengthUnitSchema.enum.cm, label: 'Centímetros (cm)' },
  { value: LengthUnitSchema.enum.in, label: 'Pulgadas (in)' },
];

const dateFormatOptions: { value: TDateFormat; label: string }[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<TSettings>(initialSettings);
  const colorScheme = useColorScheme() ?? 'light';

  // Cargar configuraciones al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await storageService.getSettings();
        setSettings({
          language: storedSettings.language,
          weightUnit: storedSettings.weightUnit,
          lengthUnit: storedSettings.lengthUnit,
          dateFormat: storedSettings.dateFormat,
          darkMode: storedSettings.darkMode,
          offlineMode: storedSettings.offlineMode,
        });
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      }
    };

    loadSettings();
  }, []);

  // Función para actualizar una configuración
  const updateSetting = <K extends keyof TSettings>(key: K, value: TSettings[K]) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(newSettings);

    // Guardar en Firebase
    const storageSettings: TSettings = {
      language: newSettings.language,
      weightUnit: newSettings.weightUnit,
      lengthUnit: newSettings.lengthUnit,
      dateFormat: newSettings.dateFormat,
      darkMode: newSettings.darkMode,
      offlineMode: newSettings.offlineMode,
    };

    storageService.saveSettings(storageSettings).catch(error => {
      console.error('Error al guardar configuraciones:', error);
    });
  };

  // Renderizar un selector de opciones
  const renderSelector = <T extends string>(
    title: string,
    options: { value: T; label: string }[],
    currentValue: T,
    onSelect: (value: T) => void,
    icon: any
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
    icon: any
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
      <Stack.Screen options={{ title: 'Ajustes', headerShown: false }} />

      <ThemedText type="title" style={styles.screenTitle}>Ajustes</ThemedText>

      {/* Perfil de usuario */}
      <ThemedView style={styles.profileSection}>
        <UserProfile />
      </ThemedView>

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
  profileSection: {
    marginBottom: 24,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
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