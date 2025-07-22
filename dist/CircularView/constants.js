/**
 * The angle at which the view should snap to the nearest child
 */
export var SnapAngle;
(function (SnapAngle) {
    SnapAngle[SnapAngle["TOP"] = -Math.PI / 2] = "TOP";
    SnapAngle[SnapAngle["BOTTOM"] = Math.PI / 2] = "BOTTOM";
    SnapAngle[SnapAngle["LEFT"] = Math.PI] = "LEFT";
    SnapAngle[SnapAngle["RIGHT"] = 0] = "RIGHT";
})(SnapAngle || (SnapAngle = {}));
