// @input float bobHeight = 5    {"label": "Bob Height (cm)"}
// @input float bobSpeed  = 2    {"label": "Bob Speed"}
// @input float spinSpeed = 90   {"label": "Spin Speed (deg/s)"}

var DEG2RAD = Math.PI / 180;

var t       = script.getSceneObject().getTransform();
var originY = t.getLocalPosition().y;
var time    = 0;
var spinY   = 0;

script.createEvent("UpdateEvent").bind(function (e) {
    var dt = e.getDeltaTime();
    time  += dt;
    spinY += script.spinSpeed * DEG2RAD * dt;

    var pos = t.getLocalPosition();
    pos.y = originY + Math.sin(time * script.bobSpeed) * script.bobHeight;
    t.setLocalPosition(pos);

    t.setLocalRotation(quat.fromEulerAngles(0, spinY, 0));
});
