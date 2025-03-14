import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import * as Location from 'expo-location';
import { socket } from '../../utils/socket';

export default function SendScreen(): JSX.Element {
  const isDarkTheme = true; 

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

  const [text, setText] = useState<string>(''); // Texto que se enviará en tiempo real
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  // Obtener la ubicación inicial al cargar la pantalla
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso denegado para acceder a la ubicación.');
          return;
        }

        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          setErrorMsg('Los servicios de ubicación están desactivados. Por favor, actívalos.');
          return;
        }

        
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (error) {
        setErrorMsg('Error al obtener la ubicación inicial.');
      }
    })();
  }, []);

  // Manejar pulsaciones de texto y enviarlas en tiempo real
  const handleTextChange = async (value: string): Promise<void> => {
    setText(value);

    try {
      // Obtener la ubicación actual para enviarla junto al texto
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      // Emitir texto y ubicación al servidor
      const data = {
        text: value,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      if (socket.connected) {
        socket.emit('textAndLocationUpdate', data); // Nuevo evento para texto en tiempo real
      } else {
        setErrorMsg('Error: el socket no está conectado.');
      }
    } catch (error) {
      setErrorMsg('Error al enviar el texto y la ubicación.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <TextInput
        style={[{ color: themeStyles.textColor, borderColor: themeStyles.borderColor }]}
        placeholder="Escribe un texto"
        placeholderTextColor={themeStyles.textColor} 
        onChangeText={handleTextChange} 
        value={text}
      />
      {location && (
        <Text style={[styles.location, { color: themeStyles.textColor }]}>
          Ubicación actual: {location.latitude}, {location.longitude}
        </Text>
      )}
      {errorMsg && (
        <Text style={[styles.error, { color: themeStyles.buttonColor }]}>
          {errorMsg}
        </Text>
      )}
    </View>
  );

}
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  location: {
    marginTop: 10,
    color: 'green',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
