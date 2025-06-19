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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import BubbleWrapper from './BubbleWrapper';
import { styles } from './styles';
// BubbleMenu Component: Creates a circular menu with draggable bubbles that can interact with each other
var BubbleMenu = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var items = _a.items, menuDistance = _a.menuDistance, height = _a.height, width = _a.width, bubbleRadius = _a.bubbleRadius, style = _a.style, bubbleComponent = _a.bubbleComponent;
    // Window dimensions and center points
    var centerX = width / 2;
    var centerY = height / 2;
    if (bubbleRadius === undefined) {
        bubbleRadius = 50;
    }
    // Refs and State
    var bubbleRefs = useRef({});
    var _k = useState(false), isAnyBubbleDragging = _k[0], setIsAnyBubbleDragging = _k[1];
    // Utility Functions
    // Keep position within window bounds
    var constrainToWindow = function (pos, radius) { return ({
        x: Math.max(40, Math.min(width - radius * 2 - 40, pos.x)),
        y: Math.max(0, Math.min(height - radius * 2, pos.y))
    }); };
    // Calculates initial positions for all bubbles in a circular formation
    var initialPositions = useMemo(function () {
        return items.map(function (item, index) {
            var menuRotation = 4; // Controls the rotation of the bubble formation
            var angle = index === 0 ? 0 : (index * (2 * Math.PI)) / (items.length - 1) - Math.PI / menuRotation;
            var radius = menuDistance + 130; // Distance between bubbles, minimum distance is 130
            var distance = index === 0 ? 0 : radius;
            var x = centerX + Math.cos(angle) * distance - bubbleRadius;
            var y = centerY + Math.sin(angle) * distance - bubbleRadius;
            return constrainToWindow({ x: x, y: y }, bubbleRadius); // Constrain the position to the window bounds
        });
    }, [items, centerX, centerY, menuDistance, width, height]);
    var _l = useState(initialPositions), bubblePositions = _l[0], setBubblePositions = _l[1]; // State for the positions of the bubbles
    console.log("bubblePositions", bubblePositions);
    // Bubble State Management
    // Checks if a specific bubble is being dragged
    var isBubbleDragging = function (i) { var _a; return (_a = bubbleRefs.current[items[i].id]) === null || _a === void 0 ? void 0 : _a.getIsDragging(); };
    // Get distance data between two bubbles
    var getDistanceData = function (i, j) {
        var bubbles = bubbleRefs.current;
        var bubbleA = bubbles[items[i].id];
        var bubbleB = bubbles[items[j].id];
        if (!bubbleA || !bubbleB) {
            throw new Error("Bubble references not found for indices ".concat(i, " and ").concat(j));
        }
        var bubbleAPos = bubbleA.getPosition();
        var bubbleBPos = bubbleB.getPosition();
        var dx = bubbleBPos.x - bubbleAPos.x;
        var dy = bubbleBPos.y - bubbleAPos.y;
        var minDist = bubbleRadius + bubbleRadius + 10; // Minimum distance between bubbles
        return {
            distanceBetweenCenters: Math.hypot(dx, dy),
            dx: dx,
            dy: dy,
            bubbleA: bubbleA,
            bubbleB: bubbleB,
            minDist: minDist
        };
    };
    // Collision Detection: Checks for collisions between bubbles
    function checkCollision(i, j) {
        if (j !== undefined) {
            var _a = getDistanceData(i, j), distanceBetweenCenters = _a.distanceBetweenCenters, minDist = _a.minDist;
            return { isColliding: distanceBetweenCenters < minDist, index: j };
        }
        // Check collision with all other bubbles
        for (var j_1 = 0; j_1 < items.length; j_1++) {
            if (i === j_1)
                continue;
            var _b = getDistanceData(i, j_1), distanceBetweenCenters = _b.distanceBetweenCenters, minDist = _b.minDist;
            if (distanceBetweenCenters < minDist) {
                return { isColliding: true, index: j_1 };
            }
        }
        return { isColliding: false, index: undefined };
    }
    // Handle collision between two bubbles
    var handleCollision = function (i, j) {
        // Distance data fetching
        var _a = getDistanceData(i, j), minDist = _a.minDist, bubbleA = _a.bubbleA, bubbleB = _a.bubbleB, dx = _a.dx, dy = _a.dy;
        if (!bubbleA || !bubbleB) {
            console.warn('Cannot handle collision: bubble references are null');
            return;
        }
        else {
            console.log("Handling collision between ", items[i].id, " and ", items[j].id);
        }
        var distance = Math.hypot(dx, dy);
        if (distance === 0)
            return; // Prevent division by zero
        var overlap = minDist - distance;
        var moveX = (dx / distance) * (overlap / 2);
        var moveY = (dy / distance) * (overlap / 2);
        // If movement is too small, force a nudge
        if (Math.abs(moveX) < 0.5 && Math.abs(moveY) < 0.5) {
            var nudge = 1;
            moveX = dx === 0 ? nudge : (dx / Math.abs(dx)) * nudge;
            moveY = dy === 0 ? nudge : (dy / Math.abs(dy)) * nudge;
        }
        var bubbleAPos = bubbleA.getPosition();
        var bubbleBPos = bubbleB.getPosition();
        console.log("Move X: ", moveX);
        console.log("Move Y: ", moveY);
        console.log("Bubble A Pos: ", bubbleAPos);
        console.log("Bubble B Pos: ", bubbleBPos);
        // Update positions with smooth interpolation
        var updatedPosA = {
            x: bubbleAPos.x - moveX,
            y: bubbleAPos.y - moveY
        };
        var updatedPosB = {
            x: bubbleBPos.x + moveX,
            y: bubbleBPos.y + moveY
        };
        console.log("Updated Pos A: ", updatedPosA);
        console.log("Updated Pos B: ", updatedPosB);
        // Apply new positions
        bubbleA.setPosition(updatedPosA);
        bubbleB.setPosition(updatedPosB);
        // Update state
        setBubblePositions(function (prev) {
            var newPositions = __spreadArray([], prev, true);
            if (!bubbleA.getIsDragging())
                newPositions[i] = bubbleA.getPosition();
            if (!bubbleB.getIsDragging())
                newPositions[j] = bubbleB.getPosition();
            return newPositions;
        });
    };
    var isBubbleOutOfPosition = function (index) {
        var initialPos = initialPositions[index];
        var bubble = bubbleRefs.current[items[index].id];
        var bubblePos = bubble === null || bubble === void 0 ? void 0 : bubble.getPosition();
        if (!bubble) {
            console.warn("Bubble reference not found for ".concat(items[index].id));
            return false;
        }
        var roundedInitialX = Math.round(initialPos.x);
        var roundedInitialY = Math.round(initialPos.y);
        var roundedBubbleX = Math.round(bubblePos.x);
        var roundedBubbleY = Math.round(bubblePos.y);
        return roundedInitialX !== roundedBubbleX || roundedInitialY !== roundedBubbleY;
    };
    // Check if any bubble is out of position
    var isAnyBubbleOutOfPosition = function () {
        return items.some(function (item) {
            var index = items.indexOf(item);
            var initialPos = initialPositions[index];
            var bubble = bubbleRefs.current[item.id];
            if (!bubble) {
                console.warn("Bubble reference not found for ".concat(item.id));
                return false;
            }
            var bubblePos = bubble.getPosition();
            // Compare positions with no decimals
            var roundedInitialX = Math.round(initialPos.x);
            var roundedInitialY = Math.round(initialPos.y);
            var roundedBubbleX = Math.round(bubblePos.x);
            var roundedBubbleY = Math.round(bubblePos.y);
            return roundedInitialX !== roundedBubbleX || roundedInitialY !== roundedBubbleY;
        });
    };
    // Helper: Check if moving a bubble to a position would cause a collision
    var willCollideAtPosition = function (bubbleIndex, targetPos) {
        for (var j = 0; j < items.length; j++) {
            if (j === bubbleIndex)
                continue;
            var otherBubble = bubbleRefs.current[items[j].id];
            if (!otherBubble)
                continue;
            var otherPos = otherBubble.getPosition();
            var dx = otherPos.x - targetPos.x;
            var dy = otherPos.y - targetPos.y;
            var minDist = (bubbleRadius !== null && bubbleRadius !== void 0 ? bubbleRadius : 50) * 2 + 10;
            if (Math.hypot(dx, dy) < minDist) {
                return true;
            }
        }
        return false;
    };
    // Move bubbles back to their initial positions
    var moveBubblesBackToInitialPositions = function () {
        items.forEach(function (item) {
            var index = items.indexOf(item);
            var collision = checkCollision(items.indexOf(item));
            var movableBubble = !collision.isColliding && isBubbleOutOfPosition(index);
            if (!isBubbleDragging(items.indexOf(item)) && movableBubble) {
                var initialPos = initialPositions[index];
                var bubble_1 = bubbleRefs.current[item.id];
                if (!bubble_1) {
                    console.warn("Bubble reference not found for ".concat(item.id));
                    return;
                }
                if (!bubble_1.getIsDragging()) {
                    var bubblePos = bubble_1.getPosition();
                    var deltaX = (initialPos.x - bubblePos.x) * 0.05;
                    var deltaY = (initialPos.y - bubblePos.y) * 0.05;
                    var nextPos = {
                        x: Math.abs(initialPos.x - bubblePos.x) < 0.5 ? initialPos.x : bubblePos.x + deltaX,
                        y: Math.abs(initialPos.y - bubblePos.y) < 0.5 ? initialPos.y : bubblePos.y + deltaY
                    };
                    // Only move if it won't cause a collision
                    if (!willCollideAtPosition(index, nextPos)) {
                        bubble_1.setPosition(nextPos);
                    }
                }
                setBubblePositions(function (prev) {
                    var newPositions = __spreadArray([], prev, true);
                    if (!bubble_1.getIsDragging()) {
                        newPositions[index] = bubble_1.getPosition();
                    }
                    return newPositions;
                });
            }
        });
    };
    // Collision Detection Effect
    useEffect(function () {
        var interval = setInterval(function () {
            if (isAnyBubbleDragging || isAnyBubbleOutOfPosition()) {
                // Check for collisions between all bubble pairs
                for (var i = 0; i < items.length; i++) {
                    for (var j = i + 1; j < items.length; j++) {
                        if (checkCollision(i, j).isColliding) {
                            handleCollision(i, j);
                        }
                    }
                }
                moveBubblesBackToInitialPositions();
            }
        }, 1000 / 60); // 60 FPS
        return function () { return clearInterval(interval); };
    }, []);
    // Render
    return (React.createElement(View, { style: [styles.container, style === null || style === void 0 ? void 0 : style.container] },
        React.createElement(View, { style: [
                styles.centerBubble,
                style === null || style === void 0 ? void 0 : style.centerBubble,
                {
                    left: (_c = (_b = bubblePositions[0]) === null || _b === void 0 ? void 0 : _b.x) !== null && _c !== void 0 ? _c : 0,
                    top: (_e = (_d = bubblePositions[0]) === null || _d === void 0 ? void 0 : _d.y) !== null && _e !== void 0 ? _e : 0
                }
            ] },
            React.createElement(BubbleWrapper, { item: __assign(__assign({}, items[0]), { radius: bubbleRadius, originalX: (_g = (_f = initialPositions[0]) === null || _f === void 0 ? void 0 : _f.x) !== null && _g !== void 0 ? _g : 0, originalY: (_j = (_h = initialPositions[0]) === null || _h === void 0 ? void 0 : _h.y) !== null && _j !== void 0 ? _j : 0, style: style === null || style === void 0 ? void 0 : style.bubble }), bubbleComponent: bubbleComponent, setIsAnyBubbleDragging: setIsAnyBubbleDragging, ref: function (ref) {
                    if (ref) {
                        bubbleRefs.current[items[0].id || ""] = {
                            getPosition: ref.getPosition,
                            setPosition: ref.setPosition,
                            getIsDragging: ref.getIsDragging
                        };
                    }
                } })),
        items.slice(1).map(function (item, index) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var actualIndex = index + 1;
            return (React.createElement(View, { key: item.id, style: [
                    styles.bubbleContainer,
                    style === null || style === void 0 ? void 0 : style.menuBubbleContainer,
                    {
                        left: (_b = (_a = bubblePositions[actualIndex]) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0,
                        top: (_d = (_c = bubblePositions[actualIndex]) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0,
                    }
                ] },
                React.createElement(BubbleWrapper, { item: __assign(__assign({}, item), { radius: bubbleRadius, originalX: (_f = (_e = initialPositions[actualIndex]) === null || _e === void 0 ? void 0 : _e.x) !== null && _f !== void 0 ? _f : 0, originalY: (_h = (_g = initialPositions[actualIndex]) === null || _g === void 0 ? void 0 : _g.y) !== null && _h !== void 0 ? _h : 0, style: style === null || style === void 0 ? void 0 : style.bubble }), bubbleComponent: bubbleComponent, setIsAnyBubbleDragging: setIsAnyBubbleDragging, ref: function (ref) {
                        if (ref) {
                            bubbleRefs.current[item.id] = {
                                getPosition: ref.getPosition,
                                setPosition: ref.setPosition,
                                getIsDragging: ref.getIsDragging
                            };
                        }
                    } })));
        })));
};
export default BubbleMenu;
