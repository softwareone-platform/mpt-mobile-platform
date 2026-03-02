import { createStackNavigator } from '@react-navigation/stack';

import { ChatRootScreen, ChatConversationScreen } from '@/screens';

const Stack = createStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatRoot"
        component={ChatRootScreen}
        options={{
          headerLeft: () => null, // no back button
        }}
      />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;
