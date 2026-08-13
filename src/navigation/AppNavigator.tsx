import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import FamilyScreen from '../screens/FamilyScreen';
import CalculatorScreen from '../screens/CalculatorScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Recetas" component={RecipesScreen} />
      <Tab.Screen name="Familia" component={FamilyScreen} />
      <Tab.Screen name="Calculadora" component={CalculatorScreen} />
    </Tab.Navigator>
  );
}