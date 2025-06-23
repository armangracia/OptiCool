import React, { useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const ExportPDF = () => {
  const chartRef = useRef();

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        data: [45, 56, 78, 40, 67],
        color: () => `rgba(0, 128, 255, 1)`
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const handleExport = async () => {
    try {
      // Capture the chart image
      const uri = await captureRef(chartRef, {
        format: 'png',
        quality: 1,
      });

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate HTML with embedded chart image
      const htmlContent = `
        <html>
          <body style="font-family: Arial; text-align: center;">
            <h1>Humidity / Temperature Chart</h1>
            <img src="data:image/png;base64,${base64Image}" style="width: 100%;" />
          </body>
        </html>
      `;

      const { uri: pdfUri } = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'ChartReport',
        base64: false,
      });

      await shareAsync(pdfUri);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Export Sample Chart to PDF</Text>

      <View ref={chartRef} collapsable={false}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </View>

      <Button title="Export PDF" onPress={handleExport} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
    marginBottom: 24,
  },
});

export default ExportPDF;
