import { StyleSheet } from 'react-native';
export var styles = StyleSheet.create({
    // App styles
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        backgroundColor: 'red',
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
