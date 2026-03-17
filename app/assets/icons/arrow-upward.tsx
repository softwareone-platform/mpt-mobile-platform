import { Path } from 'react-native-svg';

const ArrowUpwardOutlined = ({ color }: { color: string }) => (
  <>
    <Path
      d="M450-180v-485.08L222.15-437.23 180-480l300-300 300 300-42.15 42.77L510-665.08V-180h-60Z"
      fill={color}
    />
  </>
);

export default ArrowUpwardOutlined;
