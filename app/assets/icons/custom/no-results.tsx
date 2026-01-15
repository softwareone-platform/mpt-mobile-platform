import React from 'react';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type Props = {
  size?: number;
};

const PATH_D = `
M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12
c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27
l1.41-1.41L2.81,2.81z
M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06
l10.94,10.94C14.86,19.59,13.48,20,12,20z
M7.94,5.12L6.49,3.66C8.07,2.61,9.96,2,12,2
c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51
l-1.46-1.46C19.59,14.86,20,13.48,20,12
c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z
`;

export default function NoResults({ size = 32 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000000" />
          <Stop offset="33.3333%" stopColor="#392D9C" />
          <Stop offset="66.6667%" stopColor="#472AFF" />
          <Stop offset="100%" stopColor="#00C9CD" />
        </LinearGradient>
      </Defs>

      <Path d={PATH_D} fill="url(#iconGradient)" />
    </Svg>
  );
}
