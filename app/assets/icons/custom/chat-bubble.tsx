import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface ChatBubblePathProps {
  color?: string;
}

interface ChatBubbleProps {
  size?: number;
  color?: string;
}

export function ChatBubblePath({ color = '#3366FF' }: ChatBubblePathProps) {
  return (
    <Path
      d="M0 48V4.07547C0 2.95418 0.378947 2.00539 1.13684 1.22911C1.93684 0.409703 2.88421 0 3.97895 0H44.0211C45.1158 0 46.0421 0.409703 46.8 1.22911C47.6 2.00539 48 2.95418 48 4.07547V34.7385C48 35.8598 47.6 36.8302 46.8 37.6496C46.0421 38.4259 45.1158 38.814 44.0211 38.814H8.96842L0 48ZM7.57895 35.5795H44.0211C44.2316 35.5795 44.4211 35.4933 44.5895 35.3208C44.7579 35.1482 44.8421 34.9542 44.8421 34.7385V4.07547C44.8421 3.85984 44.7579 3.66577 44.5895 3.49326C44.4211 3.32075 44.2316 3.2345 44.0211 3.2345H3.97895C3.76842 3.2345 3.57895 3.32075 3.41053 3.49326C3.24211 3.66577 3.1579 3.85984 3.1579 4.07547V40.2372L7.57895 35.5795ZM3.1579 35.5795V4.07547V34.7385C3.1579 34.9542 3.1579 35.1482 3.1579 35.3208C3.1579 35.4933 3.1579 35.5795 3.1579 35.5795Z"
      fill={color}
    />
  );
}

export default function ChatBubble({ size = 48, color = '#3366FF' }: ChatBubbleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <ChatBubblePath color={color} />
    </Svg>
  );
}
