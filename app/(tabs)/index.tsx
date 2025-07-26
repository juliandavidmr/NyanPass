import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import CatForm from '@/components/CatForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Tipo para los perfiles de gatos
type CatProfile = {
  id: string;
  name: string;
  nickname?: string;
  birthdate: Date;
  breed: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  traits: string[];
  image?: string;
};

// Datos de ejemplo
const sampleCats: CatProfile[] = [
  {
    id: '1',
    name: 'Luna',
    nickname: 'Lunita',
    birthdate: new Date('2020-05-15'),
    breed: 'Siamés',
    weight: 4.2,
    weightUnit: 'kg',
    traits: ['#juguetón', '#cariñoso', '#curioso'],
    image: 'https://placekitten.com/200/200',
  },
  {
    id: '2',
    name: 'Simba',
    birthdate: new Date('2019-10-10'),
    breed: 'Maine Coon',
    weight: 7.5,
    weightUnit: 'kg',
    traits: ['#tranquilo', '#independiente'],
    image: 'https://placekitten.com/201/201',
  },
];

// Servicio para gestionar los gatos (simulado)
const catService = {
  getCats: async (): Promise<CatProfile[]> => {
    return Promise.resolve(sampleCats);
  },
  saveCat: async (cat: CatProfile): Promise<CatProfile> => {
    return Promise.resolve(cat);
  },
  deleteCat: async (id: string): Promise<void> => {
    return Promise.resolve();
  }
};

export default function CatsScreen() {
  const [cats, setCats] = useState<CatProfile[]>(sampleCats);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CatProfile | null>(null);
  const colorScheme = useColorScheme() ?? 'light';

  // Cargar la lista de gatos
  const loadCats = async () => {
    setLoading(true);
    try {
      const allCats = await catService.getCats();
      setCats(allCats);
    } catch (error) {
      console.error('Error loading cats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar gatos al iniciar
  useEffect(() => {
    loadCats();
  }, []);

  // Función para calcular la edad en años y meses
  const calculateAge = (birthdate: Date): string => {
    const today = new Date();
    let years = today.getFullYear() - birthdate.getFullYear();
    let months = today.getMonth() - birthdate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${months} meses`;
    } else if (months === 0) {
      return `${years} años`;
    } else {
      return `${years} años, ${months} meses`;
    }
  };

  // Manejar la creación de un nuevo gato
  const handleAddCat = () => {
    setSelectedCat(null);
    setShowForm(true);
  };

  // Manejar la edición de un gato existente
  const handleEditCat = (cat: CatProfile) => {
    setSelectedCat(cat);
    setShowForm(true);
  };

  // Manejar la eliminación de un gato
  const handleDeleteCat = async (catId: string) => {
    Alert.alert(
      'Eliminar',
      '¿Estás seguro de que deseas eliminar este gato? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await catService.deleteCat(catId);
              loadCats();
            } catch (error) {
              console.error('Error deleting cat:', error);
            }
          },
        },
      ],
    );
  };

  // Manejar el guardado de un gato
  const handleSaveCat = async (cat: CatProfile) => {
    try {
      await catService.saveCat(cat);
      setShowForm(false);
      loadCats();
    } catch (error) {
      console.error('Error saving cat:', error);
    }
  };

  // Renderizar cada tarjeta de gato
  const renderCatCard = ({ item }: { item: CatProfile }) => (
    <TouchableOpacity
      style={styles.catCard}
      activeOpacity={0.7}
      onPress={() => handleEditCat(item)}
    >
      <View style={styles.catImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.catImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.catImagePlaceholder, { backgroundColor: Colors[colorScheme].tint }]}>
            <IconSymbol name="cat.fill" size={40} color="white" />
          </View>
        )}
      </View>

      <View style={styles.catInfo}>
        <ThemedText type="defaultSemiBold" style={styles.catName}>
          {item.name} {item.nickname ? `"${item.nickname}"` : ''}
        </ThemedText>

        <ThemedText>
          {item.breed} • {calculateAge(item.birthdate)}
        </ThemedText>

        <ThemedText>
          {item.weight} {item.weightUnit}
        </ThemedText>

        <View style={styles.traitsContainer}>
          {item.traits.map((trait, index) => (
            <View key={index} style={styles.traitTag}>
              <ThemedText style={styles.traitText}>{trait}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleEditCat(item)}>
          <IconSymbol name="pencil" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCat(item.id)}>
          <IconSymbol name="trash" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Gatos', headerShown: false }} />

      <FlatList
        data={cats}
        renderItem={renderCatCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">Mis Gatos</ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCat}
            >
              <IconSymbol name="plus" size={24} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="cat" size={60} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.emptyText}>No tienes gatos registrados</ThemedText>
            <TouchableOpacity
              style={[styles.addCatButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleAddCat}
            >
              <ThemedText style={styles.addCatButtonText}>Agregar Gato</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        }
      />

      {/* Modal para el formulario de gato */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showForm}
        onRequestClose={() => setShowForm(false)}
      >
        <CatForm
          catId={selectedCat?.id}
          onSave={handleSaveCat}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  listContent: {
    padding: 16,
  },
  catCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  catImageContainer: {
    marginRight: 12,
  },
  catImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  catImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  catName: {
    marginBottom: 4,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  traitTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  traitText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginVertical: 16,
    textAlign: 'center',
  },
  addCatButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCatButtonText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
