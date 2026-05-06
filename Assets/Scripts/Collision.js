// @input Component.ScriptComponent itemPool {"label": "Item Pool"}
// @input float sizeX       = 50  {"label": "Hit Box X (cm)"}
// @input float sizeY       = 50  {"label": "Hit Box Y (cm)"}
// @input float sizeZ       = 50  {"label": "Hit Box Z (cm)"}
// @input float hitCooldown = 1.5 {"label": "Hit Cooldown (sec)"}

var self         = script.getSceneObject().getTransform();
var hitCooldowns = {};

script.createEvent("UpdateEvent").bind(function (e) {
    var dt = e.getDeltaTime();

    for (var key in hitCooldowns) {
        hitCooldowns[key] -= dt;
        if (hitCooldowns[key] <= 0) delete hitCooldowns[key];
    }

    if (!script.itemPool || !global.gameOnHit) return;

    var p     = self.getWorldPosition();
    var halfX = script.sizeX * 0.5;
    var halfY = script.sizeY * 0.5;
    var halfZ = script.sizeZ * 0.5;
    var items = script.itemPool.getActiveObstacles();

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var b    = item.getTransform().getWorldPosition();

        if (Math.abs(p.x - b.x) < halfX &&
            Math.abs(p.y - b.y) < halfY &&
            Math.abs(p.z - b.z) < halfZ) {

            var key = item.name;
            if (!hitCooldowns[key]) {
                hitCooldowns[key] = script.hitCooldown;
                if (item.name.indexOf("Star") !== -1) {
                    item.enabled = false;
                }
                global.gameOnHit(item.name);
            }
        }
    }
});
