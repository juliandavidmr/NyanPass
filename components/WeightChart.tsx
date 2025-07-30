import { format } from 'date-fns';
import { enUS, es, fr, pt } from 'date-fns/locale';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Button, Text, XStack, YStack } from 'tamagui';
import type { z } from 'zod';

import { convertWeight } from '../config/i18n';
import { useThemeColor } from '../hooks/useThemeColor';
import { CatWeightUnit } from '../services/models';

interface WeightRecord {
  date: Date;
  weight: number;
  unit: z.infer<typeof CatWeightUnit>;
}

interface WeightChartProps {
  catId: string;
  weightRecords: WeightRecord[];
  preferredUnit: z.infer<typeof CatWeightUnit>;
}

const WeightChart: React.FC<WeightChartProps> = ({ catId, weightRecords, preferredUnit }) => {
  const { i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');

  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'color');
  const chartBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#2c2c2e' }, 'background');
  const chartColor = useThemeColor({ light: '#5e72e4', dark: '#7f8eff' }, 'color');
  const chartPointColor = useThemeColor({ light: '#5e72e4', dark: '#7f8eff' }, 'color');

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

  // Filtrar registros según el rango de tiempo seleccionado
  const getFilteredRecords = () => {
    if (timeRange === 'all') return weightRecords;

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return weightRecords.filter(record => record.date >= startDate);
  };

  // Preparar datos para la gráfica
  const prepareChartData = () => {
    const filteredRecords = getFilteredRecords();

    // Ordenar por fecha
    const sortedRecords = [...filteredRecords].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Convertir pesos a la unidad preferida
    const labels = sortedRecords.map(record =>
      format(record.date, 'dd/MM/yy', { locale: getLocale() })
    );

    const data = sortedRecords.map(record =>
      Number(convertWeight(record.weight, record.unit, preferredUnit).toFixed(1))
    );

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: () => chartColor,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Si no hay datos, mostrar mensaje
  if (weightRecords.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: textColor }}>No hay registros de peso</Text>
      </View>
    );
  }

  const chartData = prepareChartData();
  const screenWidth = Dimensions.get('window').width - 40; // Margen de 20px a cada lado

  return (
    <YStack gap={15}>
      <Text style={[styles.title, { color: textColor }]}>Evolución del peso</Text>

      {/* Selector de rango de tiempo */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap={10}>
          <Button
            size="$2"
            theme={timeRange === '1m' ? 'active' : 'gray'}
            onPress={() => setTimeRange('1m')}
          >
            1 mes
          </Button>
          <Button
            size="$2"
            theme={timeRange === '3m' ? 'active' : 'gray'}
            onPress={() => setTimeRange('3m')}
          >
            3 meses
          </Button>
          <Button
            size="$2"
            theme={timeRange === '6m' ? 'active' : 'gray'}
            onPress={() => setTimeRange('6m')}
          >
            6 meses
          </Button>
          <Button
            size="$2"
            theme={timeRange === '1y' ? 'active' : 'gray'}
            onPress={() => setTimeRange('1y')}
          >
            1 año
          </Button>
          <Button
            size="$2"
            theme={timeRange === 'all' ? 'active' : 'gray'}
            onPress={() => setTimeRange('all')}
          >
            Todo
          </Button>
        </XStack>
      </ScrollView>

      {/* Gráfica de peso */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <LineChart
          data={chartData}
          width={Math.max(screenWidth, chartData.labels.length * 60)} // Asegurar que haya suficiente espacio para todas las etiquetas
          height={220}
          chartConfig={{
            backgroundColor: chartBackgroundColor,
            backgroundGradientFrom: chartBackgroundColor,
            backgroundGradientTo: chartBackgroundColor,
            decimalPlaces: 1,
            color: () => chartColor,
            labelColor: () => textColor,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: chartPointColor,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          yAxisSuffix={preferredUnit === 'kg' ? ' kg' : ' lb'}
          yAxisInterval={1}
        />
      </ScrollView>
    </YStack>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WeightChart;