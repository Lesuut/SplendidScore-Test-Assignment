// @input Component.ScriptComponent itemPool {"label": "Item Pool"}
// @input float sizeX = 50 {"label": "Hit Box X (cm)"}
// @input float sizeY = 50 {"label": "Hit Box Y (cm)"}
// @input float sizeZ = 50 {"label": "Hit Box Z (cm)"}

var self = script.getSceneObject().getTransform();

script.createEvent("UpdateEvent").bind(function () {
    if (!script.itemPool) return;

    var p       = self.getWorldPosition();
    var halfX   = script.sizeX * 0.5;
    var halfY   = script.sizeY * 0.5;
    var halfZ   = script.sizeZ * 0.5;
    var items   = script.itemPool.getActiveObstacles();

    for (var i = 0; i < items.length; i++) {
        var b = items[i].getTransform().getWorldPosition();

        if (Math.abs(p.x - b.x) < halfX &&
            Math.abs(p.y - b.y) < halfY &&
            Math.abs(p.z - b.z) < halfZ) {
            print("HIT: " + items[i].name);
        }
    }
});
