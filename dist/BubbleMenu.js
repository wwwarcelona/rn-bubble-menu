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
import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View } from 'react-native';
import BubbleWrapper from './BubbleWrapper';
import { styles } from './styles';
import { K } from './constants';
/**
 * BubbleMenu Component
 *
 * A performant circular menu component that arranges bubbles in a radial pattern.
 * Features:
 * - Automatic collision detection and resolution
 * - Smooth animations back to original positions
 * - Drag and drop support for individual bubbles
 * - Configurable styling and bubble components
 * - Memory-efficient ref-based position tracking
 *
 */
var BubbleMenu = function (_a) {
    var items = _a.items, menuDistance = _a.menuDistance, height = _a.height, width = _a.width, _b = _a.bubbleRadius, bubbleRadius = _b === void 0 ? 50 : _b, _c = _a.collisionRadius, collisionRadius = _c === void 0 ? 20 : _c, _d = _a.menuRotation, menuRotation = _d === void 0 ? 4 : _d, style = _a.style, bubbleComponent = _a.bubbleComponent;
    console.log("BubbleMenu Rendered", new Date().toISOString());
    // Calculate viewport center coordinates for menu positioning
    var centerX = width / 2;
    var centerY = height / 2;
    /**
     * Component References and State Management
     * Using refs to avoid re-renders during frequent position updates
     */
    var bubbleRefs = useRef({});
    // Position tracking - stored in refs to prevent render cycles during animations
    var bubblePositionsRef = useRef({});
    var positionDifferencesRef = useRef({});
    var UISyncRef = useRef(1);
    var animationFrameRef = useRef(null);
    /**
     * Position Constraint Utilities
     * Ensures bubbles remain within visible bounds with proper padding
     */
    var constrainToWindow = useCallback(function (pos, radius) { return ({
        x: Math.max(40, Math.min(width - radius * 2 - 40, pos.x)),
        y: Math.max(0, Math.min(height - radius * 2, pos.y))
    }); }, [width, height]);
    var clampPosition = useCallback(function (pos, radius) { return ({
        x: Math.max(0, Math.min(width - radius * 2, pos.x)),
        y: Math.max(0, Math.min(height - radius * 2, pos.y))
    }); }, [width, height]);
    /**
     * Calculate initial bubble positions in circular layout
     * First item is center, remaining items are distributed in a circle
     * Uses menuRotation to adjust starting angle for better visual balance
     */
    var initialPositions = useMemo(function () {
        var positions = {};
        items.forEach(function (item, index) {
            var angle = index === 0 ? 0 : (index * (2 * Math.PI)) / (items.length - 1) - Math.PI / menuRotation;
            var radius = menuDistance + 130; // Additional offset for better spacing
            var distance = index === 0 ? 0 : radius;
            var x = centerX + Math.cos(angle) * distance - bubbleRadius;
            var y = centerY + Math.sin(angle) * distance - bubbleRadius;
            positions[item.id] = constrainToWindow({ x: x, y: y }, bubbleRadius);
        });
        return positions;
    }, [items, centerX, centerY, menuDistance, width, height, bubbleRadius, constrainToWindow, menuRotation]);
    // Initialize position tracking on mount - only runs once to prevent layout shifts
    useEffect(function () {
        bubblePositionsRef.current = __assign({}, initialPositions);
    }, [initialPositions]);
    /**
     * Updates bubble position in memory without triggering re-renders
     * This is crucial for performance during drag operations and animations
     */
    var updateBubblePosition = useCallback(function (id, newPosition) {
        var _a;
        bubblePositionsRef.current = __assign(__assign({}, bubblePositionsRef.current), (_a = {}, _a[id] = newPosition, _a));
    }, []);
    /**
     * Collision Detection System
     * Calculates distance and overlap between two bubbles for collision resolution
     */
    var getDistanceData = useCallback(function (idA, idB) {
        var bubbleAPos = bubblePositionsRef.current[idA];
        var bubbleBPos = bubblePositionsRef.current[idB];
        if (!bubbleAPos || !bubbleBPos)
            return null;
        var dx = bubbleBPos.x - bubbleAPos.x;
        var dy = bubbleBPos.y - bubbleAPos.y;
        var minDist = bubbleRadius * 2 + collisionRadius; // Collision radius buffer for visual separation
        return {
            distanceBetweenCenters: Math.hypot(dx, dy),
            dx: dx,
            dy: dy,
            minDist: minDist
        };
    }, [bubbleRadius]);
    /**
     * Checks if two specific bubbles are colliding
     * Returns collision state and the ID of the second bubble for chaining
     */
    var checkCollision = useCallback(function (idA, idB) {
        var distanceData = getDistanceData(idA, idB);
        if (!distanceData)
            return { isColliding: false, id: idB };
        var distanceBetweenCenters = distanceData.distanceBetweenCenters, minDist = distanceData.minDist;
        return { isColliding: distanceBetweenCenters < minDist, id: idB };
    }, [getDistanceData]);
    /**
     * Checks if a single bubble is colliding with any other bubble
     * Used for efficient collision detection before expensive resolution calculations
     */
    var checkIndividualCollision = useCallback(function (idA) {
        return items.some(function (other) {
            if (other.id === idA)
                return false;
            var distanceData = getDistanceData(idA, other.id);
            return distanceData && distanceData.distanceBetweenCenters < distanceData.minDist;
        });
    }, [items, getDistanceData]);
    /**
     * Collision Resolution Algorithm
     * Implements physics-based separation with overlap correction
     * Moves both bubbles apart by half the overlap distance
     */
    var handleCollision = useCallback(function (idA, idB) {
        var _a, _b;
        var distanceData = getDistanceData(idA, idB);
        if (!distanceData)
            return;
        var minDist = distanceData.minDist, dx = distanceData.dx, dy = distanceData.dy;
        var distance = Math.hypot(dx, dy);
        if (distance === 0)
            return;
        var overlap = minDist - distance;
        var moveX = (dx / distance) * (overlap / 2);
        var moveY = (dy / distance) * (overlap / 2);
        // Handle edge case where bubbles are perfectly aligned (zero movement)
        if (Math.abs(moveX) < 0.5 && Math.abs(moveY) < 0.5) {
            var nudge = 1;
            moveX = dx === 0 ? nudge : (dx / Math.abs(dx)) * nudge;
            moveY = dy === 0 ? nudge : (dy / Math.abs(dy)) * nudge;
        }
        var bubbleAPos = bubblePositionsRef.current[idA];
        var bubbleBPos = bubblePositionsRef.current[idB];
        if (!bubbleAPos || !bubbleBPos)
            return;
        var updatedPosA = clampPosition({
            x: bubbleAPos.x - moveX,
            y: bubbleAPos.y - moveY
        }, bubbleRadius);
        var updatedPosB = clampPosition({
            x: bubbleBPos.x + moveX,
            y: bubbleBPos.y + moveY
        }, bubbleRadius);
        // Only update positions for bubbles that aren't being dragged
        if (!((_a = bubbleRefs.current[idA]) === null || _a === void 0 ? void 0 : _a.getIsDragging())) {
            updateBubblePosition(idA, updatedPosA);
        }
        if (!((_b = bubbleRefs.current[idB]) === null || _b === void 0 ? void 0 : _b.getIsDragging())) {
            updateBubblePosition(idB, updatedPosB);
        }
    }, [getDistanceData, clampPosition, bubbleRadius, updateBubblePosition]);
    /**
     * Position Validation Utilities
     * Check if bubbles have moved from their intended positions
     */
    var isBubbleOutOfPosition = useCallback(function (id) {
        var initialPos = initialPositions[id];
        var bubblePos = bubblePositionsRef.current[id];
        if (!initialPos || !bubblePos)
            return false;
        var threshold = 1; // Minimum distance to consider "out of position"
        return Math.abs(initialPos.x - bubblePos.x) > threshold ||
            Math.abs(initialPos.y - bubblePos.y) > threshold;
    }, [initialPositions]);
    /**
     * Bulk position validation - returns both boolean result and array of displaced bubbles
     * Used to optimize the main animation loop by avoiding unnecessary calculations
     */
    var isAnyBubbleOutOfPosition = useCallback(function () {
        var bubblesOutOfPosition = [];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            if (isBubbleOutOfPosition(item.id)) {
                bubblesOutOfPosition.push(item.id);
            }
        }
        return { result: bubblesOutOfPosition.length > 0, array: bubblesOutOfPosition };
    }, [items, isBubbleOutOfPosition]);
    /**
     * Checks if any bubble is currently being dragged by the user
     * Used to modify collision behavior during drag operations
     */
    var isAnyBubbleDragging = useCallback(function () {
        var _a;
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var item = items_2[_i];
            if ((_a = bubbleRefs.current[item.id]) === null || _a === void 0 ? void 0 : _a.getIsDragging()) {
                return true;
            }
        }
        return false;
    }, [items]);
    /**
     * Predictive collision detection for path planning
     * Determines if moving a bubble to a target position would cause a collision
     */
    var willCollideAtPosition = function (id, targetPos) {
        for (var _i = 0, items_3 = items; _i < items_3.length; _i++) {
            var other = items_3[_i];
            if (other.id === id)
                continue;
            var otherPos = bubblePositionsRef.current[other.id];
            var dx = otherPos.x - targetPos.x;
            var dy = otherPos.y - targetPos.y;
            var minDist = (bubbleRadius !== null && bubbleRadius !== void 0 ? bubbleRadius : 50) * 2 + 10;
            if (Math.hypot(dx, dy) < minDist) {
                return true;
            }
        }
        return false;
    };
    /**
     * Smooth Animation System for Returning to Initial Positions
     * Implements eased movement with configurable collision handling
     *
     * @param ignoreCollisions - When true, moves bubbles regardless of potential collisions
     *                          When false, only moves if path is clear
     */
    var moveBubblesBackToInitialPositions = useCallback(function (ignoreCollisions) {
        var hasUpdates = false;
        items.forEach(function (item) {
            var bubble = bubbleRefs.current[item.id];
            if (!bubble || bubble.getIsDragging())
                return;
            var isOutOfPosition = isBubbleOutOfPosition(item.id);
            if (ignoreCollisions) {
                // Force movement back to original position (used when no drag is active)
                if (isOutOfPosition) {
                    var initialPos = initialPositions[item.id];
                    var bubblePos = bubblePositionsRef.current[item.id];
                    if (!initialPos || !bubblePos)
                        return;
                    // Eased movement - 50% of remaining distance per frame
                    var deltaX = (initialPos.x - bubblePos.x) * 0.5;
                    var deltaY = (initialPos.y - bubblePos.y) * 0.5;
                    var nextPos = {
                        x: Math.abs(deltaX) < 0.5 ? initialPos.x : bubblePos.x + deltaX,
                        y: Math.abs(deltaY) < 0.5 ? initialPos.y : bubblePos.y + deltaY
                    };
                    updateBubblePosition(item.id, nextPos);
                    hasUpdates = true;
                }
            }
            else {
                // Collision-aware movement (used during drag operations)
                var collision = checkIndividualCollision(item.id);
                if (!collision && isOutOfPosition) {
                    var initialPos = initialPositions[item.id];
                    var bubblePos = bubblePositionsRef.current[item.id];
                    if (!initialPos || !bubblePos)
                        return;
                    var deltaX = (initialPos.x - bubblePos.x) * 0.5;
                    var deltaY = (initialPos.y - bubblePos.y) * 0.5;
                    var nextPos = {
                        x: Math.abs(deltaX) < 0.5 ? initialPos.x : bubblePos.x + deltaX,
                        y: Math.abs(deltaY) < 0.5 ? initialPos.y : bubblePos.y + deltaY
                    };
                    // Only move if the path is clear
                    if (!willCollideAtPosition(item.id, nextPos)) {
                        updateBubblePosition(item.id, nextPos);
                        hasUpdates = true;
                    }
                }
            }
        });
        return hasUpdates;
    }, [items, checkIndividualCollision, isBubbleOutOfPosition, initialPositions, updateBubblePosition]);
    /**
     * UI Synchronization System
     * Smoothly syncs the visual bubble positions with the logical positions
     * Uses interpolation to create smooth 60fps animations
     */
    var updateUI = useCallback(function () {
        var hasUIUpdates = false;
        for (var _i = 0, items_4 = items; _i < items_4.length; _i++) {
            var item = items_4[_i];
            var bubble = bubbleRefs.current[item.id];
            if (!bubble)
                continue;
            var UIPos = bubble.getPosition(); // Current visual position
            var logicPos = bubblePositionsRef.current[item.id]; // Target logical position
            if (!logicPos)
                continue;
            // Calculate position difference on first sync cycle
            if (UISyncRef.current === 1) {
                positionDifferencesRef.current[item.id] = {
                    x: logicPos.x - UIPos.x,
                    y: logicPos.y - UIPos.y
                };
            }
            var positionDifference = positionDifferencesRef.current[item.id];
            bubble.setPosition({ x: UIPos.x + positionDifference.x, y: UIPos.y + positionDifference.y });
            // if (positionDifference && (Math.abs(positionDifference.x) > 0.1 || Math.abs(positionDifference.y) > 0.1)) {
            //   // Interpolate towards target position
            //   const stepSize = 1 / K.FPS_SYNC;
            //   const step = {
            //     x: positionDifference.x * stepSize,
            //     y: positionDifference.y * stepSize
            //   };
            //   const newPos = {
            //     x: UIPos.x + step.x,
            //     y: UIPos.y + step.y
            //   };
            //   bubble.setPosition(newPos);
            //   hasUIUpdates = true;
            // }
        }
        return hasUIUpdates;
    }, [items]);
    /**
     * Dual-Loop Animation Architecture
     * Separates physics logic from UI updates for optimal performance
     *
     * Logic Loop (K.FPS_LOGIC): Handles collision detection and position calculations
     * UI Loop (K.FPS_UI): Handles smooth visual updates and interpolation
     */
    useEffect(function () {
        var logicTimeoutId;
        // let uiTimeoutId: NodeJS.Timeout;
        /**
         * Physics and Logic Loop
         * Processes collision detection, resolution, and position updates
         */
        var runLogicLoop = function () {
            var _a = isAnyBubbleOutOfPosition(), result = _a.result, array = _a.array;
            var ignoreCollisions = true;
            if (result) {
                if (isAnyBubbleDragging()) {
                    ignoreCollisions = false;
                    // Process collisions for displaced bubbles
                    for (var i = 0; i < array.length; i++) {
                        var previouslyChecked = new Set(array.slice(0, i));
                        for (var _i = 0, items_5 = items; _i < items_5.length; _i++) {
                            var item = items_5[_i];
                            if (array[i] === item.id || previouslyChecked.has(item.id))
                                continue;
                            if (checkCollision(array[i], item.id).isColliding) {
                                handleCollision(array[i], item.id);
                            }
                        }
                    }
                }
                updateUI();
                moveBubblesBackToInitialPositions(ignoreCollisions);
            }
            logicTimeoutId = setTimeout(runLogicLoop, 1000 / K.FPS_LOGIC);
        };
        /**
         * UI Update Loop
         * Handles smooth visual interpolation and rendering
         */
        // const runUILoop = () => {
        //   if (isAnyBubbleOutOfPosition().result) {
        //     updateUI();
        //     UISyncRef.current = (UISyncRef.current % 3) + 1;
        //   }
        //   uiTimeoutId = setTimeout(runUILoop, 1000 / K.FPS_UI);
        // };
        // Start both loops
        logicTimeoutId = setTimeout(runLogicLoop, 1000 / K.FPS_LOGIC);
        // uiTimeoutId = setTimeout(runUILoop, 1000 / K.FPS_UI);
        // Cleanup on component unmount
        return function () {
            clearTimeout(logicTimeoutId);
            // clearTimeout(uiTimeoutId);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);
    /**
     * Memoized Component Rendering
     * Prevents unnecessary re-renders of bubble components during animations
     */
    // Center bubble (first item) - positioned at the center of the menu
    var centerBubble = useMemo(function () {
        var _a, _b, _c, _d;
        return (React.createElement(BubbleWrapper, { key: items[0].id, item: __assign(__assign({}, items[0]), { radius: bubbleRadius, originalX: (_b = (_a = initialPositions[items[0].id]) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0, originalY: (_d = (_c = initialPositions[items[0].id]) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0, style: style === null || style === void 0 ? void 0 : style.bubble }), bubbleComponent: bubbleComponent, updateBubblePositions: updateBubblePosition, height: height, width: width, ref: function (ref) {
                if (ref) {
                    bubbleRefs.current[items[0].id || ""] = ref;
                }
            } }));
    }, [items[0], bubbleRadius, initialPositions, style === null || style === void 0 ? void 0 : style.bubble, bubbleComponent, updateBubblePosition, height, width]);
    // Surrounding bubbles - arranged in a circle around the center
    var surroundingBubbles = useMemo(function () {
        return items.slice(1).map(function (item) {
            var _a, _b, _c, _d;
            return (React.createElement(BubbleWrapper, { key: item.id, item: __assign(__assign({}, item), { radius: bubbleRadius, originalX: (_b = (_a = initialPositions[item.id]) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0, originalY: (_d = (_c = initialPositions[item.id]) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0, style: style === null || style === void 0 ? void 0 : style.bubble }), bubbleComponent: bubbleComponent, updateBubblePositions: updateBubblePosition, height: height, width: width, ref: function (ref) {
                    if (ref) {
                        bubbleRefs.current[item.id] = ref;
                    }
                } }));
        });
    }, [items, bubbleRadius, initialPositions, style === null || style === void 0 ? void 0 : style.bubble, bubbleComponent, updateBubblePosition, height, width]);
    return (React.createElement(View, { style: [styles.container, style === null || style === void 0 ? void 0 : style.container] },
        surroundingBubbles,
        centerBubble));
};
export default React.memo(BubbleMenu);
