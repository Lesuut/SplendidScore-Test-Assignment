// @input Asset.ObjectPrefab prefab {"label": "Prefab to spawn"}
// @input SceneObject spawnPoint {"label": "Spawn point (optional)"}
// @input float moveSpeed = 10 {"label": "Move speed (cm/s)"}

var spawnedObjects = [];

// Спавн из префаба
function spawnObject() {
    if (!script.prefab) {
        print("Main: prefab not assigned!");
        return null;
    }

    var parent = script.getSceneObject();
    var instance = script.prefab.instantiate(parent);

    // Ставим позицию в точку спавна (или в начало координат)
    var spawnPos = script.spawnPoint
        ? script.spawnPoint.getTransform().getWorldPosition()
        : new vec3(0, 0, -100);

    instance.getTransform().setWorldPosition(spawnPos);
    spawnedObjects.push(instance);
    print("Main: spawned object at " + spawnPos);
    return instance;
}

// Движение — вызывать каждый кадр
function moveObject(obj, direction, dt) {
    if (!obj || !obj.isValid()) return;
    var t = obj.getTransform();
    var pos = t.getWorldPosition();
    var speed = script.moveSpeed * dt;
    // vec3 не имеет uniformScale — умножаем компоненты вручную
    pos = pos.add(new vec3(direction.x * speed, direction.y * speed, direction.z * speed));
    t.setWorldPosition(pos);
}

// Пример: спавним один объект при старте и двигаем его вправо
var targetObject = null;

var initEvent = script.createEvent("OnStartEvent");
initEvent.bind(function () {
    targetObject = spawnObject();
});

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function (eventData) {
    if (targetObject) {
        // getDeltaTime берётся из eventData, не из глобала
        moveObject(targetObject, new vec3(1, 0, 0), eventData.getDeltaTime());
    }
});

// Опционально: спавн по тапу
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function () {
    spawnObject();
});
