# React Native Bubble Menu

A customizable circular menu component for React Native that creates an interactive bubble interface with draggable elements.

## Features

- Circular menu layout with customizable distance and rotation
- Draggable bubbles with collision detection
- Smooth animations and transitions
- Customizable styling for all components
- Support for custom bubble components
- Automatic position management and collision handling

## Installation

```bash
npm install react-native-bubble-menu@github:wwwarcelona/rn-bubble-menu
# or
yarn add react-native-bubble-menu@github:wwwarcelona/rn-bubble-menu
```

## Usage

```jsx
import { BubbleMenu } from 'bubble-menu-lib';

const menuItems = [
  {
    id: 'center', // Unique identifier (required)
    radius: 30,   // Optional, overrides default bubbleRadius
    text: 'Center',
    icon: require('./assets/center-icon.png'),
  },
  {
    id: 'item1',
    text: 'Item 1',
    icon: require('./assets/item1-icon.png'),
  },
  {
    id: 'item2',
    text: 'Item 2',
    icon: require('./assets/item2-icon.png'),
  },
];

export default function MyComponent() {
  return (
    <BubbleMenu
      items={menuItems}
      menuDistance={100} // Distance from center to surrounding bubbles (required)
      height={300}       // Height of the menu container (required)
      width={300}        // Width of the menu container (required)
      bubbleRadius={30}  // Optional: sets radius for all bubbles
      collisionRadius={10} // Optional: extra space for collision detection
      menuRotation={4}   // Optional: controls the rotation of the menu (default: 4)
      bubbleFreedom={true} // Optional: if true, bubbles can move freely (default: true)
      style={{
        container: { backgroundColor: '#f0f0f0' },
        centerBubble: { backgroundColor: '#007AFF' },
        menuBubbleContainer: { backgroundColor: '#5856D6' },
        bubble: {
          container: { borderRadius: 20 },
          circle: { backgroundColor: '#FF2D55' },
          text: { color: '#FFFFFF' },
        },
      }}
      // bubbleComponent={CustomBubble} // Optional: your own bubble
    />
  );
}
```

## BubbleMenu Props

| Prop              | Type                                   | Required | Default   | Description                                                                                 |
|-------------------|----------------------------------------|----------|-----------|---------------------------------------------------------------------------------------------|
| `items`           | `BubbleProps[]`                        | Yes      |           | Array of bubble items. The first item is the center bubble.                                 |
| `menuDistance`    | `number`                               | Yes      |           | Distance from center to surrounding bubbles (in pixels).                                    |
| `height`          | `number`                               | Yes      |           | Height of the menu container (in pixels).                                                   |
| `width`           | `number`                               | Yes      |           | Width of the menu container (in pixels).                                                    |
| `bubbleRadius`    | `number`                               | No       | `50`      | Default radius for each bubble (can be overridden per bubble).                              |
| `collisionRadius` | `number`                               | No       | `0`       | Extra space for collision detection between bubbles.                                        |
| `menuRotation`    | `number`                               | No       | `4`       | Controls the rotation of the menu layout.                                                   |
| `bubbleFreedom`   | `boolean`                              | No       | `true`    | If true, bubbles can move freely; if false, movement is constrained to the menu bounds.     |
| `style`           | `BubbleMenuStyleProps`                 | No       |           | Custom styles for the menu and its components.                                              |
| `bubbleComponent` | `React.ComponentType<BubbleProps>`     | No       |           | Custom component to render for each bubble.                                                 |

## BubbleProps (for each item in `items`)

| Prop         | Type                | Required | Description                                                                 |
|--------------|---------------------|----------|-----------------------------------------------------------------------------|
| `id`         | `string`            | Yes      | Unique identifier for the bubble.                                           |
| `radius`     | `number`            | No       | Radius of the bubble (overrides `bubbleRadius` for this bubble only).       |
| `originalX`  | `number`            | No       | Initial X position (used internally, usually not needed).                   |
| `originalY`  | `number`            | No       | Initial Y position (used internally, usually not needed).                   |
| `text`       | `string`            | No       | Text to display in the bubble.                                              |
| `icon`       | `any`               | No       | Icon to display in the bubble (can be a require() image or URL).            |
| `style`      | `BubbleStyleProps`  | No       | Custom styles for this bubble.                                              |
| `key`        | `string`            | No       | React key for list rendering optimization.                                  |
| `onPress`    | `() => void`        | No       | Callback when the bubble is pressed.                                        |
| `isPressed`  | `boolean`           | No       | Used internally to indicate pressed state.                                  |

## Style Props

### BubbleMenuStyleProps

```typescript
interface BubbleMenuStyleProps {
  container?: ViewStyle;        // Style for the main container
  centerBubble?: ViewStyle;     // Style for the center bubble
  menuBubbleContainer?: ViewStyle; // Style for the menu bubble container
  bubble?: BubbleStyleProps;    // Style for individual bubbles
}
```

### BubbleStyleProps

```typescript
interface BubbleStyleProps {
  container?: ViewStyle;  // Style for the bubble container
  circle?: ViewStyle;     // Style for the bubble circle
  text?: TextStyle;       // Style for the bubble text
  icon?: ImageStyle;      // Style for the bubble icon
}
```

## Custom Bubble Component

You can create a custom bubble component by implementing the `BubbleProps` interface:

```jsx
import { View, Text, Image } from 'react-native';

const CustomBubble = ({ id, radius, text, icon, style }: BubbleProps) => {
  return (
    <View style={[styles.container, style?.container]}>
      <View style={[styles.circle, style?.circle, { width: radius * 2, height: radius * 2, borderRadius: radius }]}>
        {icon && <Image source={icon} style={[styles.icon, style?.icon]} />}
        {text && <Text style={[styles.text, style?.text]}>{text}</Text>}
      </View>
    </View>
  );
};

// Usage
<BubbleMenu
  items={menuItems}
  menuDistance={100}
  height={300}
  width={300}
  bubbleComponent={CustomBubble}
/>
```

## Behavior

- The menu creates a circular layout with the first item in the center
- Bubbles can be dragged and will automatically return to their original positions
- Collision detection prevents bubbles from overlapping
- The menu automatically adjusts bubble positions to maintain the circular layout
- Bubbles can be customized with text, icons, and custom components

## License

MIT 