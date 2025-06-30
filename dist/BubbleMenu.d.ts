import React from 'react';
import { ViewStyle } from 'react-native';
import type { BubbleProps, BubbleStyleProps } from './BubbleWrapper';
/**
 * Style configuration for the BubbleMenu component
 * Provides granular control over styling for different menu elements
 */
export interface BubbleMenuStyleProps {
    container?: ViewStyle;
    centerBubble?: ViewStyle;
    menuBubbleContainer?: ViewStyle;
    bubble?: BubbleStyleProps;
}
/**
 * Props interface for the BubbleMenu component
 * Implements a circular menu layout with collision detection and smooth animations
 */
interface BubbleMenuProps {
    items: BubbleProps[];
    menuDistance: number;
    height: number;
    width: number;
    bubbleRadius?: number;
    collisionRadius?: number;
    menuRotation?: number;
    bubbleFreedom?: boolean;
    style?: BubbleMenuStyleProps;
    bubbleComponent?: React.ComponentType<BubbleProps>;
}
declare const _default: React.MemoExoticComponent<({ items, menuDistance, height, width, bubbleRadius, collisionRadius, menuRotation, bubbleFreedom, style, bubbleComponent }: BubbleMenuProps) => React.JSX.Element>;
export default _default;
