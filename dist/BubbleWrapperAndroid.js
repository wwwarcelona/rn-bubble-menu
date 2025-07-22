var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { K } from './constants';
import DefaultBubble from './DefaultBubble';
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
var BubbleWrapper = forwardRef(function (_a, ref) {
    var item = _a.item, _b = _a.bubbleComponent, BubbleComponent = _b === void 0 ? DefaultBubble : _b, updateBubblePositions = _a.updateBubblePositions, height = _a.height, width = _a.width;
    // Extract bubble configuration with sensible defaults
    var id = item.id, _c = item.originalX, originalX = _c === void 0 ? 0 : _c, _d = item.originalY, originalY = _d === void 0 ? 0 : _d, _e = item.radius, radius = _e === void 0 ? 50 : _e, onPress = item.onPress;
    /**
     * Animation and State Management
     * Using refs to maintain state without triggering re-renders during animations
     */
    // Animated value for smooth GPU-accelerated transforms
    var translation = useRef(new Animated.ValueXY({ x: originalX, y: originalY })).current;
    // Sets if the animations use Nativ Drivers or not.
    var nativeDriverUsage = true;
    // Current logical position - tracks where the bubble actually is
    var currentPosition = useRef({ x: originalX, y: originalY });
    // Drag state tracking - prevents external position updates during user interaction
    var isDragging = useRef(false);
    // Collision avoidance flag - can be set by parent for dynamic behavior
    var avoidCollision = useRef(false);
    // Throttling mechanism to prevent excessive parent updates during drag
    var lastLogicUpdateRef = useRef(0);
    var lastUIUpdateRef = useRef(0);
    // Calculate throttling interval based on logic frame rate
    var LOGIC_FRAME_INTERVAL = 1000 / K.FPS_LOGIC;
    var UI_FRAME_INTERVAL = 1000 / K.FPS_UI;
    /**
     * Imperative API for Parent Component Communication
     * Provides external control over bubble position and state without prop drilling
     * This pattern is essential for performance in animation-heavy scenarios
     */
    useImperativeHandle(ref, function () { return ({
        /**
         * Returns the current logical position of the bubble
         * Used by collision detection and menu layout systems
         */
        getPosition: function () { return currentPosition.current; },
        /**
         * Externally sets bubble position with smooth animation
         * Only applies if bubble is not currently being dragged by user
         * Used for collision resolution and return-to-position animations
         */
        setPosition: function (pos) {
            if (!isDragging.current) {
                // Animate to new position using native driver for performance
                Animated.timing(translation, {
                    toValue: { x: pos.x, y: pos.y },
                    useNativeDriver: nativeDriverUsage,
                    duration: 1000 / 20, // Sync with UI update rate
                }).start();
                currentPosition.current = { x: pos.x, y: pos.y };
            }
        },
        /**
         * Returns current drag state - critical for collision system
         * Prevents collision resolution from interfering with user interactions
         */
        getIsDragging: function () { return isDragging.current; },
        /**
         * Collision avoidance state management
         * Allows parent to modify behavior dynamically based on menu state
         */
        getAvoidCollision: function () { return avoidCollision.current; },
        setAvoidCollision: function (value) {
            avoidCollision.current = value;
        },
    }); }, [originalX, originalY, translation]);
    var handlePress = useCallback(function () {
        if (onPress) {
            onPress();
        }
    }, [onPress]);
    return (React.createElement(Pressable, { key: item.key, onPress: handlePress }, function (_a) {
        var pressed = _a.pressed;
        return (React.createElement(BubbleComponent, __assign({}, item, { radius: radius, isPressed: pressed })));
    }));
});
export default BubbleWrapper;
