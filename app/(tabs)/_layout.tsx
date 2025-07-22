import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#25292e',
                },  
            }}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: 'Home',
                    headerTitle: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                    ),
                }} 
            /> 
            <Tabs.Screen
                name="(training)"
                options={{
                    title: 'Train',
                    headerTitle: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'barbell-sharp' : 'barbell-outline'} color={color} size={24}/>
                    ),
                }} 
            /> 
            <Tabs.Screen
                name="(trainingtest)"
                options={{
                    title: 'Test',
                    headerTitle: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'barbell-sharp' : 'barbell-outline'} color={color} size={24}/>
                    ),
                }} 
            /> 
        </Tabs>
    );
}