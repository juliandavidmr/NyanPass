import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { enUS, es, fr, pt } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Form, Input, ScrollView, Spinner, Text, View, XStack, YStack } from 'tamagui';
import { z } from 'zod';

import { useThemeColor } from '../hooks/useThemeColor';
import { CatProfileSchema, type TCatProfile } from '../services/models';
import { storageService } from '../services/storage';
import BreedSelector from './BreedSelector';
import { ThemedView } from './ThemedView';
import TraitsSelector from './TraitsSelector';

interface CatFormProps {
  catId?: string;
  onSave: (cat: TCatProfile) => void;
  onCancel: () => void;
}

const CatForm: React.FC<CatFormProps> = ({ catId, onSave, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [traits, setTraits] = useState<string[]>([]);

  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'color');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'color');

  // Obtener el locale para date-fns según el idioma actual
  const getLocale = () => {
    const language = i18n.language;
    switch (language) {
      case 'es': return es;
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      default: return es;
    }
  };

  // Esquema de validación con Zod
  const formSchema = z.object({
    name: z.string().min(1, t('general.required')),
    nickname: z.string().optional(),
    birthDate: z.date(),
    breed: z.string().min(1, t('general.required')),
    weight: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Debe ser un número mayor que 0',
    }),
  });

  type FormData = z.infer<typeof formSchema>;

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nickname: '',
      birthDate: new Date(),
      breed: '',
      weight: '',
    },
  });

  // Cargar datos del gato si estamos editando
  useEffect(() => {
    const loadCat = async () => {
      if (catId) {
        setLoading(true);
        try {
          const cat = await storageService.getCat(catId);
          if (cat) {
            reset({
              name: cat.name,
              nickname: cat.nickname || '',
              birthDate: cat.birthdate,
              breed: cat.breed,
              weight: cat.weightRecords.length > 0
                ? cat.weightRecords[cat.weightRecords.length - 1].weight.toString()
                : '',
            });
            setTraits(cat.traits || []);
          }
        } catch (error) {
          console.error('Error loading cat:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCat();
  }, [catId, reset]);

  // Manejar el envío del formulario
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Obtener la configuración para la unidad de peso preferida
      const settings = await storageService.getSettings();

      // Crear o actualizar el perfil del gato
      const weightRecord = {
        date: new Date(),
        weight: parseFloat(data.weight),
        unit: settings.weightUnit,
      };

      const catProfile: TCatProfile = CatProfileSchema.parse({
        id: catId || `cat-${Date.now()}`,
        name: data.name,
        nickname: data.nickname || undefined,
        birthdate: data.birthDate,
        breed: data.breed,
        traits: traits,
        weightRecords: [weightRecord],
        weightUnit: 'kg',
      } satisfies TCatProfile);

      // Si estamos editando, mantener los registros de peso anteriores
      if (catId) {
        const existingCat = await storageService.getCat(catId);
        if (existingCat) {
          // Mantener los registros de peso anteriores y agregar el nuevo
          catProfile.weightRecords = [
            ...existingCat.weightRecords,
            weightRecord,
          ];
        }
      }

      // Guardar el perfil
      if (catId) {
        await storageService.updateCat(catProfile);
      } else {
        await storageService.addCat(catProfile);
      }

      onSave(catProfile);
    } catch (error) {
      console.error('Error saving cat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <YStack gap={15} padding={20}>
            <Text style={[styles.title, { color: textColor }]}>
              {catId ? t('cat_form.title.edit') : t('cat_form.title.new')}
            </Text>

            {/* Nombre */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.name')}</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t('cat_form.name_placeholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </YStack>

            {/* Apodo */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.nickname')}</Text>
              <Controller
                control={control}
                name="nickname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t('cat_form.nickname_placeholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                )}
              />
            </YStack>

            {/* Fecha de nacimiento */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.birthdate')}</Text>
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      style={[styles.dateInput, { borderColor }]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: textColor }}>
                        {format(value, 'PPP', { locale: getLocale() })}
                      </Text>
                      <Calendar size={20} color={textColor} />
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={value}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            onChange(selectedDate);
                          }
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              />
            </YStack>

            {/* Raza */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.breed')}</Text>
              <Controller
                control={control}
                name="breed"
                render={({ field: { onChange, value } }) => (
                  <BreedSelector
                    value={value}
                    onChange={onChange}
                    placeholder={t('cat_form.breed_placeholder')}
                  />
                )}
              />
              {errors.breed && (
                <Text style={styles.errorText}>{errors.breed.message}</Text>
              )}
            </YStack>

            {/* Peso */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.weight')}</Text>
              <XStack gap={10} alignItems="center">
                <Controller
                  control={control}
                  name="weight"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      flex={1}
                      placeholder="0.0"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Text style={{ color: textColor }}>kg</Text>
              </XStack>
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight.message}</Text>
              )}
            </YStack>

            {/* Rasgos de personalidad */}
            <YStack gap={5}>
              <Text style={{ color: textColor }}>{t('cat_form.traits')}</Text>
              <TraitsSelector
                value={traits}
                onChange={setTraits}
                placeholder={t('cat_form.traits_placeholder')}
              />
            </YStack>

            {/* Botones */}
            <XStack gap={10} marginTop={20}>
              <Button flex={1} theme="gray" onPress={onCancel}>
                {t('general.cancel')}
              </Button>
              <Button flex={1} theme="active" onPress={handleSubmit(onSubmit)}>
                {t('general.save')}
              </Button>
            </XStack>
          </YStack>
        </Form>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default CatForm;