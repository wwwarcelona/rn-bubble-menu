import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import {Animated, PanResponder, ViewStyle, TextStyle, ImageStyle, TouchableOpacity} from 'react-native';
import { styles } from './styles';
import DefaultBubble from './DefaultBubble';

// Style interfaces for the bubble component
export interface BubbleStyleProps {
  container?: ViewStyle;
  circle?: ViewStyle;
  text?: TextStyle;
  icon?: ImageStyle;
}

// Props for the bubble component
export interface BubbleProps {
  label: string;
  radius: number;
  originalX?: number;
  originalY?: number;
  text?: string;
  icon?: any; // Can be a require() image or a URL
  style?: BubbleStyleProps;
  bubbleComponent?: React.ComponentType<BubbleProps>;
}

// Props for the bubble wrapper component
export interface BubbleWrapperProps {
  label: string;
  radius: number;
  originalX?: number;
  originalY?: number;
  text?: string;
  icon?: any; // Can be a require() image or a URL
  style?: BubbleStyleProps;
  bubbleComponent?: React.ComponentType<BubbleProps>;
  setIsAnyBubbleDragging: (isDragging: boolean) => void;
}

// Position interface for bubble coordinates
export interface Position {
  x: number;
  y: number;
}

// BubbleWrapper Component: Creates a draggable bubble with custom styling and behavior
const BubbleWrapper = forwardRef(({ 
  label, 
  radius, 
  originalX, 
  originalY, 
  text, 
  icon, 
  style, 
  bubbleComponent, 
  setIsAnyBubbleDragging 
}: BubbleWrapperProps, ref) => {
  // Animation and state management
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: originalX!, y: originalY! });
  const [isDragging, setIsDragging] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getPosition: () => currentPosition,
    setPosition: (pos: Position) => {
      if (!isDragging) {
        setCurrentPosition(pos);
      }
    },
    getIsDragging: () => isDragging
  }));

  // Update parent component when dragging state changes
  useEffect(() => {
    setIsAnyBubbleDragging(isDragging);
  }, [isDragging]);

  // Pan responder for drag and drop functionality
  const panResponder = useRef(
    PanResponder.create({
      // Start dragging on touch
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // Handle movement
      onPanResponderMove: (_, gesture) => {
        pan.setValue({
          x: gesture.dx,
          y: gesture.dy,
        });
        setCurrentPosition({
          x: originalX! + gesture.dx,
          y: originalY! + gesture.dy
        });
        setIsDragging(true);
      },

      // Handle release
      onPanResponderRelease: () => {
        // Animate back to original position
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
        }).start();
        setCurrentPosition({
          x: originalX!,
          y: originalY!
        });
        setIsDragging(false);
      },
    }),
  ).current;

  // Render the bubble with animation and touch handling
  return (
    <Animated.View 
      style={[
        styles.bubbleContainer,
        style?.container,
        { 
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={() => {
        console.log("Bubble ", label, " pressed");
      }}>
        {React.createElement(bubbleComponent || DefaultBubble, {
          label,
          radius,
          originalX,
          originalY,
          text,
          icon,
          style,
        })}
      </TouchableOpacity>
    </Animated.View>
  );
});

export default BubbleWrapper; 