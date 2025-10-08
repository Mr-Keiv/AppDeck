declare module '@fidme/react-native-wheel-of-fortune' {
  import { Component } from 'react';
  
  interface WheelOfFortuneProps {
    options: {
      rewards: string[];
      knobSize?: number;
      borderWidth?: number;
      borderColor?: string;
      innerRadius?: number;
      duration?: number;
      backgroundColor?: string;
      textAngle?: 'horizontal' | 'vertical' | 'curved';
      knobSource?: any;
      getWinner?: (value: string, index: number) => void;
      onRef?: (ref: any) => void;
      [key: string]: any;
    };
    getWinner?: (value: string, index: number) => void;
  }

  export default class WheelOfFortune extends Component<WheelOfFortuneProps> {
    _onPress(): void;
    _tryAgain(): void;
  }
}