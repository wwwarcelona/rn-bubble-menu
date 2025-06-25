import React, {
  forwardRef
} from 'react';
import { View, Text, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { styles } from './styles';
import { BubbleStyleProps } from './BubbleWrapper';

export interface BubbleProps {
  id: string;
  radius: number;
  originalX?: number;
  originalY?: number;
  text?: string;
  icon?: any; // Can be a require() image or a URL
  style?: BubbleStyleProps;
}

const DefaultBubble = forwardRef(({ id, radius, text, icon, style }: BubbleProps, ref) => {

  return (
        <Shadow
          distance={5}
          startColor="rgba(0, 0, 0, 0.1)"
          offset={[0, 2]}
        >
          <View 
            style={[
              styles.circle, 
              style?.circle,
              { 
                width: radius*2, 
                height: radius*2, 
                borderRadius: radius,
                padding: icon ? 8 : 0,
              }
            ]}
          >
            {icon && (
              <Image 
                source={icon}
                style={[
                  styles.icon,
                  style?.icon,
                  { 
                    width: radius * (text ? 0.8 : 1),
                    height: radius * (text ? 0.8 : 1),
                    marginBottom: 4
                  }
                ]}
              />
            )}
            {text && (
              <Text style={[
                styles.text,
                style?.text,
                { fontSize: icon ? radius/3.6 : 16 } // font size adapts to the radius of the bubble and the icon
              ]}>{text}</Text>
            )}
          </View>
        </Shadow>
      ) 
});

export default DefaultBubble; 