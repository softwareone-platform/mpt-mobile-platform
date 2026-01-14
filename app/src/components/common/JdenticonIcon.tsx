import jdenticon from 'jdenticon';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface JdenticonIconProps {
  value: string;
  size: number;
  config?: Record<string, string | number | unknown>;
  style?: ViewStyle & { padding?: number };
}

const JdenticonIcon: React.FC<JdenticonIconProps> = ({ value, size, config, style = {} }) => {
  const svg = jdenticon.toSvg(value, size, config);
  const containerStyle: ViewStyle = style.padding
    ? {
        width: size + 2 * style.padding,
        ...style,
      }
    : {
        width: size,
        ...style,
      };

  return (
    <View style={containerStyle}>
      <SvgXml xml={svg} />
    </View>
  );
};

export default JdenticonIcon;
