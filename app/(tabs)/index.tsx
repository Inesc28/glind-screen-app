import { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import * as Location from 'expo-location';
import { socket, connectSocket } from '../../utils/socket';
import MapView, { Marker } from 'react-native-maps';

interface LocationData {
  latitude: number;
  longitude: number;
}

export default function ShareScreen() {
  const isDarkTheme = true; // Cambia esto a 'false' para usar el tema claro

  const darkThemeStyles = {
    backgroundColor: '#121212',
    textColor: '#ffffff',
    buttonColor: '#ff4444',
    mapBorderColor: '#444444',
    sharingTextColor: '#bbbbbb',
  };

  const lightThemeStyles = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#4444ff',
    mapBorderColor: '#cccccc',
    sharingTextColor: '#666666',
  };

  const themeStyles = isDarkTheme ? darkThemeStyles : lightThemeStyles;

  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    return () => {
      if (isSharing) {
        stopSharing();
      }
    };
  }, []);

  const startSharing = async () => {
    try {
      if (Platform.OS !== 'web') {
        await ScreenCapture.preventScreenCaptureAsync();
      }

      connectSocket();
      setIsSharing(true);

      // Start periodic screen capture and location updates
      const intervalId = setInterval(async () => {
        if (location) {
          socket.emit('screenData', {
            timestamp: new Date().toISOString(),
            location: location,
          });
        }
      }, 1000);

      // Store interval ID for cleanup
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error starting screen share:', error);
      setErrorMsg('Failed to start screen sharing');
    }
  };

  const stopSharing = async () => {
    if (Platform.OS !== 'web') {
      await ScreenCapture.allowScreenCaptureAsync();
    }
    socket.disconnect();
    setIsSharing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      {errorMsg ? (
        <Text style={[styles.errorText, { color: themeStyles.textColor }]}>{errorMsg}</Text>
      ) : (
        <>
          <View style={styles.mapContainer}>
            {location && (
              <MapView
                style={[
                  styles.map,
                  {
                    borderColor: themeStyles.mapBorderColor,
                    borderWidth: 1,
                  },
                ]}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Your Location"
                />
              </MapView>
            )}
          </View>
          <View style={styles.controls}>
            <Button
              title={isSharing ? 'Stop Sharing' : 'Start Sharing'}
              onPress={isSharing ? stopSharing : startSharing}
              color={themeStyles.buttonColor}
            />
            {isSharing && (
              <Text style={[styles.sharingText, { color: themeStyles.sharingTextColor }]}>
                Screen sharing is active...
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controls: {
    padding: 20,
    alignItems: 'center',
  },
  sharingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    margin: 20,
  },
});
