// @input SceneObject target {"label": "Target (optional)"}
// @input float speed = -500 {"label": "Speed (cm/s)"}

var t = (script.target || script.getSceneObject()).getTransform();

script.createEvent("UpdateEvent").bind(function (e) {
    var pos = t.getLocalPosition();
    pos.z += script.speed * e.getDeltaTime();
    t.setLocalPosition(pos);
});
