# React Native Bubble Menu

A customizable circular menu component for React Native that creates an interactive bubble interface with draggable elements.

## Features

- Circular menu layout with customizable radius
- Draggable bubbles with collision detection
- Smooth animations and transitions
- Customizable styling for all components
- Support for custom bubble components
- Automatic position management and collision handling

## Installation

```bash
npm install bubble-menu-lib
# or
yarn add bubble-menu-lib
```

## Usage

```jsx
import { BubbleMenu } from 'bubble-menu-lib';

const MyComponent = () => {
  const menuItems = [
    {
      label: 'center',
      radius: 30,
      text: 'Center',
      icon: require('./assets/center-icon.png')
    },
    {
      label: 'item1',
      radius: 25,
      text: 'Item 1',
      icon: require('./assets/item1-icon.png')
    },
    {
      label: 'item2',
      radius: 25,
      text: 'Item 2',
      icon: require('./assets/item2-icon.png')
    }
  ];

  return (
    <BubbleMenu
      items={menuItems}
      menuRadius={100}
      style={{
        container: { backgroundColor: '#f0f0f0' },
        centerBubble: { backgroundColor: '#007AFF' },
        menuBubbleContainer: { backgroundColor: '#5856D6' },
        bubble: {
          container: { borderRadius: 20 },
          circle: { backgroundColor: '#FF2D55' },
          text: { color: '#FFFFFF' }
        }
      }}
    />
  );
};
```

## Props

### BubbleMenu Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `BubbleProps[]` | Yes | Array of bubble items to display in the menu |
| `menuRadius` | `number` | Yes | Radius of the circular menu layout |
| `style` | `BubbleMenuStyleProps` | No | Custom styles for the menu and its components |
| `bubbleComponent` | `React.ComponentType<BubbleProps>` | No | Custom component to render for each bubble |

### BubbleProps Interface

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Unique identifier for the bubble |
| `radius` | `number` | Yes | Size of the bubble in pixels |
| `text` | `string` | No | Text to display in the bubble |
| `icon` | `any` | No | Icon to display in the bubble (can be require() image or URL) |
| `style` | `BubbleStyleProps` | No | Custom styles for the bubble |

### Style Props

#### BubbleMenuStyleProps

```typescript
interface BubbleMenuStyleProps {
  container?: ViewStyle;        // Style for the main container
  centerBubble?: ViewStyle;     // Style for the center bubble
  menuBubbleContainer?: ViewStyle; // Style for the menu bubble container
  bubble?: BubbleStyleProps;    // Style for individual bubbles
}
```

#### BubbleStyleProps

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
const CustomBubble = ({ label, radius, text, icon, style }: BubbleProps) => {
  return (
    <View style={[styles.container, style?.container]}>
      <View style={[styles.circle, style?.circle]}>
        {icon && <Image source={icon} style={[styles.icon, style?.icon]} />}
        {text && <Text style={[styles.text, style?.text]}>{text}</Text>}
      </View>
    </View>
  );
};

// Usage
<BubbleMenu
  items={menuItems}
  menuRadius={100}
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