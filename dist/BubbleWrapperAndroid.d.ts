import React from 'react';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
/**
 * Style configuration for individual bubble components
 * Provides granular control over bubble appearance and layout
 */
export interface BubbleStyleProps {
    container?: ViewStyle;
    circle?: ViewStyle;
    text?: TextStyle;
    icon?: ImageStyle;
}
/**
 * Core bubble data structure and configuration
 * Represents a single interactive bubble in the menu system
 */
export interface BubbleProps {
    id: string;
    radius?: number;
    originalX?: number;
    originalY?: number;
    text?: string;
    icon?: any;
    style?: BubbleStyleProps;
    key?: string;
    onPress?: () => void;
    isPressed?: boolean;
}
/**
 * Props interface for the BubbleWrapper component
 * Handles the integration between individual bubbles and the menu system
 */
export interface BubbleWrapperProps {
    item: BubbleProps;
    bubbleComponent?: React.ComponentType<BubbleProps>;
    updateBubblePositions: (id: string, newPosition: Position) => void;
    height: number;
    width: number;
}
/**
 * 2D position coordinates interface
 * Used throughout the system for consistent position tracking
 */
export interface Position {
    x: number;
    y: number;
}
/**
 * BubbleWrapper Component
 *
 * A high-performance wrapper that provides drag-and-drop functionality for individual bubbles.
 * This component serves as the bridge between the visual bubble representation and the
 * menu system's collision detection and animation logic.
 *
 * Key Features:
 * - Native-driven animations for 60fps performance
 * - Sophisticated drag gesture handling with boundary constraints
 * - Throttled position updates to prevent excessive parent re-renders
 * - Automatic spring-back animation to original position
 * - Imperative API for external position control
 *
 */
declare const BubbleWrapper: React.ForwardRefExoticComponent<BubbleWrapperProps & React.RefAttributes<any>>;
export default BubbleWrapper;
