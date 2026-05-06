// ── Сцена ──────────────────────────────────────────────────────────────────
// @input SceneObject parentObject {"label": "Parent"}

// ── Препятствия ────────────────────────────────────────────────────────────
// @input Asset.ObjectPrefab[] obstaclePrefabs  {"label": "Obstacle Prefabs"}
// @input float[]              rotationMinY     {"label": "Rotation Y Min° (per prefab)"}
// @input float[]              rotationMaxY     {"label": "Rotation Y Max° (per prefab)"}

// ── Пул ────────────────────────────────────────────────────────────────────
// @input int   rowCount = 8   {"label": "Row Count"}
// @input float spacing  = 300 {"label": "Row Spacing (cm)"}

// ── Полосы ─────────────────────────────────────────────────────────────────
// @input float spawnX0 = -100 {"label": "Lane Left X"}
// @input float spawnX1 = 0    {"label": "Lane Center X"}
// @input float spawnX2 = 100  {"label": "Lane Right X"}
// @input float spawnY  = 0    {"label": "Spawn Y"}

// ── Плотность ──────────────────────────────────────────────────────────────
// @input float density = 0.5 {"label": "Density (0–1)"}

// ───────────────────────────────────────────────────────────────────────────

var DEG2RAD = Math.PI / 180;
var laneX   = [script.spawnX0, script.spawnX1, script.spawnX2];
var rows    = [];

// ───────────────────────────────────────────────────────────────────────────

function spawnObstacle(parent, x, y, z) {
    var idx = Math.floor(Math.random() * script.obstaclePrefabs.length);
    var obs = script.obstaclePrefabs[idx].instantiate(parent);

    var minY  = idx < script.rotationMinY.length ? script.rotationMinY[idx] : 0;
    var maxY  = idx < script.rotationMaxY.length ? script.rotationMaxY[idx] : 0;
    var angle = (minY + Math.random() * (maxY - minY)) * DEG2RAD;

    var t = obs.getTransform();
    t.setLocalPosition(new vec3(x, y, z));
    t.setLocalRotation(quat.fromEulerAngles(0, angle, 0));

    return obs;
}

function applyDensity(row) {
    for (var i = 0; i < row.obstacles.length; i++) {
        row.obstacles[i].enabled = Math.random() < script.density;
    }
}

// ───────────────────────────────────────────────────────────────────────────

script.createEvent("OnStartEvent").bind(function () {
    var parent = script.parentObject || script.getSceneObject();

    for (var r = 0; r < script.rowCount; r++) {
        var localZ    = r * script.spacing;
        var obstacles = [];

        for (var lane = 0; lane < 3; lane++) {
            obstacles.push(spawnObstacle(parent, laneX[lane], script.spawnY, localZ));
        }

        var row = { obstacles: obstacles, localZ: localZ };
        applyDensity(row);
        rows.push(row);
    }
});

script.createEvent("UpdateEvent").bind(function () {
    var parent     = script.parentObject || script.getSceneObject();
    var parentZ    = parent.getTransform().getWorldPosition().z;

    for (var r = 0; r < rows.length; r++) {
        var row    = rows[r];
        var worldZ = parentZ + row.localZ;

        if (worldZ >= -script.spacing) continue;

        var maxLocalZ = -Infinity;
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].localZ > maxLocalZ) maxLocalZ = rows[j].localZ;
        }

        row.localZ = maxLocalZ + script.spacing;

        for (var lane = 0; lane < 3; lane++) {
            row.obstacles[lane].destroy();
            row.obstacles[lane] = spawnObstacle(parent, laneX[lane], script.spawnY, row.localZ);
        }

        applyDensity(row);
    }
});
