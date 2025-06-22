
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Properties: undefined;
  PropertyDetail: { id: string };
  PropertyForm: { id?: string };
  Employees: undefined;
  EmployeeForm: { id?: string };
  Checklists: undefined;
  ChecklistForm: { id?: string };
  Calendar: undefined;
  Profile: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
