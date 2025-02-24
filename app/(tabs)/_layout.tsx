import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarStyle: { paddingBottom: 5 }
    }}>
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
    </Tabs>
  );
}