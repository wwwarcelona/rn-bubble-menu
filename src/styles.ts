import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // App styles
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'transparent',
    height: '100%',
    width: '100%',
  },

  // Bubble styles
  bubbleContainer: {
    position: 'absolute',
  },
  circle: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginBottom: 8,
    resizeMode: 'contain',
  },

  // BubbleMenu styles
  menuContainer: {
    flex: 1,
  },
  centerBubble: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBubbleContainer: {
    position: 'absolute',
  },
}); 