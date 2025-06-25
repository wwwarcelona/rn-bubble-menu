import React, { forwardRef } from 'react';
import { View, Text, Image } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { styles } from './styles';
var DefaultBubble = forwardRef(function (_a, ref) {
    var id = _a.id, radius = _a.radius, text = _a.text, icon = _a.icon, style = _a.style;
    return (React.createElement(Shadow, { distance: 5, startColor: "rgba(0, 0, 0, 0.1)", offset: [0, 2] },
        React.createElement(View, { style: [
                styles.circle,
                style === null || style === void 0 ? void 0 : style.circle,
                {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    padding: icon ? 8 : 0,
                }
            ] },
            icon && (React.createElement(Image, { source: icon, style: [
                    styles.icon,
                    style === null || style === void 0 ? void 0 : style.icon,
                    {
                        width: radius * (text ? 0.8 : 1),
                        height: radius * (text ? 0.8 : 1),
                        marginBottom: 4
                    }
                ] })),
            text && (React.createElement(Text, { style: [
                    styles.text,
                    style === null || style === void 0 ? void 0 : style.text,
                    { fontSize: icon ? radius / 3.6 : 16 } // font size adapts to the radius of the bubble and the icon
                ] }, text)))));
});
export default DefaultBubble;
