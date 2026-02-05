/**
 * Color System for React Native App
 * Based on Swift color configuration with SWO brand colors
 */

export const Color = {
  brand: {
    primary: '#3366FF',
    danger: '#dc182c',
    success: '#008556',
    type: '#000000',
    white: '#ffffff',
    gradient: {
      colors: ['#00C9CD', '#472AFF', '#392D9C'],
      start: { x: 1, y: 0.4 }, // approximate 256deg angle
      end: { x: 0, y: 0.6 },
    },
  },
  gray: {
    gray1: '#f4f6f8',
    gray2: '#F0EEED',
    gray3: '#aeb1b9',
    gray4: '#6b7180',
    gray5: '#434952',
    gray6: '#25282d',
  },
  alerts: {
    info1: '#eaecff',
    info2: '#959bff',
    info3: '#3520bf',
    info4: '#1A3380',
    warning1: '#fdf2e9',
    warning2: '#f1b178',
    warning3: '#e87d1e',
    warning4: '#733f11',
    danger1: '#fce8ea',
    danger2: '#ee8c96',
    danger3: '#bb1425',
    danger4: '#8f101d',
    success1: '#e6f9f2',
    success2: '#80e1ae',
    success3: '#00784d',
    success4: '#005838',
  },
  tertiary: {
    blue1: '#cae4ff',
    blue2: '#4da6ff',
    blue3: '#2775c4',
    blue4: '#1f5c99',
    cyan1: '#bffaff',
    cyan2: '#00ebff',
    cyan3: '#007d8c',
    cyan4: '#004a59',
    green1: '#d3ffd8',
    green2: '#4eff64',
    yellow1: '#fff6ca',
    yellow2: '#fedc2b',
  },
  shadow: {
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  labels: {
    primary: '#000000',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
  },
  separators: {
    nonOpaque: 'rgba(84, 84, 86, 0.34)',
  },
  fills: {
    tertiary: 'rgba(118, 118, 128, 0.12)',
  },
} as const;

export default Color;
