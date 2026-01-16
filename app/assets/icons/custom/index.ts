import NoResults from './no-results';
import NoResultsAnimated from './no-results-animated';

export const AnimatedIcons: {
  [key: string]: React.FC<{ size?: number }>;
} = {
  'no-results': NoResults,
  'no-results-animated': NoResultsAnimated,
} as const;
