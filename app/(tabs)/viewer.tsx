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
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
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
              <Text>Last update: {new Date(screenData.timestamp).toLocaleTimeString()}</Text>
            ) : (
              <Text>Waiting for shared screen data...</Text>
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
    backgroundColor: '#fff',
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
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});
