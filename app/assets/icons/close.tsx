import { Path } from 'react-native-svg';

const CloseOutlined = ({ color }: { color: string }) => (
  <>
    <Path
      d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"
      fill={color}
    />
  </>
);

export default CloseOutlined;
