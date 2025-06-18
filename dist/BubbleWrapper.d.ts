import React from 'react';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
export interface BubbleStyleProps {
    container?: ViewStyle;
    circle?: ViewStyle;
    text?: TextStyle;
    icon?: ImageStyle;
}
export interface BubbleProps {
    label: string;
    radius?: number;
    originalX?: number;
    originalY?: number;
    text?: string;
    icon?: any;
    style?: BubbleStyleProps;
    bubbleComponent?: React.ComponentType<BubbleProps>;
}
export interface BubbleWrapperProps {
    label: string;
    radius: number;
    originalX?: number;
    originalY?: number;
    text?: string;
    icon?: any;
    style?: BubbleStyleProps;
    bubbleComponent?: React.ComponentType<BubbleProps>;
    setIsAnyBubbleDragging: (isDragging: boolean) => void;
}
export interface Position {
    x: number;
    y: number;
}
declare const BubbleWrapper: React.ForwardRefExoticComponent<BubbleWrapperProps & React.RefAttributes<unknown>>;
export default BubbleWrapper;
