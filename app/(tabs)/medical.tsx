import { AlertTriangle, Edit3, Pill, Trash2 } from '@tamagui/lucide-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Spinner, Tabs, View } from 'tamagui';

import { ThemedText } from '@/components/ThemedText';
import AllergyForm from '../../components/AllergyForm';
import { ThemedView } from '../../components/ThemedView';
import TreatmentForm from '../../components/TreatmentForm';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { formatDate } from '../../config/i18n';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { storageService } from '../../services/storage';
import type { TAllergy, TTreatment } from '../../services/models';

// Tipos para el historial médico
type Severity = 'low' | 'medium' | 'high';

type Allergy = {
  id: string;
  catId: string;
  name: string;
  symptoms: string;
  severity: Severity;
  diagnosisDate: Date;
  notes?: string;
};

type Treatment = {
  id: string;
  catId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  dosage?: string;
  frequency?: string;
  veterinarian?: string;
  notes?: string;
  attachments?: string[];
};

type MedicalRecord = Allergy | Treatment;

// Función para determinar si un objeto es una alergia
const isAllergy = (record: MedicalRecord): record is Allergy => {
  return 'severity' in record && 'symptoms' in record;
};

export default function MedicalScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<'all' | 'allergies' | 'treatments'>('all');
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [selectedAllergyId, setSelectedAllergyId] = useState<string | undefined>(undefined);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | undefined>(undefined);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [allAllergies, allTreatments, allCats] = await Promise.all([
        storageService.getAllAllergies(),
        storageService.getAllTreatments(),
        storageService.getCats()
      ]);
      setAllergies(allAllergies);
      setTreatments(allTreatments);
      setCats(allCats);
    } catch (error) {
      console.error('Error loading medical data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Obtener el nombre del gato por su ID
  const getCatName = (catId: string): string => {
    const cat = cats.find(c => c.id === catId);
    return cat ? cat.name : 'Desconocido';
  };

  // Filtrar registros médicos según la pestaña activa
  const getFilteredRecords = (): MedicalRecord[] => {
    switch (activeTab) {
      case 'allergies':
        return allergies;
      case 'treatments':
        return treatments;
      case 'all':
      default:
        return [...allergies, ...treatments];
    }
  };

  // Función para obtener el color según la severidad
  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case 'low':
        return '#27ae60'; // verde
      case 'medium':
        return '#f39c12'; // naranja
      case 'high':
        return '#e74c3c'; // rojo
      default:
        return Colors[colorScheme!].tint;
    }
  };

  // Manejar la adición de una nueva alergia
  const handleAddAllergy = (catId?: string) => {
    setSelectedAllergyId(undefined);
    setSelectedCatId(catId);
    setShowAllergyForm(true);
  };

  // Manejar la edición de una alergia existente
  const handleEditAllergy = (allergyId: string) => {
    setSelectedAllergyId(allergyId);
    setSelectedCatId(undefined);
    setShowAllergyForm(true);
  };

  // Manejar la eliminación de una alergia
  const handleDeleteAllergy = async (allergy: TAllergy) => {
    Alert.alert(
      t('general.delete'),
      t('medical.delete_allergy_confirm'),
      [
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
        {
          text: t('general.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteAllergy(allergy.catId, allergy.id);
              loadData();
            } catch (error) {
              console.error('Error deleting allergy:', error);
            }
          },
        },
      ],
    );
  };

  // Manejar la adición de un nuevo tratamiento
  const handleAddTreatment = (catId?: string) => {
    setSelectedTreatmentId(undefined);
    setSelectedCatId(catId);
    setShowTreatmentForm(true);
  };

  // Manejar la edición de un tratamiento existente
  const handleEditTreatment = (treatmentId: string) => {
    setSelectedTreatmentId(treatmentId);
    setSelectedCatId(undefined);
    setShowTreatmentForm(true);
  };

  // Manejar la eliminación de un tratamiento
  const handleDeleteTreatment = async (treatment: TTreatment) => {
    Alert.alert(
      t('general.delete'),
      t('medical.delete_treatment_confirm'),
      [
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
        {
          text: t('general.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteTreatment(treatment.catId, treatment.id);
              loadData();
            } catch (error) {
              console.error('Error deleting treatment:', error);
            }
          },
        },
      ],
    );
  };

  // Manejar el guardado de una alergia
  const handleSaveAllergy = () => {
    setShowAllergyForm(false);
    loadData();
  };

  // Manejar el guardado de un tratamiento
  const handleSaveTreatment = () => {
    setShowTreatmentForm(false);
    loadData();
  };

  // Renderizar un registro médico (alergia o tratamiento)
  const renderMedicalRecord = ({ item }: { item: MedicalRecord }) => {
    if (isAllergy(item)) {
      // Renderizar una alergia
      return (
        <TouchableOpacity
          style={styles.medicalCard}
          activeOpacity={0.7}
          onPress={() => handleEditAllergy(item.id)}
        >
          <View style={styles.iconContainer}>
            <AlertTriangle size={24} color={getSeverityColor(item.severity)} />
          </View>

          <View style={styles.medicalInfo}>
            <View style={styles.headerRow}>
              <ThemedText type="defaultSemiBold" style={styles.medicalName}>
                {t('medical.allergy')}: {item.name}
              </ThemedText>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                <ThemedText style={styles.severityText}>{t(`medical.severity.${item.severity}`)}</ThemedText>
              </View>
            </View>

            <ThemedText>
              {t('medical.symptoms')}: {item.symptoms}
            </ThemedText>

            <ThemedText>
              {t('medical.cat')}: {getCatName(item.catId)}
            </ThemedText>

            <ThemedText>
              {t('medical.diagnosis_date')}: {formatDate(item.diagnosisDate)}
            </ThemedText>

            {item.notes && (
              <ThemedText style={styles.notes}>
                {item.notes}
              </ThemedText>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEditAllergy(item.id)}>
                <Edit3 size={20} color={Colors[colorScheme!].tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteAllergy(item.id)}>
                <Trash2 size={20} color={Colors[colorScheme!].tint} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Renderizar un tratamiento
      const isOngoing = !item.endDate || item.endDate > new Date();

      return (
        <TouchableOpacity
          style={styles.medicalCard}
          activeOpacity={0.7}
          onPress={() => handleEditTreatment(item.id)}
        >
          <View style={styles.iconContainer}>
            <Pill
              size={24}
              color={isOngoing ? Colors[colorScheme!].tint : Colors[colorScheme!].icon}
            />
          </View>

          <View style={styles.medicalInfo}>
            <View style={styles.headerRow}>
              <ThemedText type="defaultSemiBold" style={styles.medicalName}>
                {t('medical.treatment')}: {item.name}
              </ThemedText>
              {isOngoing && (
                <View style={styles.ongoingBadge}>
                  <ThemedText style={styles.ongoingText}>{t('medical.ongoing')}</ThemedText>
                </View>
              )}
            </View>

            <ThemedText>
              {t('medical.cat')}: {getCatName(item.catId)}
            </ThemedText>

            <ThemedText>
              {t('medical.start_date')}: {formatDate(item.startDate)}
              {item.endDate && ` • ${t('medical.end_date')}: ${formatDate(item.endDate)}`}
            </ThemedText>

            {(item.dosage || item.frequency) && (
              <ThemedText>
                {item.dosage && `${t('medical.dosage')}: ${item.dosage}`}
                {item.dosage && item.frequency && ' • '}
                {item.frequency && `${t('medical.frequency')}: ${item.frequency}`}
              </ThemedText>
            )}

            {item.veterinarian && (
              <ThemedText>
                {t('medical.veterinarian')}: {item.veterinarian}
              </ThemedText>
            )}

            {item.notes && (
              <ThemedText style={styles.notes}>
                {item.notes}
              </ThemedText>
            )}

            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentRow}>
                <IconSymbol name="paperclip" size={16} color={Colors[colorScheme!].icon} />
                <ThemedText style={styles.attachmentText}>
                  {item.attachments.length} {item.attachments.length === 1 ?
                    t('medical.attachment_single') : t('medical.attachment_multiple')}
                </ThemedText>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEditTreatment(item.id)}>
                <Edit3 size={20} color={Colors[colorScheme!].tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTreatment(item.id)}>
                <Trash2 size={20} color={Colors[colorScheme!].tint} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('medical.title'), headerShown: true }} />

      <View style={styles.header}>
        <ThemedText type="title">{t('medical.title')}</ThemedText>
        <View style={styles.headerButtons}>
          <Button
            size="$3"
            theme="active"
            onPress={() => handleAddAllergy()}
            icon={<AlertTriangle size={18} />}
          >
            {t('medical.add_allergy')}
          </Button>
          <Button
            size="$3"
            theme="active"
            onPress={() => handleAddTreatment()}
            icon={<Pill size={18} />}
            marginLeft={8}
          >
            {t('medical.add_treatment')}
          </Button>
        </View>
      </View>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'all' | 'allergies' | 'treatments')}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
      >
        <Tabs.List>
          <Tabs.Tab value="all">
            <ThemedText>{t('medical.all')}</ThemedText>
          </Tabs.Tab>
          <Tabs.Tab value="allergies">
            <ThemedText>{t('medical.allergies')}</ThemedText>
          </Tabs.Tab>
          <Tabs.Tab value="treatments">
            <ThemedText>{t('medical.treatments')}</ThemedText>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Content value="all" flex={1}>
          {renderTabContent(getFilteredRecords())}
        </Tabs.Content>

        <Tabs.Content value="allergies" flex={1}>
          {renderTabContent(allergies)}
        </Tabs.Content>

        <Tabs.Content value="treatments" flex={1}>
          {renderTabContent(treatments)}
        </Tabs.Content>
      </Tabs>

      {/* Modal para el formulario de alergia */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAllergyForm}
        onRequestClose={() => setShowAllergyForm(false)}
      >
        <AllergyForm
          allergyId={selectedAllergyId}
          catId={selectedCatId}
          onSave={handleSaveAllergy}
          onCancel={() => setShowAllergyForm(false)}
        />
      </Modal>

      {/* Modal para el formulario de tratamiento */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showTreatmentForm}
        onRequestClose={() => setShowTreatmentForm(false)}
      >
        <TreatmentForm
          treatmentId={selectedTreatmentId}
          catId={selectedCatId}
          onSave={handleSaveTreatment}
          onCancel={() => setShowTreatmentForm(false)}
        />
      </Modal>
    </ThemedView>
  );

  // Función para renderizar el contenido de la pestaña
  function renderTabContent(records: MedicalRecord[]) {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      );
    }

    if (records.length === 0) {
      return (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="heart.text.square" size={60} color={Colors[colorScheme!].icon} />
          <ThemedText style={styles.emptyText}>{t('medical.empty')}</ThemedText>
          <View style={styles.emptyButtons}>
            <TouchableOpacity
              style={[styles.addMedicalButton, { backgroundColor: Colors[colorScheme!].tint }]}
              onPress={() => handleAddAllergy()}
            >
              <ThemedText style={styles.addMedicalButtonText}>{t('medical.add_allergy')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addMedicalButton, { backgroundColor: Colors[colorScheme!].tint }]}
              onPress={() => handleAddTreatment()}
            >
              <ThemedText style={styles.addMedicalButtonText}>{t('medical.add_treatment')}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      );
    }

    return (
      <FlatList
        data={records}
        renderItem={renderMedicalRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  medicalCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicalName: {
    fontSize: 16,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ongoingBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  ongoingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  attachmentText: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButtons: {
    gap: 12,
  },
  addMedicalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  addMedicalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});