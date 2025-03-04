import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { socket, connectSocket } from '../../utils/socket';

interface ScreenData {
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function ViewerScreen() {
  const isDarkTheme = true; // Cambia esto a 'false' para usar el tema claro

  const darkThemeStyles = {
    backgroundColor: '#121212',
    textColor: '#ffffff',
    errorColor: 'red',
  };

  const lightThemeStyles = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    errorColor: 'red',
  };

  const themeStyles = isDarkTheme ? darkThemeStyles : lightThemeStyles;

  const [screenData, setScreenData] = useState<ScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectSocket();

    socket.on('connect', () => {
      setError(null);
    });

    socket.on('connect_error', () => {
      setError('Failed to connect to sharing session');
    });

    socket.on('screenData', (data: ScreenData) => {
      setScreenData(data);
    });

    return () => {
      socket.off('screenData');
      socket.off('connect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      {error ? (
        <Text style={[styles.errorText, { color: themeStyles.errorColor }]}>{error}</Text>
      ) : (
        <>
          <View style={styles.mapContainer}>
            {screenData?.location && (
              <MapView
                style={styles.map}
                region={{
                  latitude: screenData.location.latitude,
                  longitude: screenData.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: screenData.location.latitude,
                    longitude: screenData.location.longitude,
                  }}
                  title="Shared Location"
                />
              </MapView>
            )}
          </View>
          <View style={styles.info}>
            {screenData ? (
              <Text style={{ color: themeStyles.textColor }}>
                Last update: {new Date(screenData.timestamp).toLocaleTimeString()}
              </Text>
            ) : (
              <Text style={{ color: themeStyles.textColor }}>
                Waiting for shared screen data...
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
  info: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    margin: 20,
  },
});

