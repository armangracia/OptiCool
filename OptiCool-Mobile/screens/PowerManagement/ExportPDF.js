import React, { useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

import HumidityCharts from './HumidityCharts';
import TempCharts from './TempCharts';
import PowerConsumptionCharts from './PowerConsumptionCharts';

const ExportPDF = () => {
  const humidityRef = useRef();
  const tempRef = useRef();
  const powerRef = useRef();

  const captureChart = async (ref) => {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
    });
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  };

  const handleExport = async () => {
    try {
      const [humidityImg, tempImg, powerImg] = await Promise.all([
        captureChart(humidityRef),
        captureChart(tempRef),
        captureChart(powerRef),
      ]);

      const htmlContent = `
        <html>
          <body style="font-family: Arial; text-align: center; padding: 20px;">
            <h2>Temperature & Humidity Usage Chart</h2>
            <img src="data:image/png;base64,${tempImg}" style="width: 100%; max-width: 700px; margin-bottom: 40px;" />
            
            <h2>Humidity Usage Chart</h2>
            <img src="data:image/png;base64,${humidityImg}" style="width: 100%; max-width: 700px; margin-bottom: 40px;" />
            
            <h2>Power Consumption Chart</h2>
            <img src="data:image/png;base64,${powerImg}" style="width: 100%; max-width: 700px;" />
          </body>
        </html>
      `;

      const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(pdfUri);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Export All Usage Charts to PDF</Text>

      {/* Humidity Chart */}
      <View ref={tempRef} collapsable={false}>
        <TempCharts />
      </View>

      {/* Temperature Chart */}
      <View ref={humidityRef} collapsable={false}>
        <HumidityCharts />
      </View>

      {/* Power Chart */}
      <View ref={powerRef} collapsable={false}>
        <PowerConsumptionCharts />
      </View>

      <Button title="Export PDF" onPress={handleExport} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExportPDF;
