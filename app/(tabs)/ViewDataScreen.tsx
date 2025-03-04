import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Modal, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { socket, connectSocket } from '../../utils/socket';

interface LocationData {
  text: string;
  latitude: number;
  longitude: number;
}

export default function ViewDataScreen(): JSX.Element {
  const isDarkTheme = true; // Cambia esto a 'false' para usar el tema claro

  const darkThemeStyles = {
    backgroundColor: '#121212',
    textColor: '#ffffff',
    cardColor: '#1e1e1e',
    borderColor: '#444444',
    buttonColor: '#ff4444',
  };

  const lightThemeStyles = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    cardColor: '#f8f8f8',
    borderColor: '#cccccc',
    buttonColor: '#0066cc',
  };

  const themeStyles = isDarkTheme ? darkThemeStyles : lightThemeStyles;

  const [receivedText, setReceivedText] = useState<string>(''); // Texto recibido en tiempo real
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Ubicación recibida
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Manejo de errores
  const [modalVisible, setModalVisible] = useState<boolean>(false); // Control del modal

  useEffect(() => {
    // Conecta al socket
    connectSocket();

    // Escuchar las actualizaciones de texto y ubicación en tiempo real
    socket.on('textAndLocationUpdate', (data: LocationData) => {
      try {
        // Actualiza texto y ubicación
        setReceivedText(data.text);
        setLocation({ latitude: data.latitude, longitude: data.longitude });
      } catch (error) {
        console.error('Error al procesar datos:', error);
        setErrorMsg('Error al recibir datos del servidor.');
      }
    });

    // Limpiar conexión al desmontar la pantalla
    return () => {
      socket.off('textAndLocationUpdate'); // Remueve el listener
      socket.disconnect(); // Desconecta el socket
    };
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeStyles.cardColor,
            borderColor: themeStyles.borderColor,
          },
        ]}
      >
        <Text style={{ color: themeStyles.textColor }}>
          Texto en tiempo real: {receivedText || 'Esperando texto...'}
        </Text>
        {location ? (
          <>
            <Text style={{ color: themeStyles.textColor }}>
              Ubicación: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Button
              title="View Location"
              onPress={() => setModalVisible(true)} // Abre el modal
              color={themeStyles.buttonColor}
            />
          </>
        ) : (
          <Text style={{ color: themeStyles.textColor }}>Esperando ubicación...</Text>
        )}
        {errorMsg && <Text style={[styles.error, { color: 'red' }]}>{errorMsg}</Text>}
      </View>

      {/* Modal con el mapa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)} // Cierra el modal al presionar atrás
      >
        <View style={styles.modalContainer}>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Ubicación Actual"
                description="Esta es la ubicación compartida en tiempo real."
              />
            </MapView>
          )}
          <Button title="Cerrar" onPress={() => setModalVisible(false)} color={themeStyles.buttonColor} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  map: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
});

