// @input SceneObject parentObject {"label": "Parent Object"}
// @input Asset.ObjectPrefab treePrefab {"label": "Tree Prefab"}
// @input int count = 20 {"label": "Count"}
// @input float minX = -200 {"label": "Min X"}
// @input float maxX = 200 {"label": "Max X"}
// @input float minZ = -200 {"label": "Min Z (Y на карте)"}
// @input float maxZ = 200 {"label": "Max Z (Y на карте)"}
// @input float spawnY = 0 {"label": "Height (Y)"}

function rnd(min, max) {
    return min + Math.random() * (max - min);
}

script.createEvent("OnStartEvent").bind(function () {
    if (!script.treePrefab) {
        print("ForestSpawner: treePrefab not assigned!");
        return;
    }

    var parent = script.parentObject || script.getSceneObject();
    var parentPos = parent.getTransform().getWorldPosition();

    for (var i = 0; i < script.count; i++) {
        var tree = script.treePrefab.instantiate(parent);
        var t = tree.getTransform();

        var base = t.getLocalScale();

        t.setWorldPosition(new vec3(
            parentPos.x + rnd(script.minX, script.maxX),
            parentPos.y + script.spawnY,
            parentPos.z + rnd(script.minZ, script.maxZ)
        ));

        t.setLocalRotation(quat.fromEulerAngles(0, rnd(0, Math.PI * 2), 0));

        var factor = rnd(0.6, 1.2);
        t.setWorldScale(new vec3(
            base.x * factor,
            base.y * factor,
            base.z * factor
        ));
    }

    print("ForestSpawner: spawned " + script.count + " trees");
});
