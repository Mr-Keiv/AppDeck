import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';

export default function TabLayout() {
  return (
    
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
