import { Plus, X } from '@tamagui/lucide-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import { useThemeColor } from '../hooks/useThemeColor';

interface TraitsSelectorProps {
  value: string[];
  onChange: (traits: string[]) => void;
  placeholder?: string;
}

// Lista de rasgos predefinidos
const predefinedTraits = [
  'juguetón',
  'tímido',
  'curioso',
  'cariñoso',
  'independiente',
  'activo',
  'tranquilo',
  'sociable',
  'territorial',
  'miedoso',
  'dominante',
  'vocal',
];

const TraitsSelector: React.FC<TraitsSelectorProps> = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const [newTrait, setNewTrait] = useState('');

  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'text');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'text');
  const placeholderColor = useThemeColor({ light: '#a0a0a0', dark: '#6c6c6e' }, 'text');
  const tagBackgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'text');

  // Agregar un rasgo
  const addTrait = (trait: string) => {
    if (trait.trim() && !value.includes(trait.trim())) {
      onChange([...value, trait.trim()]);
    }
    setNewTrait('');
  };

  // Eliminar un rasgo
  const removeTrait = (trait: string) => {
    onChange(value.filter(t => t !== trait));
  };

  // Manejar la adición de un rasgo personalizado
  const handleAddCustomTrait = () => {
    if (newTrait.trim()) {
      addTrait(newTrait);
    }
  };

  return (
    <YStack gap={10}>
      {/* Mostrar los rasgos seleccionados */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedTraitsContainer}>
        {value.length > 0 ? (
          value.map((trait, index) => (
            <View key={index} style={[styles.traitTag, { backgroundColor: tagBackgroundColor }]}>
              <Text style={{ color: textColor }}>{trait}</Text>
              <TouchableOpacity onPress={() => removeTrait(trait)} style={styles.removeButton}>
                <X size={14} color={textColor} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ color: placeholderColor }}>
            {placeholder || t('cat_form.traits_placeholder')}
          </Text>
        )}
      </ScrollView>

      {/* Input para agregar un rasgo personalizado */}
      <XStack gap={10} alignItems="center">
        <Input
          flex={1}
          placeholder={t('cat_form.traits_placeholder')}
          value={newTrait}
          onChangeText={setNewTrait}
          onSubmitEditing={handleAddCustomTrait}
          returnKeyType="done"
        />
        <Button size="$3" circular onPress={handleAddCustomTrait} disabled={!newTrait.trim()}>
          <Plus size={20} />
        </Button>
      </XStack>

      {/* Lista de rasgos predefinidos */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Rasgos predefinidos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.predefinedTraitsContainer}>
        {predefinedTraits.map((trait, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.predefinedTag,
              {
                backgroundColor: value.includes(trait) ? tagBackgroundColor : 'transparent',
                borderColor: borderColor
              }
            ]}
            onPress={() => value.includes(trait) ? removeTrait(trait) : addTrait(trait)}
          >
            <Text style={{ color: textColor }}>#{trait}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </YStack>
  );
};

const styles = StyleSheet.create({
  selectedTraitsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    minHeight: 40,
    maxHeight: 80,
  },
  traitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  removeButton: {
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  predefinedTraitsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  predefinedTag: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default TraitsSelector;