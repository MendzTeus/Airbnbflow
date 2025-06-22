
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { DataProvider } from '@/contexts/DataContext';

// Auth screens
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';

// Main screens
import Dashboard from './src/screens/Dashboard';
import Properties from './src/screens/properties/PropertiesScreen';
import PropertyDetail from './src/screens/properties/PropertyDetailScreen';
import PropertyForm from './src/screens/properties/PropertyFormScreen';
import Employees from './src/screens/employees/EmployeesScreen';
import EmployeeForm from './src/screens/employees/EmployeeFormScreen';
import Checklists from './src/screens/checklists/ChecklistsScreen';
import ChecklistForm from './src/screens/checklists/ChecklistFormScreen';
import Calendar from './src/screens/calendar/CalendarScreen';
import Profile from './src/screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              <Stack.Navigator 
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false
                }}
              >
                {/* Auth Stack */}
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                
                {/* Main Stack */}
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Properties" component={Properties} />
                <Stack.Screen name="PropertyDetail" component={PropertyDetail} />
                <Stack.Screen name="PropertyForm" component={PropertyForm} />
                <Stack.Screen name="Employees" component={Employees} />
                <Stack.Screen name="EmployeeForm" component={EmployeeForm} />
                <Stack.Screen name="Checklists" component={Checklists} />
                <Stack.Screen name="ChecklistForm" component={ChecklistForm} />
                <Stack.Screen name="Calendar" component={Calendar} />
                <Stack.Screen name="Profile" component={Profile} />
              </Stack.Navigator>
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}
