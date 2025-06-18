import React from 'react';
import { ViewStyle } from 'react-native';
import type { BubbleProps, BubbleStyleProps } from './BubbleWrapper';
export interface BubbleMenuStyleProps {
    container?: ViewStyle;
    centerBubble?: ViewStyle;
    menuBubbleContainer?: ViewStyle;
    bubble?: BubbleStyleProps;
}
interface BubbleMenuProps {
    items: BubbleProps[];
    menuDistance: number;
    height: number;
    width: number;
    bubbleRadius?: number;
    style?: BubbleMenuStyleProps;
    bubbleComponent?: React.ComponentType<BubbleProps>;
}
declare const BubbleMenu: ({ items, menuDistance, height, width, bubbleRadius, style, bubbleComponent }: BubbleMenuProps) => React.JSX.Element;
export default BubbleMenu;
