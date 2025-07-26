import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Save } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Select, Stack, TextArea, XStack, YStack } from 'tamagui';
import { z } from 'zod';

import { generateId, storageService } from '@/services/storage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Definir el esquema de validación con zod
const allergySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  catId: z.string().min(1, 'Selecciona un gato'),
  symptoms: z.string().min(1, 'Los síntomas son requeridos'),
  severity: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
});

type AllergyFormData = z.infer<typeof allergySchema>;

type AllergyFormProps = {
  allergyId?: string;
  catId?: string;
  onSave: () => void;
  onCancel: () => void;
};

export default function AllergyForm({ allergyId, catId, onSave, onCancel }: AllergyFormProps) {
  const { t } = useTranslation();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnosisDate, setDiagnosisDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Configurar el formulario con react-hook-form y zod
  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      name: '',
      catId: catId || '',
      symptoms: '',
      severity: 'medium',
      notes: '',
    },
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar la lista de gatos
        const allCats = await storageService.getCats();
        setCats(allCats);

        // Si estamos editando una alergia existente, cargar sus datos
        if (allergyId) {
          const allergy = await storageService.getAllergy(allergyId);
          if (allergy) {
            setValue('name', allergy.name);
            setValue('catId', allergy.catId);
            setValue('symptoms', allergy.symptoms);
            setValue('severity', allergy.severity);
            setValue('notes', allergy.notes || '');
            setDiagnosisDate(allergy.diagnosisDate);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert(t('general.error'), t('general.error_loading'));
      }
    };

    loadData();
  }, [allergyId, setValue, t]);

  // Manejar el cambio de fecha
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDiagnosisDate(selectedDate);
    }
  };

  // Manejar el guardado del formulario
  const onSubmit = async (data: AllergyFormData) => {
    setLoading(true);
    try {
      const allergyData = {
        ...data,
        id: allergyId || generateId(),
        diagnosisDate,
      };

      if (allergyId) {
        await storageService.updateAllergy(allergyData);
      } else {
        await storageService.addAllergy(allergyData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving allergy:', error);
      Alert.alert(t('general.error'), t('general.error_saving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack padding={16} space={4}>
        <XStack alignItems="center" space={8} marginBottom={16}>
          <Button icon={<ChevronLeft size={24} />} onPress={onCancel} unstyled />
          <ThemedText type="title">
            {allergyId ? t('medical.edit_allergy') : t('medical.add_allergy')}
          </ThemedText>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack space={16} paddingBottom={100}>
            {/* Selector de gato */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.cat')}
              </ThemedText>
              <Controller
                control={control}
                name="catId"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    disablePreventBodyScroll
                  >
                    <Select.Trigger width="100%" iconAfter={<ChevronLeft size={16} />}>
                      <Select.Value placeholder={t('medical.select_cat')} />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.ScrollUpButton />
                      <Select.Viewport>
                        <Select.Group>
                          {cats.map((cat) => (
                            <Select.Item key={cat.id} value={cat.id}>
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
                <ThemedText style={styles.errorText}>{errors.catId.message}</ThemedText>
              )}
            </YStack>

            {/* Nombre de la alergia */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.allergy_name')}
              </ThemedText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.allergy_name_placeholder')}
                  />
                )}
              />
              {errors.name && (
                <ThemedText style={styles.errorText}>{errors.name.message}</ThemedText>
              )}
            </YStack>

            {/* Síntomas */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.symptoms')}
              </ThemedText>
              <Controller
                control={control}
                name="symptoms"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.symptoms_placeholder')}
                  />
                )}
              />
              {errors.symptoms && (
                <ThemedText style={styles.errorText}>{errors.symptoms.message}</ThemedText>
              )}
            </YStack>

            {/* Fecha de diagnóstico */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.diagnosis_date')}
              </ThemedText>
              <Button
                onPress={() => setShowDatePicker(true)}
                theme="gray"
                height={46}
                justifyContent="flex-start"
              >
                {diagnosisDate.toLocaleDateString()}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={diagnosisDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </YStack>

            {/* Severidad */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.severity.label')}
              </ThemedText>
              <Controller
                control={control}
                name="severity"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    disablePreventBodyScroll
                  >
                    <Select.Trigger width="100%" iconAfter={<ChevronLeft size={16} />}>
                      <Select.Value placeholder={t('medical.select_severity')} />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.ScrollUpButton />
                      <Select.Viewport>
                        <Select.Group>
                          <Select.Item value="low">
                            <Select.ItemText>{t('medical.severity.low')}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="medium">
                            <Select.ItemText>{t('medical.severity.medium')}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="high">
                            <Select.ItemText>{t('medical.severity.high')}</Select.ItemText>
                          </Select.Item>
                        </Select.Group>
                      </Select.Viewport>
                      <Select.ScrollDownButton />
                    </Select.Content>
                  </Select>
                )}
              />
            </YStack>

            {/* Notas */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('general.notes')}
              </ThemedText>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextArea
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('general.notes_placeholder')}
                    minHeight={100}
                  />
                )}
              />
            </YStack>

            {/* Botón de guardar */}
            <Button
              theme="active"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              icon={<Save size={18} />}
              marginTop={16}
            >
              {t('general.save')}
            </Button>
          </YStack>
        </ScrollView>
      </Stack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});