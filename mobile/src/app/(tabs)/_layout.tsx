import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../components/Marketplace';
import { colors } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ivory } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="horses" options={{ title: 'Horses' }} />
      <Tabs.Screen name="auctions" options={{ title: 'Auctions' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}