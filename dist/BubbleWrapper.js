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
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, } from 'react';
import { Animated, PanResponder, Pressable } from 'react-native';
import { K } from './constants';
import DefaultBubble from './DefaultBubble';
import { styles } from './styles';
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
    var _b;
    var item = _a.item, _c = _a.bubbleComponent, BubbleComponent = _c === void 0 ? DefaultBubble : _c, updateBubblePositions = _a.updateBubblePositions, height = _a.height, width = _a.width;
    console.log("BubbleWrapper Rendered: ", item.id);
    // Extract bubble configuration with sensible defaults
    var id = item.id, _d = item.originalX, originalX = _d === void 0 ? 0 : _d, _e = item.originalY, originalY = _e === void 0 ? 0 : _e, _f = item.radius, radius = _f === void 0 ? 50 : _f, onPress = item.onPress;
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
        if (!isDragging.current && onPress) {
            onPress();
        }
    }, [onPress]);
    /**
     * Boundary Constraint System
     * Ensures bubbles remain within visible container bounds
     * Accounts for bubble radius to prevent visual clipping
     */
    var clampPosition = useCallback(function (x, y) {
        var minX = 0;
        var minY = 0;
        var maxX = width - radius * 2; // Account for full bubble width
        var maxY = height - radius * 2; // Account for full bubble height
        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y)),
        };
    }, [width, height, radius]);
    /**
     * Advanced Gesture Handling System
     * Implements sophisticated drag-and-drop with spring-back animation
     * Optimized for performance with throttled updates and native animations
     */
    var panResponder = useMemo(function () {
        return PanResponder.create({
            // Always capture touch events for this bubble
            onStartShouldSetPanResponder: function () { return true; },
            onMoveShouldSetPanResponder: function () { return true; },
            /**
             * Drag Start Handler
             * Sets drag state to prevent external position interference
             */
            onPanResponderGrant: function () {
                isDragging.current = true;
            },
            /**
             * Drag Move Handler - Core Animation Logic
             * Handles real-time position updates with boundary constraints
             * Uses cumulative gesture delta for accurate positioning
             */
            onPanResponderMove: function (_, gesture) {
                // Calculate target position: original position + total gesture movement
                // This approach prevents drift that can occur with incremental updates
                var targetX = originalX + gesture.dx;
                var targetY = originalY + gesture.dy;
                // Apply boundary constraints to prevent bubbles from leaving viewport
                var clampedPosition = clampPosition(targetX, targetY);
                // Update logical position for collision detection system
                currentPosition.current = clampedPosition;
                var now = Date.now();
                // Throttled drag update
                // Only update at UI frame rate to avoid overwhelming the system
                if (now - lastUIUpdateRef.current >= UI_FRAME_INTERVAL) {
                    Animated.timing(translation, {
                        toValue: { x: clampedPosition.x, y: clampedPosition.y },
                        useNativeDriver: nativeDriverUsage,
                        duration: 1000 / K.FPS_UI, // Sync with UI update rate
                    }).start();
                    lastUIUpdateRef.current = now;
                }
                // Throttled parent notification to prevent performance degradation
                // Only update parent at logic frame rate to avoid overwhelming the system
                if (now - lastLogicUpdateRef.current >= LOGIC_FRAME_INTERVAL) {
                    updateBubblePositions(id, currentPosition.current);
                    lastLogicUpdateRef.current = now;
                }
            },
            /**
             * Drag End Handler - Spring-Back Animation
             * Implements smooth return to original position with spring physics
             */
            onPanResponderRelease: function () {
                isDragging.current = false;
                // Animate back to original position using spring physics
                Animated.spring(translation, {
                    toValue: { x: originalX, y: originalY },
                    useNativeDriver: nativeDriverUsage,
                    // Spring configuration can be customized here for feel
                }).start();
                // Reset logical position and notify parent immediately
                // This ensures collision system knows the bubble is returning home
                currentPosition.current = { x: originalX, y: originalY };
                updateBubblePositions(id, { x: originalX, y: originalY });
                // Reset throttling state for next drag operation
                lastLogicUpdateRef.current = 0;
            },
        });
    }, [id, originalX, originalY, clampPosition, updateBubblePositions, translation]);
    /**
     * Animation Style Configuration
     * Applies the translate transform from the animated value
     * Uses native driver for optimal performance
     */
    var animatedStyle = {
        transform: translation.getTranslateTransform(),
    };
    return (React.createElement(Animated.View, __assign({ style: [
            styles.bubbleContainer,
            (_b = item.style) === null || _b === void 0 ? void 0 : _b.container,
            animatedStyle,
        ] }, panResponder.panHandlers),
        React.createElement(Pressable, { key: item.key, onPressOut: handlePress }, function (_a) {
            var pressed = _a.pressed;
            return (React.createElement(BubbleComponent, __assign({}, item, { radius: radius, isPressed: pressed })));
        })));
});
export default React.memo(BubbleWrapper);
