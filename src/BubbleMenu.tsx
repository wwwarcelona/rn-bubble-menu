import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import type { BubbleProps, BubbleStyleProps, Position } from './BubbleWrapper';
import BubbleWrapper from './BubbleWrapper';
import { styles } from './styles';
import { K } from './constants';

/**
 * Style configuration for the BubbleMenu component
 * Provides granular control over styling for different menu elements
 */
export interface BubbleMenuStyleProps {
  container?: ViewStyle;
  centerBubble?: ViewStyle;
  menuBubbleContainer?: ViewStyle;
  bubble?: BubbleStyleProps;
}

/**
 * Props interface for the BubbleMenu component
 * Implements a circular menu layout with collision detection and smooth animations
 */
interface BubbleMenuProps {
  items: BubbleProps[] // Menu items - first item becomes the center bubble
  menuDistance: number // Distance from center to surrounding bubbles (in pixels)
  height: number // Container height constraint
  width: number // Container width constraint
  bubbleRadius?: number // Radius of each bubble (default: 50px)
  menuRotation?: number // Number used to rotate the bubble
  style?: BubbleMenuStyleProps // Style overrides for menu components
  bubbleComponent?: React.ComponentType<BubbleProps>; // Custom bubble component renderer
}

/**
 * Ref interface for individual bubble components
 * Provides imperative API for position management and drag state
 */
