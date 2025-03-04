import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const isDarkTheme = true; 

  const darkThemeStyles = {
    backgroundColor: '#121212',
    activeColor: '#ff4444',
    inactiveColor: '#888888',
  };

  const lightThemeStyles = {
    backgroundColor: '#ffffff',
    activeColor: '#aa0000',
    inactiveColor: '#aaaaaa',
  };

  const themeStyles = isDarkTheme ? darkThemeStyles : lightThemeStyles;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          paddingBottom: 5,
          backgroundColor: themeStyles.backgroundColor,
        },
        tabBarActiveTintColor: themeStyles.activeColor,
        tabBarInactiveTintColor: themeStyles.inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Share Screen',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="share-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="viewer"
        options={{
          title: 'View Screen',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="eye-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SendScreen"
        options={{
          title: 'Send Data',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="send-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ViewDataScreen"
        options={{
          title: 'View Data',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
