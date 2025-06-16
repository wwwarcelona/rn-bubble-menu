import React from 'react';
import { BubbleStyleProps } from './BubbleWrapper';
export interface BubbleProps {
    label: string;
    radius?: number;
    originalX?: number;
    originalY?: number;
    text?: string;
    icon?: any;
    style?: BubbleStyleProps;
}
declare const DefaultBubble: React.ForwardRefExoticComponent<BubbleProps & React.RefAttributes<unknown>>;
export default DefaultBubble;