type BubbleRef = {
  getPosition: () => Position;
  setPosition: (pos: Position) => void;
  getIsDragging: () => boolean;
  getAvoidCollision: () => boolean;
  setAvoidCollision: (value: boolean) => void;
} | null;

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
const BubbleMenu = ({ items, menuDistance, height, width, bubbleRadius = 50, menuRotation = 4, style, bubbleComponent } : BubbleMenuProps) => {
  console.log("BubbleMenu Rendered", new Date().toISOString());
  
  // Calculate viewport center coordinates for menu positioning
  const centerX = width / 2;
  const centerY = height / 2;

  /**
   * Component References and State Management
   * Using refs to avoid re-renders during frequent position updates
   */
  const bubbleRefs = useRef<Record<string, BubbleRef>>({});
  
  // Position tracking - stored in refs to prevent render cycles during animations
  const bubblePositionsRef = useRef<Record<string, Position>>({});
  const positionDifferencesRef = useRef<Record<string, Position>>({});
  const UISyncRef = useRef<number>(1);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Position Constraint Utilities
   * Ensures bubbles remain within visible bounds with proper padding
   */
  const constrainToWindow = useCallback((pos: Position, radius: number): Position => ({
    x: Math.max(40, Math.min(width - radius * 2 - 40, pos.x)),
    y: Math.max(0, Math.min(height - radius * 2, pos.y))
  }), [width, height]);

  const clampPosition = useCallback((pos: Position, radius: number): Position => ({
    x: Math.max(0, Math.min(width - radius * 2, pos.x)),
    y: Math.max(0, Math.min(height - radius * 2, pos.y))
  }), [width, height]);

  /**
   * Calculate initial bubble positions in circular layout
   * First item is center, remaining items are distributed in a circle
   * Uses menuRotation to adjust starting angle for better visual balance
   */
  const initialPositions = useMemo(() => {
    const positions: Record<string, Position> = {};
    items.forEach((item, index) => {
      const angle = index === 0 ? 0 : (index * (2 * Math.PI)) / (items.length - 1) - Math.PI / menuRotation;
      const radius = menuDistance + 130; // Additional offset for better spacing
      const distance = index === 0 ? 0 : radius;
      const x = centerX + Math.cos(angle) * distance - bubbleRadius;
      const y = centerY + Math.sin(angle) * distance - bubbleRadius;
      positions[item.id] = constrainToWindow({ x, y }, bubbleRadius);
    });
    return positions;
  }, [items, centerX, centerY, menuDistance, width, height, bubbleRadius, constrainToWindow, menuRotation]);

  // Initialize position tracking on mount - only runs once to prevent layout shifts
  useEffect(() => {
    bubblePositionsRef.current = { ...initialPositions };
  }, [initialPositions]);

  /**
   * Updates bubble position in memory without triggering re-renders
   * This is crucial for performance during drag operations and animations
   */
  const updateBubblePosition = useCallback((id: string, newPosition: Position) => {
    bubblePositionsRef.current = {
      ...bubblePositionsRef.current,
      [id]: newPosition
    };
  }, []);

  /**
   * Collision Detection System
   * Calculates distance and overlap between two bubbles for collision resolution
   */
  const getDistanceData = useCallback((idA: string, idB: string) => {
    const bubbleAPos = bubblePositionsRef.current[idA];
    const bubbleBPos = bubblePositionsRef.current[idB];
    if (!bubbleAPos || !bubbleBPos) return null;
    
    const dx = bubbleBPos.x - bubbleAPos.x;
    const dy = bubbleBPos.y - bubbleAPos.y;
    const minDist = bubbleRadius * 2 + 10; // 10px buffer for visual separation

    return { 
      distanceBetweenCenters: Math.hypot(dx, dy), 
      dx, 
      dy, 
      minDist 
    };
  }, [bubbleRadius]);

  /**
   * Checks if two specific bubbles are colliding
   * Returns collision state and the ID of the second bubble for chaining
   */
  const checkCollision = useCallback((idA: string, idB: string): { isColliding: boolean, id: string } => {
    const distanceData = getDistanceData(idA, idB);
    if (!distanceData) return { isColliding: false, id: idB };
    
    const { distanceBetweenCenters, minDist } = distanceData;
    return { isColliding: distanceBetweenCenters < minDist, id: idB };
  }, [getDistanceData]);

  /**
   * Checks if a single bubble is colliding with any other bubble
   * Used for efficient collision detection before expensive resolution calculations
   */
  const checkIndividualCollision = useCallback((idA: string) => {
    return items.some(other => {
      if (other.id === idA) return false;
      const distanceData = getDistanceData(idA, other.id);
      return distanceData && distanceData.distanceBetweenCenters < distanceData.minDist;
    });
  }, [items, getDistanceData]);

  /**
   * Collision Resolution Algorithm
   * Implements physics-based separation with overlap correction
   * Moves both bubbles apart by half the overlap distance
   */
  const handleCollision = useCallback((idA: string, idB: string) => {
    const distanceData = getDistanceData(idA, idB);
    if (!distanceData) return;

    const { minDist, dx, dy } = distanceData;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return;

    const overlap = minDist - distance;
    let moveX = (dx / distance) * (overlap / 2);
    let moveY = (dy / distance) * (overlap / 2);
    
    // Handle edge case where bubbles are perfectly aligned (zero movement)
    if (Math.abs(moveX) < 0.5 && Math.abs(moveY) < 0.5) {
      const nudge = 1;
      moveX = dx === 0 ? nudge : (dx / Math.abs(dx)) * nudge;
      moveY = dy === 0 ? nudge : (dy / Math.abs(dy)) * nudge;
    }
    
    const bubbleAPos = bubblePositionsRef.current[idA];
    const bubbleBPos = bubblePositionsRef.current[idB];
    if (!bubbleAPos || !bubbleBPos) return;

    const updatedPosA = clampPosition({
      x: bubbleAPos.x - moveX,
      y: bubbleAPos.y - moveY
    }, bubbleRadius);
    
    const updatedPosB = clampPosition({
      x: bubbleBPos.x + moveX,
      y: bubbleBPos.y + moveY
    }, bubbleRadius);

    // Only update positions for bubbles that aren't being dragged
    if (!bubbleRefs.current[idA]?.getIsDragging()) {
      updateBubblePosition(idA, updatedPosA);
    }
    if (!bubbleRefs.current[idB]?.getIsDragging()) {
      updateBubblePosition(idB, updatedPosB);
    }
  }, [getDistanceData, clampPosition, bubbleRadius, updateBubblePosition]);

  /**
   * Position Validation Utilities
   * Check if bubbles have moved from their intended positions
   */
  const isBubbleOutOfPosition = useCallback((id: string) => {
    const initialPos = initialPositions[id];
    const bubblePos = bubblePositionsRef.current[id];
    if (!initialPos || !bubblePos) return false;

    const threshold = 1; // Minimum distance to consider "out of position"
    return Math.abs(initialPos.x - bubblePos.x) > threshold || 
           Math.abs(initialPos.y - bubblePos.y) > threshold;
  }, [initialPositions]);

  /**
   * Bulk position validation - returns both boolean result and array of displaced bubbles
   * Used to optimize the main animation loop by avoiding unnecessary calculations
   */
  const isAnyBubbleOutOfPosition = useCallback(() => {
    const bubblesOutOfPosition: string[] = [];
    
    for (const item of items) {
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
  const isAnyBubbleDragging = useCallback(() => {
    for (const item of items) {
      if (bubbleRefs.current[item.id]?.getIsDragging()) {
        return true;
      }
    }
    return false;
  }, [items]);

  /**
   * Predictive collision detection for path planning
   * Determines if moving a bubble to a target position would cause a collision
   */
  const willCollideAtPosition = (id: string, targetPos: Position) => {
    for (const other of items) {
      if (other.id === id) continue;
      const otherPos = bubblePositionsRef.current[other.id];
      const dx = otherPos.x - targetPos.x;
      const dy = otherPos.y - targetPos.y;
      const minDist = (bubbleRadius ?? 50) * 2 + 10;
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
  const moveBubblesBackToInitialPositions = useCallback((ignoreCollisions: boolean) => {
    let hasUpdates = false;
    
    items.forEach(item => {
      const bubble = bubbleRefs.current[item.id];
      if (!bubble || bubble.getIsDragging()) return;
      const isOutOfPosition = isBubbleOutOfPosition(item.id);

      if (ignoreCollisions) {
        // Force movement back to original position (used when no drag is active)
        if (isOutOfPosition) {
          const initialPos = initialPositions[item.id];
          const bubblePos = bubblePositionsRef.current[item.id];
          if (!initialPos || !bubblePos) return;
  
          // Eased movement - 50% of remaining distance per frame
          const deltaX = (initialPos.x - bubblePos.x) * 0.5;
          const deltaY = (initialPos.y - bubblePos.y) * 0.5;
          
          const nextPos = {
            x: Math.abs(deltaX) < 0.5 ? initialPos.x : bubblePos.x + deltaX,
            y: Math.abs(deltaY) < 0.5 ? initialPos.y : bubblePos.y + deltaY
          };
  
          updateBubblePosition(item.id, nextPos);
          hasUpdates = true;
        }
      } else {
        // Collision-aware movement (used during drag operations)
        const collision = checkIndividualCollision(item.id);

        if (!collision && isOutOfPosition) {
          const initialPos = initialPositions[item.id];
          const bubblePos = bubblePositionsRef.current[item.id];
          if (!initialPos || !bubblePos) return;
  
          const deltaX = (initialPos.x - bubblePos.x) * 0.5;
          const deltaY = (initialPos.y - bubblePos.y) * 0.5;
          
          const nextPos = {
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
  const updateUI = useCallback(() => {
    let hasUIUpdates = false;
    
    for (const item of items) {
      const bubble = bubbleRefs.current[item.id];
      if (!bubble) continue;
      
      const UIPos = bubble.getPosition(); // Current visual position
      const logicPos = bubblePositionsRef.current[item.id]; // Target logical position
      if (!logicPos) continue;
      
      // Calculate position difference on first sync cycle
      if (UISyncRef.current === 1) {
        positionDifferencesRef.current[item.id] = {
          x: logicPos.x - UIPos.x,
          y: logicPos.y - UIPos.y
        };
      }
      
      const positionDifference = positionDifferencesRef.current[item.id];
      if (positionDifference && (Math.abs(positionDifference.x) > 0.1 || Math.abs(positionDifference.y) > 0.1)) {
        // Interpolate towards target position
        const stepSize = 1 / K.FPS_SYNC;
        const step = {
          x: positionDifference.x * stepSize,
          y: positionDifference.y * stepSize
        };
        
        const newPos = {
          x: UIPos.x + step.x,
          y: UIPos.y + step.y
        };
        
        bubble.setPosition(newPos);
        hasUIUpdates = true;
      }
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
  useEffect(() => {
    let logicTimeoutId: NodeJS.Timeout;
    let uiTimeoutId: NodeJS.Timeout;
    
    /**
     * Physics and Logic Loop
     * Processes collision detection, resolution, and position updates
     */
    const runLogicLoop = () => {
      const { result, array } = isAnyBubbleOutOfPosition();
      let ignoreCollisions = true;

      if (result) {
        if (isAnyBubbleDragging()) {
          ignoreCollisions = false;
          // Process collisions for displaced bubbles
          for (let i = 0; i < array.length; i++) {
            const previouslyChecked = new Set(array.slice(0, i));
            
            for (const item of items) {
              if (array[i] === item.id || previouslyChecked.has(item.id)) continue;
              
              if (checkCollision(array[i], item.id).isColliding) {
                handleCollision(array[i], item.id);
              }
            }
          }
        } 
        moveBubblesBackToInitialPositions(ignoreCollisions);        
      }
      
      logicTimeoutId = setTimeout(runLogicLoop, 1000 / K.FPS_LOGIC);
    };
    
    /**
     * UI Update Loop
     * Handles smooth visual interpolation and rendering
     */
    const runUILoop = () => {
      if (isAnyBubbleOutOfPosition().result) {
        updateUI();
        UISyncRef.current = (UISyncRef.current % 3) + 1;
      }
      
      uiTimeoutId = setTimeout(runUILoop, 1000 / K.FPS_UI);
    };
    
    // Start both loops
    logicTimeoutId = setTimeout(runLogicLoop, 1000 / K.FPS_LOGIC);
    uiTimeoutId = setTimeout(runUILoop, 1000 / K.FPS_UI);
    
    // Cleanup on component unmount
    return () => {
      clearTimeout(logicTimeoutId);
      clearTimeout(uiTimeoutId);
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
  const centerBubble = useMemo(() => (
    <BubbleWrapper 
      key={items[0].id}
      item={{
        ...items[0],
        radius: bubbleRadius,
        originalX: initialPositions[items[0].id]?.x ?? 0,
        originalY: initialPositions[items[0].id]?.y ?? 0,
        style: style?.bubble,
      }}
      bubbleComponent={bubbleComponent}
      updateBubblePositions={updateBubblePosition}
      height={height}
      width={width}
      ref={(ref: BubbleRef) => {
        if (ref) {
          bubbleRefs.current[items[0].id || ""] = ref;
        }
      }}
    />
  ), [items[0], bubbleRadius, initialPositions, style?.bubble, bubbleComponent, updateBubblePosition, height, width]);

  // Surrounding bubbles - arranged in a circle around the center
  const surroundingBubbles = useMemo(() => 
    items.slice(1).map((item) => (
      <BubbleWrapper 
        key={item.id}
        item={{
          ...item,
          radius: bubbleRadius,
          originalX: initialPositions[item.id]?.x ?? 0,
          originalY: initialPositions[item.id]?.y ?? 0,
          style: style?.bubble,
        }}
        bubbleComponent={bubbleComponent}
        updateBubblePositions={updateBubblePosition}
        height={height}
        width={width}
        ref={(ref: BubbleRef) => {
          if (ref) {
            bubbleRefs.current[item.id] = ref;
          }
        }}
      />
    ))
  , [items, bubbleRadius, initialPositions, style?.bubble, bubbleComponent, updateBubblePosition, height, width]);

  return (
    <View style={[styles.container, style?.container]}>
      {centerBubble}
      {surroundingBubbles}
    </View>
  );
};

export default React.memo(BubbleMenu);