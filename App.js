import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

import HomeScreen from './Screens/HomeScreen';
import RecognitionScreen from './Screens/RecognitionScreen';
import HistoryScreen from './Screens/HistoryScreen';
import ProfileScreen from './Screens/ProfileScreen';
import ResultScreen from './Screens/ResultScreen';
import RegisterScreen from './Screens/RegisterScreen';
import SignInScreen from './Screens/SignInScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen'; 
import FeedbackScreen from './Screens/FeedbackScreen';
import AccountInfoScreen from './Screens/AccountInfoScreen';
import InfoScreen from './Screens/InfoScreen';
import ThemeScreen from './Screens/ThemeScreen';

import { ThemeProvider, ThemeContext } from './Screens/ThemeContext';
import { UserProvider, UserContext } from './context/UserContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Trang chủ" component={HomeScreen} />
    <Stack.Screen name="Recognition" component={RecognitionScreen} />
    <Stack.Screen name="Result" component={ResultScreen} />
    <Stack.Screen name="Info" component={InfoScreen} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HistoryMain" component={HistoryScreen} />
    <Stack.Screen name="Result" component={ResultScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
    <Stack.Screen name="Feedback" component={FeedbackScreen} />
    <Stack.Screen name="AccInfo" component={AccountInfoScreen} />
    <Stack.Screen name="Theme" component={ThemeScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Trang chủ"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          'Trang chủ': 'home',
          'Lịch Sử': 'time',
          'Hồ Sơ': 'person',
        };
        return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Trang chủ" component={HomeStack} />
    <Tab.Screen name="Lịch Sử" component={HistoryStack} />
    <Tab.Screen name="Hồ Sơ" component={ProfileStack} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
  </Stack.Navigator>
);

const AppContainer = () => {
  const { theme } = useContext(ThemeContext);
  const { user, loading } = useContext(UserContext);
  const isDark = theme === 'dark';

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </UserProvider>
  );
}
