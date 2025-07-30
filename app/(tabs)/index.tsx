import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from 'tamagui';

import CatForm from '@/components/CatForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { TCatProfile } from '@/services/models';
import { storageService } from '@/services/storage';

export default function CatsScreen() {
  const [cats, setCats] = useState<TCatProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState<TCatProfile | undefined>(undefined);
  const colorScheme = useColorScheme() ?? 'light';

  // Cargar la lista de gatos
  const loadCats = async () => {
    setLoading(true);
    try {
      const allCats = await storageService.getCats();
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
    setSelectedCat(undefined);
    setShowForm(true);
  };

  // Manejar la edición de un gato existente
  const handleEditCat = (cat: TCatProfile) => {
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
              await storageService.deleteCat(catId);
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
  const handleSaveCat = async (cat: TCatProfile) => {
    try {
      await storageService.saveCat(cat);
      setShowForm(false);
      loadCats();
    } catch (error) {
      console.error('Error saving cat:', error);
    }
  };

  // Renderizar cada tarjeta de gato
  const renderCatCard = ({ item }: { item: TCatProfile }) => (
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
          <View
            style={StyleSheet.flatten([
              styles.catImagePlaceholder,
              { backgroundColor: Colors[colorScheme].tint }
            ])}
          >
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
          <IconSymbol name="pencil" size={20} color={Colors[colorScheme].color} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCat(item.id)}>
          <IconSymbol name="trash" size={20} color={Colors[colorScheme].color} />
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
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.addCatButton,
              ])}
              onPress={handleAddCat}
            >
              <ThemedText style={styles.addCatButtonText}>Agregar Gato</ThemedText>
            </TouchableOpacity>
            <ThemedText>{cats.length} gatos</ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="cat" size={60} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.emptyText}>No tienes gatos registrados</ThemedText>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.addCatButton,
                { backgroundColor: Colors[colorScheme].tint }
              ])}
              onPress={handleAddCat}
            >
              <ThemedText style={styles.addCatButtonText}>Agregar Gato</ThemedText>
            </TouchableOpacity>
          </View>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  addCatButtonText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    padding: 16,
  },
});
