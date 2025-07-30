import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Check } from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { enUS, es, fr, pt } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Form, Input, Select, Spinner, Text, XStack, YStack } from 'tamagui';
import { z } from 'zod';

import { useThemeColor } from '../hooks/useThemeColor';
import { VaccineSchema, type TCatProfile, type TVaccine } from '../services/models';
import { generateId, storageService } from '../services/storage';

interface VaccineFormProps {
  vaccineId?: string;
  catId?: string;
  onSave: (vaccine: TVaccine) => void;
  onCancel: () => void;
}

const VaccineForm: React.FC<VaccineFormProps> = ({ vaccineId, catId, onSave, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState<TCatProfile[]>([]);
  const [showApplicationDatePicker, setShowApplicationDatePicker] = useState(false);
  const [showNextDoseDatePicker, setShowNextDoseDatePicker] = useState(false);

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
    catId: z.string().min(1, t('general.required')),
    applicationDate: z.date(),
    nextDoseDate: z.date().optional(),
    notes: z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      catId: catId || '',
      applicationDate: new Date(),
      nextDoseDate: undefined,
      notes: '',
    },
  });

  // Cargar la lista de gatos
  useEffect(() => {
    const loadCats = async () => {
      try {
        const allCats = await storageService.getCats();
        setCats(allCats);
      } catch (error) {
        console.error('Error loading cats:', error);
      }
    };

    loadCats();
  }, []);

  // Cargar datos de la vacuna si estamos editando
  useEffect(() => {
    const loadVaccine = async () => {
      if (vaccineId) {
        setLoading(true);
        try {
          const vaccine = await storageService.getVaccine(vaccineId);
          if (vaccine) {
            reset({
              name: vaccine.name,
              catId: vaccine.catId,
              applicationDate: vaccine.applicationDate,
              nextDoseDate: vaccine.nextDoseDate,
              notes: vaccine.notes || '',
            });
          }
        } catch (error) {
          console.error('Error loading vaccine:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadVaccine();
  }, [vaccineId, reset]);

  // Manejar el envío del formulario
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const vaccine: TVaccine = VaccineSchema.parse({
        id: vaccineId || generateId(),
        name: data.name,
        catId: data.catId,
        applicationDate: data.applicationDate,
        nextDoseDate: data.nextDoseDate,
        notes: data.notes,
      } satisfies TVaccine);

      // Guardar la vacuna
      if (vaccineId) {
        const existingVaccine = await storageService.getVaccine(vaccineId);
        if (existingVaccine) {
          vaccine.createdAt = existingVaccine.createdAt;
        }
        await storageService.updateVaccine(vaccine);
      } else {
        await storageService.addVaccine(vaccine);
      }

      onSave(vaccine);
    } catch (error) {
      console.error('Error saving vaccine:', error);
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <YStack gap={15} padding={20}>
          <Text style={[styles.title, { color: textColor }]}>
            {vaccineId ? t('vaccine_form.title.edit') : t('vaccine_form.title.new')}
          </Text>

          {/* Nombre de la vacuna */}
          <YStack gap={5}>
            <Text style={{ color: textColor }}>{t('vaccine_form.name')}</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('vaccine_form.name_placeholder')}
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

          {/* Selector de gato */}
          <YStack gap={5}>
            <Text style={{ color: textColor }}>{t('vaccine_form.cat')}</Text>
            <Controller
              control={control}
              name="catId"
              render={({ field: { onChange, value } }) => (
                <Select value={value} onValueChange={onChange}>
                  <Select.Trigger iconAfter={<Check size={16} />}>
                    <Select.Value placeholder="Seleccionar gato" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.ScrollUpButton />
                    <Select.Viewport>
                      <Select.Group>
                        {cats.map((cat, index) => (
                          <Select.Item key={cat.id} index={index} value={cat.id}>
                            <Select.ItemText>{cat.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton />
                  </Select.Content>
                </Select>
              )}
            />
            {errors.catId && (
              <Text style={styles.errorText}>{errors.catId.message}</Text>
            )}
          </YStack>

          {/* Fecha de aplicación */}
          <YStack gap={5}>
            <Text style={{ color: textColor }}>{t('vaccine_form.application_date')}</Text>
            <Controller
              control={control}
              name="applicationDate"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.dateInput, { borderColor }]}
                    onPress={() => setShowApplicationDatePicker(true)}
                  >
                    <Text style={{ color: textColor }}>
                      {format(value, 'PPP', { locale: getLocale() })}
                    </Text>
                    <Calendar size={20} color={textColor} />
                  </TouchableOpacity>

                  {showApplicationDatePicker && (
                    <DateTimePicker
                      value={value}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowApplicationDatePicker(Platform.OS === 'ios');
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

          {/* Fecha de próxima dosis */}
          <YStack gap={5}>
            <Text style={{ color: textColor }}>{t('vaccine_form.next_dose_date')}</Text>
            <Controller
              control={control}
              name="nextDoseDate"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.dateInput, { borderColor }]}
                    onPress={() => setShowNextDoseDatePicker(true)}
                  >
                    <Text style={{ color: textColor }}>
                      {value ? format(value, 'PPP', { locale: getLocale() }) : t('general.optional')}
                    </Text>
                    <Calendar size={20} color={textColor} />
                  </TouchableOpacity>

                  {showNextDoseDatePicker && (
                    <DateTimePicker
                      value={value || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowNextDoseDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          onChange(selectedDate);
                        }
                      }}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}
            />
          </YStack>

          {/* Notas */}
          <YStack gap={5}>
            <Text style={{ color: textColor }}>{t('vaccine_form.notes')}</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('vaccine_form.notes_placeholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  height={100}
                  textAlignVertical="top"
                />
              )}
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

export default VaccineForm;