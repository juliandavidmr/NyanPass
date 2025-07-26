import { Check, X } from '@tamagui/lucide-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { useThemeColor } from '../hooks/useThemeColor';

interface BreedSelectorProps {
  value: string;
  onChange: (breed: string) => void;
  placeholder?: string;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customBreed, setCustomBreed] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'color');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'color');
  const placeholderColor = useThemeColor({ light: '#a0a0a0', dark: '#6c6c6e' }, 'color');

  // Obtener la lista de razas desde las traducciones
  const breeds = t('cat_breeds', { returnObjects: true }) as string[];

  // Filtrar razas según la búsqueda
  const filteredBreeds = breeds.filter(breed =>
    breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Manejar la selección de una raza
  const handleSelectBreed = (breed: string) => {
    onChange(breed);
    setModalVisible(false);
    setSearchQuery('');
    setShowCustomInput(false);
  };

  // Manejar la selección de una raza personalizada
  const handleCustomBreed = () => {
    if (customBreed.trim()) {
      onChange(customBreed.trim());
      setModalVisible(false);
      setSearchQuery('');
      setCustomBreed('');
      setShowCustomInput(false);
    }
  };

  // Mostrar el input para raza personalizada
  const showCustomBreedInput = () => {
    setShowCustomInput(true);
  };

  return (
    <View>
      {/* Campo de selección que abre el modal */}
      <TouchableOpacity
        style={[styles.selector, { borderColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, { color: value ? textColor : placeholderColor }]}>
          {value || placeholder || t('cat_form.breed_placeholder')}
        </Text>
      </TouchableOpacity>

      {/* Modal de selección de raza */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <XStack justifyContent="space-between" alignItems="center" paddingHorizontal={15} paddingVertical={10}>
              <Text style={[styles.modalTitle, { color: textColor }]}>{t('cat_form.breed')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </XStack>

            {/* Barra de búsqueda */}
            <XStack padding={15} gap={10}>
              <Input
                flex={1}
                placeholder={t('cat_form.breed_placeholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </XStack>

            {/* Lista de razas */}
            {!showCustomInput ? (
              <YStack flex={1}>
                <FlatList
                  data={filteredBreeds}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.breedItem, { borderBottomColor: borderColor }]}
                      onPress={() => handleSelectBreed(item)}
                    >
                      <Text style={{ color: textColor }}>{item}</Text>
                      {value === item && <Check size={20} color={textColor} />}
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={
                    <TouchableOpacity
                      style={[styles.breedItem, { borderBottomColor: borderColor }]}
                      onPress={showCustomBreedInput}
                    >
                      <Text style={{ color: textColor }}>{t('cat_form.custom_breed')}</Text>
                    </TouchableOpacity>
                  }
                />
              </YStack>
            ) : (
              <YStack padding={15} gap={15}>
                <Input
                  placeholder={t('cat_form.custom_breed')}
                  value={customBreed}
                  onChangeText={setCustomBreed}
                  autoCapitalize="words"
                />
                <Button onPress={handleCustomBreed} theme="active">
                  {t('general.save')}
                </Button>
                <Button onPress={() => setShowCustomInput(false)} theme="gray">
                  {t('general.cancel')}
                </Button>
              </YStack>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    height: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  breedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
});

export default BreedSelector;