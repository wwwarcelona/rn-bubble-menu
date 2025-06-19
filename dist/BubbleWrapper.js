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
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable } from 'react-native';
import DefaultBubble from './DefaultBubble';
import { styles } from './styles';
// BubbleWrapper Component: Creates a draggable bubble with custom styling and behavior
var BubbleWrapper = forwardRef(function (_a, ref) {
    var _b;
    var item = _a.item, bubbleComponent = _a.bubbleComponent, setIsAnyBubbleDragging = _a.setIsAnyBubbleDragging, menuHeight = _a.menuHeight, menuWidth = _a.menuWidth;
    // Animation and state management
    var pan = useRef(new Animated.ValueXY()).current;
    var _c = useState({ x: item.originalX, y: item.originalY }), currentPosition = _c[0], setCurrentPosition = _c[1];
    var _d = useState(false), isDragging = _d[0], setIsDragging = _d[1];
    // Expose methods to parent component
    useImperativeHandle(ref, function () { return ({
        getPosition: function () { return currentPosition; },
        setPosition: function (pos) {
            if (!isDragging) {
                setCurrentPosition(pos);
            }
        },
        getIsDragging: function () { return isDragging; }
    }); });
    // Update parent component when dragging state changes
    useEffect(function () {
        setIsAnyBubbleDragging(isDragging);
    }, [isDragging]);
    // Helper to constrain position within bounds
    var clampPosition = function (x, y) {
        var radius = item.radius || 50;
        var minX = 0;
        var minY = 0;
        var maxX = menuWidth - radius * 2;
        var maxY = menuHeight - radius * 2;
        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y)),
        };
    };
    // Pan responder for drag and drop functionality
    var panResponder = useRef(PanResponder.create({
        // Start dragging on touch
        onStartShouldSetPanResponder: function () { return true; },
        onMoveShouldSetPanResponder: function () { return true; },
        // Handle movement
        onPanResponderMove: function (_, gesture) {
            var unclampedX = item.originalX + gesture.dx;
            var unclampedY = item.originalY + gesture.dy;
            var _a = clampPosition(unclampedX, unclampedY), x = _a.x, y = _a.y;
            pan.setValue({
                x: x - item.originalX,
                y: y - item.originalY
            });
            setCurrentPosition({ x: x, y: y });
            setIsDragging(true);
        },
        // Handle release
        onPanResponderRelease: function () {
            // Animate back to original position
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: true,
            }).start();
            setCurrentPosition({
                x: item.originalX,
                y: item.originalY
            });
            setIsDragging(false);
        },
    })).current;
    // Render the bubble with animation and touch handling
    return (React.createElement(Animated.View, __assign({ style: [
            styles.bubbleContainer,
            (_b = item.style) === null || _b === void 0 ? void 0 : _b.container,
            {
                transform: [
                    { translateX: pan.x },
                    { translateY: pan.y }
                ]
            }
        ] }, panResponder.panHandlers),
        React.createElement(Pressable, { key: item.key, style: function (_a) {
                var pressed = _a.pressed;
                return ({
                    opacity: pressed ? 0.8 : 1,
                });
            }, onPress: item.onPress }, (function () {
            var Component = bubbleComponent || DefaultBubble;
            return (React.createElement(Component, { id: item.id, label: item.id, radius: item.radius, originalX: item.originalX, originalY: item.originalY, text: item.text, icon: item.icon, style: item.style }));
        })())));
});
export default BubbleWrapper;
