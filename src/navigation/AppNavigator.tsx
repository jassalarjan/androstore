// Navigation setup

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '@store/appStore';
import { COLORS } from '@constants/index';

// Screens
import { OnboardingScreen } from '@screens/OnboardingScreen';
import { LoginScreen } from '@screens/LoginScreen';
import { DashboardScreen } from '@screens/DashboardScreen';
import { ScannerScreen } from '@screens/ScannerScreen';
import { SearchScreen } from '@screens/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
          tabBarTestID: 'tab-home',
        }}
      />
      <Tab.Screen
        name="Documents"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color }) => <TabIcon icon="📄" color={color} />,
          tabBarTestID: 'tab-documents',
        }}
      />
      <Tab.Screen
        name="Notes"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color }) => <TabIcon icon="📝" color={color} />,
          tabBarTestID: 'tab-notes',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} />,
          tabBarTestID: 'tab-chat',
        }}
      />
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => (
  <Text style={{ fontSize: 24 }}>{icon}</Text>
);

// Placeholder for incomplete screens
const PlaceholderScreen = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text style={{ fontSize: 48, marginBottom: 16 }}>🚧</Text>
    <Text style={{ fontSize: 18, color: COLORS.text, fontWeight: '600' }}>
      Coming Soon
    </Text>
  </View>
);

import { View, Text } from 'react-native';

export const AppNavigator = () => {
  const { isUnlocked, isFirstLaunch } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}>
        {isFirstLaunch ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isUnlocked ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="DocumentViewer"
              component={PlaceholderScreen}
            />
            <Stack.Screen name="Settings" component={PlaceholderScreen} />
            <Stack.Screen name="Import" component={PlaceholderScreen} />
            <Stack.Screen name="NoteEditor" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
