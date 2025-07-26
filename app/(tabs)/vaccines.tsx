import { Edit3, Plus, Trash2 } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Modal, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Button, Spinner, Stack, Text, View, XStack } from 'tamagui';

import VaccineForm from '../../components/VaccineForm';
import Colors from '../../constants/Colors';
import { formatDate } from '../../services/i18n';
import { CatProfile, storageService, Vaccine } from '../../services/storage';

// Función para verificar si una vacuna está vencida o próxima
const checkVaccineStatus = (nextDoseDate?: Date): { status: 'expired' | 'upcoming' | 'ok'; daysRemaining: number } => {
  if (!nextDoseDate) return { status: 'ok', daysRemaining: 0 };

  const today = new Date();
  const timeDiff = nextDoseDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining: Math.abs(daysRemaining) };
  } else if (daysRemaining <= 30) {
    return { status: 'upcoming', daysRemaining };
  }

  return { status: 'ok', daysRemaining };
};

export default function VaccinesScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string | undefined>(undefined);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  // Cargar la lista de vacunas y gatos
  const loadData = async () => {
    setLoading(true);
    try {
      const [allVaccines, allCats] = await Promise.all([
        storageService.getVaccines(),
        storageService.getCats()
      ]);
      setVaccines(allVaccines);
      setCats(allCats);
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Manejar la creación de una nueva vacuna
  const handleAddVaccine = (catId?: string) => {
    setSelectedVaccineId(undefined);
    setSelectedCatId(catId);
    setShowForm(true);
  };

  // Manejar la edición de una vacuna existente
  const handleEditVaccine = (vaccineId: string) => {
    setSelectedVaccineId(vaccineId);
    setSelectedCatId(undefined);
    setShowForm(true);
  };

  // Manejar la eliminación de una vacuna
  const handleDeleteVaccine = async (vaccineId: string) => {
    Alert.alert(
      t('general.delete'),
      '¿Estás seguro de que deseas eliminar esta vacuna? Esta acción no se puede deshacer.',
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
              await storageService.deleteVaccine(vaccineId);
              loadData();
            } catch (error) {
              console.error('Error deleting vaccine:', error);
            }
          },
        },
      ],
    );
  };

  // Manejar el guardado de una vacuna
  const handleSaveVaccine = (vaccine: Vaccine) => {
    setShowForm(false);
    loadData();
  };

  // Renderizar una tarjeta de vacuna
  const renderVaccineCard = ({ item }: { item: Vaccine }) => {
    const vaccineStatus = checkVaccineStatus(item.nextDoseDate);

    // Determinar el color según el estado de la vacuna
    let statusColor = '';
    let statusText = '';

    if (vaccineStatus.status === 'expired') {
      statusColor = '#FF3B30'; // Rojo para vacunas vencidas
      statusText = t('vaccines.expired');
    } else if (vaccineStatus.status === 'upcoming') {
      statusColor = '#FF9500'; // Naranja para vacunas próximas
      statusText = t('vaccines.upcoming');
    }

    return (
      <TouchableOpacity
        style={styles.vaccineCard}
        onPress={() => handleEditVaccine(item.id)}
      >
        <View style={styles.vaccineCardContent}>
          <View style={styles.vaccineInfo}>
            <Text type="title">{item.name}</Text>
            <Text>Gato: {getCatName(item.catId)}</Text>
            <Text>{t('vaccines.applied')}: {formatDate(item.applicationDate, 'DD/MM/YYYY')}</Text>
            {item.nextDoseDate && (
              <Text>{t('vaccines.next_dose')}: {formatDate(item.nextDoseDate, 'DD/MM/YYYY')}</Text>
            )}
            {item.notes && (
              <Text style={styles.notes}>{item.notes}</Text>
            )}
          </View>

          {vaccineStatus.status !== 'ok' && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          )}

          <XStack gap={10}>
            <TouchableOpacity onPress={() => handleEditVaccine(item.id)}>
              <Edit3 size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteVaccine(item.id)}>
              <Trash2 size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </XStack>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack space={16} paddingHorizontal={16} paddingTop={16}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text>{t('vaccines.title')}</Text>
          <Button size="$3" theme="active" onPress={() => handleAddVaccine()} icon={<Plus size={18} />}>
            {t('vaccines.add')}
          </Button>
        </XStack>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Spinner size="large" />
          </View>
        ) : vaccines.length > 0 ? (
          <FlatList
            data={vaccines}
            renderItem={renderVaccineCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text>{t('vaccines.empty')}</Text>
          </View>
        )}
      </Stack>

      {/* Modal para el formulario de vacuna */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showForm}
        onRequestClose={() => setShowForm(false)}
      >
        <VaccineForm
          vaccineId={selectedVaccineId}
          catId={selectedCatId}
          onSave={handleSaveVaccine}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </View>
  );
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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  listContent: {
    paddingBottom: 20,
  },
  vaccineCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  expiringSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  vaccineIconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 18,
    marginBottom: 4,
  },
  expiredText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  expiringSoonText: {
    color: '#f39c12',
    fontWeight: '600',
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
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
  addVaccineButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addVaccineButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});