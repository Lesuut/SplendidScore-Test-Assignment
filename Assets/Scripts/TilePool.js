// @input SceneObject parentObject {"label": "Parent"}
// @input Asset.ObjectPrefab tilePrefab {"label": "Tile Prefab"}
// @input float tileLength = 2500 {"label": "Tile Length"}
// @input float spawnX = 0 {"label": "X Position"}
// @input float spawnY = 0 {"label": "Y Position"}

var tiles = [];

script.createEvent("OnStartEvent").bind(function () {
    var parent = script.parentObject || script.getSceneObject();

    for (var i = 0; i < 3; i++) {
        var tile = script.tilePrefab.instantiate(parent);
        tile.getTransform().setLocalPosition(new vec3(script.spawnX, script.spawnY, i * script.tileLength));
        tiles.push(tile);
    }
});

script.createEvent("UpdateEvent").bind(function () {
    var parent = script.parentObject || script.getSceneObject();
    var parentWorldZ = parent.getTransform().getWorldPosition().z;

    for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i].getTransform();
        var worldZ = t.getWorldPosition().z;

        // Проверяем по абсолютной (мировой) позиции
        if (worldZ < -script.tileLength) {
            // Найти максимальный мировой Z среди всех тайлов
            var maxWorldZ = -Infinity;
            for (var j = 0; j < tiles.length; j++) {
                var wz = tiles[j].getTransform().getWorldPosition().z;
                if (wz > maxWorldZ) maxWorldZ = wz;
            }
            // Желаемый мировой Z → переводим в локальный относительно родителя
            var desiredWorldZ = maxWorldZ + script.tileLength;
            t.setLocalPosition(new vec3(script.spawnX, script.spawnY, desiredWorldZ - parentWorldZ));
        }
    }
});
