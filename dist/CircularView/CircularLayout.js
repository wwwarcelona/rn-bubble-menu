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
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDecay, withTiming } from 'react-native-reanimated';
import { SnapAngle } from './constants';
var defaultAnimationConfig = {
    deceleration: 0.99975,
};
var CircularView = function (props) {
    var radiusX = props.radiusX, radiusY = props.radiusY, _a = props.centralComponent, centralComponent = _a === void 0 ? null : _a, _b = props.rotateCentralComponent, rotateCentralComponent = _b === void 0 ? false : _b, _c = props.snappingEnabled, snappingEnabled = _c === void 0 ? true : _c, _d = props.index, index = _d === void 0 ? 0 : _d, onSnap = props.onSnap, onSnapStart = props.onSnapStart, _e = props.snapAngle, snapAngle = _e === void 0 ? SnapAngle.TOP : _e, _f = props.snapDuration, snapDuration = _f === void 0 ? 600 : _f, _g = props.gesturesEnabled, scrollEnabled = _g === void 0 ? true : _g, _h = props.animationConfig, animationConfig = _h === void 0 ? defaultAnimationConfig : _h, _j = props.childContainerStyle, childContainerStyle = _j === void 0 ? null : _j, onGestureStart = props.onGestureStart, onGestureEnd = props.onGestureEnd;
    var angle = useSharedValue(snapAngle);
    var initialTouchAngle = useSharedValue(0);
    var centerX = useSharedValue(0);
    var centerY = useSharedValue(0);
    var numberOfChildren = React.Children.count(props.children);
    var snapPoints = React.useMemo(function () {
        var points = [];
        for (var i = 0; i < numberOfChildren; i++) {
            points.push((2 * Math.PI * i) / numberOfChildren + snapAngle);
        }
        return points;
    }, [numberOfChildren]);
    var createPanGesture = function (theta, sizeX, sizeY) {
        return Gesture.Pan()
            .onStart(function (e) {
            onGestureStart && runOnJS(onGestureStart)();
            var radiusXValue = typeof radiusX === 'number' ? radiusX : radiusX.value;
            var radiusYValue = typeof radiusY === 'number' ? radiusY : radiusY.value;
            var elementX = centerX.value + radiusXValue * Math.cos(theta + angle.value) - sizeX.value / 2;
            var elementY = centerY.value + radiusYValue * Math.sin(theta + angle.value) - sizeY.value / 2;
            var touchX = elementX + e.x;
            var touchY = elementY + e.y;
            initialTouchAngle.value = Math.atan2((touchY - centerY.value) * radiusXValue, (touchX - centerX.value) * radiusYValue) - angle.value;
        })
            .onUpdate(function (e) {
            if (!scrollEnabled)
                return;
            var radiusXValue = typeof radiusX === 'number' ? radiusX : radiusX.value;
            var radiusYValue = typeof radiusY === 'number' ? radiusY : radiusY.value;
            var elementX = centerX.value + radiusXValue * Math.cos(theta + angle.value) - sizeX.value / 2;
            var elementY = centerY.value + radiusYValue * Math.sin(theta + angle.value) - sizeY.value / 2;
            var touchX = elementX + e.x;
            var touchY = elementY + e.y;
            var currentTouchAngle = Math.atan2((touchY - centerY.value) * radiusXValue, (touchX - centerX.value) * radiusYValue);
            angle.value = currentTouchAngle - initialTouchAngle.value;
        })
            .onEnd(function (e) {
            onGestureEnd && runOnJS(onGestureEnd)();
            if (!scrollEnabled)
                return;
            var velocityX = e.velocityX;
            var velocityY = e.velocityY;
            var radiusXValue = typeof radiusX === 'number' ? radiusX : radiusX.value;
            var radiusYValue = typeof radiusY === 'number' ? radiusY : radiusY.value;
            var elementX = centerX.value + radiusXValue * Math.cos(theta + angle.value) - sizeX.value / 2;
            var elementY = centerY.value + radiusYValue * Math.sin(theta + angle.value) - sizeY.value / 2;
            var touchX = elementX + e.x - centerX.value;
            var touchY = elementY + e.y - centerY.value;
            var direction = Math.abs(velocityX) > Math.abs(velocityY) ? Math.sign(velocityX) : Math.sign(velocityY);
            if (Math.abs(velocityX) > Math.abs(velocityY) && touchY > 0) {
                direction = -Math.sign(velocityX);
            }
            else if (Math.abs(velocityX) < Math.abs(velocityY) && touchX < 0) {
                direction = -Math.sign(velocityY);
            }
            var velocity = (Math.abs(velocityX) + Math.abs(velocityY)) / 200;
            if (!snappingEnabled) {
                angle.value = withDecay(__assign({ velocity: velocity * direction }, animationConfig));
            }
            else {
                angle.value = withDecay(__assign({ velocity: velocity * direction }, animationConfig), function () {
                    var distances = snapPoints.map(function (point) {
                        var distanceToFullRotation = (angle.value - point) % (2 * Math.PI);
                        return Math.abs(distanceToFullRotation) > Math.PI
                            ? 2 * Math.PI - Math.abs(distanceToFullRotation)
                            : Math.abs(distanceToFullRotation);
                    });
                    var minDistance = Math.min.apply(Math, distances);
                    var closestSnapIndex = distances.indexOf(minDistance);
                    // Calculate the actual snap point
                    var closestSnapPoint = snapPoints[closestSnapIndex];
                    var actualSnapPoint = closestSnapPoint + Math.round((angle.value - closestSnapPoint) / (2 * Math.PI)) * 2 * Math.PI;
                    var returnedSnapIndex = closestSnapIndex ? snapPoints.length - closestSnapIndex : 0; //This is because the elements are placed clockwise but rotating clockwise reduces the angle
                    onSnapStart && runOnJS(onSnapStart)(returnedSnapIndex);
                    angle.value = withTiming(actualSnapPoint, { duration: snapDuration }, function () {
                        if (onSnap) {
                            runOnJS(onSnap)(returnedSnapIndex);
                        }
                    });
                });
            }
        });
    };
    var createStyle = function (theta, sizeX, sizeY) {
        // Convert 35 degrees to radians for left rotation
        var rotationOffset = -45 * (Math.PI / 180); // Negative for left rotation
        var animatedStyle = useAnimatedStyle(function () {
            var radiusXValue = typeof radiusX === 'number' ? radiusX : radiusX.value;
            var radiusYValue = typeof radiusY === 'number' ? radiusY : radiusY.value;
            // Apply the rotation offset to theta
            var rotatedTheta = theta + rotationOffset;
            var x = centerX.value + radiusXValue * Math.cos(rotatedTheta + angle.value) - sizeX.value / 2;
            var y = centerY.value + radiusYValue * Math.sin(rotatedTheta + angle.value) - sizeY.value / 2;
            return {
                position: 'absolute',
                left: x,
                top: y,
            };
        });
        return [animatedStyle, childContainerStyle];
    };
    var rotatedCentralStyle = useAnimatedStyle(function () {
        return {
            transform: [{ rotate: angle.value + 'rad' }],
        };
    });
    var thetas = useMemo(function () {
        var thetas = [];
        for (var i = 0; i < numberOfChildren; i++) {
            thetas.push((2 * Math.PI * i) / numberOfChildren);
        }
        return thetas;
    }, [numberOfChildren]);
    useEffect(function () {
        if (index === -1)
            return;
        var invertedIndex = index ? snapPoints.length - index : 0;
        var snapPoint = snapPoints[invertedIndex] + Math.round((angle.value - snapPoints[invertedIndex]) / (2 * Math.PI)) * 2 * Math.PI;
        angle.value = withTiming(snapPoint, { duration: snapDuration }, function () {
            if (onSnap) {
                runOnJS(onSnap)(index);
            }
        });
    }, [index]);
    return (React.createElement(View, { style: styles.container, onLayout: function (event) {
            var _a = event.nativeEvent.layout, width = _a.width, height = _a.height;
            centerX.value = width / 2;
            centerY.value = height / 2;
        } },
        React.Children.map(props.children, function (child, ind) {
            var theta = thetas[ind];
            return (React.createElement(Item, { theta: theta, index: ind, createStyle: createStyle, createPanGesture: createPanGesture, child: child }));
        }),
        React.createElement(Animated.View, { style: rotateCentralComponent && rotatedCentralStyle }, centralComponent)));
};
var Item = function (_a) {
    var theta = _a.theta, index = _a.index, createStyle = _a.createStyle, createPanGesture = _a.createPanGesture, child = _a.child;
    var sizeX = useSharedValue(0);
    var sizeY = useSharedValue(0);
    var panGesture = createPanGesture(theta, sizeX, sizeY);
    var style = createStyle(theta, sizeX, sizeY);
    return (React.createElement(GestureDetector, { gesture: panGesture, key: index },
        React.createElement(Animated.View, { style: style, onLayout: function (event) {
                var _a = event.nativeEvent.layout, width = _a.width, height = _a.height;
                sizeX.value = width;
                sizeY.value = height;
            } }, child)));
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default CircularView;
