import ChatBubble from './chat-bubble';
import ChatBubbleAnimated from './chat-bubble-animated';
import NoResults from './no-results';
import NoResultsAnimated from './no-results-animated';

export const AnimatedIcons: {
  [key: string]: React.FC<{ size?: number }>;
} = {
  'chat-bubble': ChatBubble,
  'chat-bubble-animated': ChatBubbleAnimated,
  'no-results': NoResults,
  'no-results-animated': NoResultsAnimated,
} as const;
