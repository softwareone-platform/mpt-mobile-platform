import { createStackNavigator } from '@react-navigation/stack';

import { ChatScreen, ChatConversationScreen } from '@/screens';

const Stack = createStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatRoot"
        component={ChatScreen}
        options={{
          headerLeft: () => null, // no back button
        }}
      />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;
