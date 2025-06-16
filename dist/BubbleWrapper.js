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
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Animated, PanResponder, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import DefaultBubble from './DefaultBubble';
// BubbleWrapper Component: Creates a draggable bubble with custom styling and behavior
var BubbleWrapper = forwardRef(function (_a, ref) {
    var label = _a.label, radius = _a.radius, originalX = _a.originalX, originalY = _a.originalY, text = _a.text, icon = _a.icon, style = _a.style, bubbleComponent = _a.bubbleComponent, setIsAnyBubbleDragging = _a.setIsAnyBubbleDragging;
    // Animation and state management
    var pan = useRef(new Animated.ValueXY()).current;
    var _b = useState({ x: originalX, y: originalY }), currentPosition = _b[0], setCurrentPosition = _b[1];
    var _c = useState(false), isDragging = _c[0], setIsDragging = _c[1];
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
    // Pan responder for drag and drop functionality
    var panResponder = useRef(PanResponder.create({
        // Start dragging on touch
        onStartShouldSetPanResponder: function () { return true; },
        onMoveShouldSetPanResponder: function () { return true; },
        // Handle movement
        onPanResponderMove: function (_, gesture) {
            pan.setValue({
                x: gesture.dx,
                y: gesture.dy,
            });
            setCurrentPosition({
                x: originalX + gesture.dx,
                y: originalY + gesture.dy
            });
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
                x: originalX,
                y: originalY
            });
            setIsDragging(false);
        },
    })).current;
    // Render the bubble with animation and touch handling
    return (React.createElement(Animated.View, __assign({ style: [
            styles.bubbleContainer,
            style === null || style === void 0 ? void 0 : style.container,
            {
                transform: [
                    { translateX: pan.x },
                    { translateY: pan.y }
                ]
            }
        ] }, panResponder.panHandlers),
        React.createElement(TouchableOpacity, { onPress: function () {
                console.log("Bubble ", label, " pressed");
            } }, React.createElement(bubbleComponent || DefaultBubble, {
            label: label,
            radius: radius,
            originalX: originalX,
            originalY: originalY,
            text: text,
            icon: icon,
            style: style,
        }))));
});
export default BubbleWrapper;
