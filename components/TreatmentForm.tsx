import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, XStack, YStack, Button, Input, TextArea, Select, Switch } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Save, Calendar, Paperclip } from '@tamagui/lucide-icons';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { storageService } from '@/services/storage';
import { generateId } from '@/services/storage';

// Definir el esquema de validación con zod
const treatmentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  catId: z.string().min(1, 'Selecciona un gato'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  veterinarian: z.string().optional(),
  notes: z.string().optional(),
});

type TreatmentFormData = z.infer<typeof treatmentSchema>;

type TreatmentFormProps = {
  treatmentId?: string;
  catId?: string;
  onSave: () => void;
  onCancel: () => void;
};

export default function TreatmentForm({ treatmentId, catId, onSave, onCancel }: TreatmentFormProps) {
  const { t } = useTranslation();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Configurar el formulario con react-hook-form y zod
  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: '',
      catId: catId || '',
      dosage: '',
      frequency: '',
      veterinarian: '',
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

        // Si estamos editando un tratamiento existente, cargar sus datos
        if (treatmentId) {
          const treatment = await storageService.getTreatment(treatmentId);
          if (treatment) {
            setValue('name', treatment.name);
            setValue('catId', treatment.catId);
            setValue('dosage', treatment.dosage || '');
            setValue('frequency', treatment.frequency || '');
            setValue('veterinarian', treatment.veterinarian || '');
            setValue('notes', treatment.notes || '');
            setStartDate(treatment.startDate);
            
            if (treatment.endDate) {
              setEndDate(treatment.endDate);
              setHasEndDate(true);
            }
            
            if (treatment.attachments) {
              setAttachments(treatment.attachments);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert(t('general.error'), t('general.error_loading'));
      }
    };

    loadData();
  }, [treatmentId, setValue, t]);

  // Manejar el cambio de fecha de inicio
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Manejar el cambio de fecha de fin
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Manejar el guardado del formulario
  const onSubmit = async (data: TreatmentFormData) => {
    setLoading(true);
    try {
      const treatmentData = {
        ...data,
        id: treatmentId || generateId(),
        startDate,
        endDate: hasEndDate ? endDate : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      if (treatmentId) {
        await storageService.updateTreatment(treatmentData);
      } else {
        await storageService.addTreatment(treatmentData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving treatment:', error);
      Alert.alert(t('general.error'), t('general.error_saving'));
    } finally {
      setLoading(false);
    }
  };

  // Función para simular la adición de un archivo adjunto
  // En una implementación real, esto usaría la API de documentos o imágenes
  const handleAddAttachment = () => {
    Alert.alert(
      t('medical.attachment'),
      t('medical.attachment_placeholder'),
      [
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
        {
          text: t('general.add'),
          onPress: () => {
            // Simulamos la adición de un archivo
            const newAttachment = `attachment-${Date.now()}.jpg`;
            setAttachments([...attachments, newAttachment]);
          },
        },
      ],
    );
  };

  // Función para eliminar un archivo adjunto
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack padding={16} space={4}>
        <XStack alignItems="center" space={8} marginBottom={16}>
          <Button icon={<ChevronLeft size={24} />} onPress={onCancel} unstyled />
          <ThemedText type="title">
            {treatmentId ? t('medical.edit_treatment') : t('medical.add_treatment')}
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

            {/* Nombre del tratamiento */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.treatment_name')}
              </ThemedText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.treatment_name_placeholder')}
                  />
                )}
              />
              {errors.name && (
                <ThemedText style={styles.errorText}>{errors.name.message}</ThemedText>
              )}
            </YStack>

            {/* Fecha de inicio */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.start_date')}
              </ThemedText>
              <Button
                onPress={() => setShowStartDatePicker(true)}
                theme="gray"
                height={46}
                justifyContent="flex-start"
                icon={<Calendar size={18} />}
              >
                {startDate.toLocaleDateString()}
              </Button>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  maximumDate={new Date()}
                />
              )}
            </YStack>

            {/* Fecha de fin (opcional) */}
            <YStack>
              <XStack alignItems="center" justifyContent="space-between">
                <ThemedText type="defaultSemiBold">
                  {t('medical.end_date')}
                </ThemedText>
                <Switch
                  checked={hasEndDate}
                  onCheckedChange={setHasEndDate}
                />
              </XStack>
              {hasEndDate && (
                <Button
                  onPress={() => setShowEndDatePicker(true)}
                  theme="gray"
                  height={46}
                  justifyContent="flex-start"
                  icon={<Calendar size={18} />}
                  marginTop={8}
                >
                  {endDate ? endDate.toLocaleDateString() : t('medical.select_date')}
                </Button>
              )}
              {showEndDatePicker && hasEndDate && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}
            </YStack>

            {/* Dosis */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.dosage')}
              </ThemedText>
              <Controller
                control={control}
                name="dosage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.dosage_placeholder')}
                  />
                )}
              />
            </YStack>

            {/* Frecuencia */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.frequency')}
              </ThemedText>
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.frequency_placeholder')}
                  />
                )}
              />
            </YStack>

            {/* Veterinario */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.veterinarian')}
              </ThemedText>
              <Controller
                control={control}
                name="veterinarian"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('medical.veterinarian_placeholder')}
                  />
                )}
              />
            </YStack>

            {/* Archivos adjuntos */}
            <YStack>
              <ThemedText type="defaultSemiBold" marginBottom={4}>
                {t('medical.attachments')}
              </ThemedText>
              <Button
                onPress={handleAddAttachment}
                theme="gray"
                icon={<Paperclip size={18} />}
              >
                {t('medical.add_attachment')}
              </Button>
              {attachments.length > 0 && (
                <YStack marginTop={8} space={4}>
                  {attachments.map((attachment, index) => (
                    <XStack key={index} justifyContent="space-between" alignItems="center">
                      <ThemedText>{attachment}</ThemedText>
                      <Button
                        size="$2"
                        theme="red"
                        onPress={() => handleRemoveAttachment(index)}
                      >
                        {t('general.remove')}
                      </Button>
                    </XStack>
                  ))}
                </YStack>
              )}
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