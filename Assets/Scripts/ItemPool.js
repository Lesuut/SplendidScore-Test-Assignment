// ── Scene ──────────────────────────────────────────────────────────────────
// @input SceneObject parentObject {"label": "Parent"}

// ── Obstacles ──────────────────────────────────────────────────────────────
// @input Asset.ObjectPrefab[] obstaclePrefabs {"label": "Obstacle Prefabs"}
// @input float[]              rotationMinY    {"label": "Rotation Y Min° (per prefab)"}
// @input float[]              rotationMaxY    {"label": "Rotation Y Max° (per prefab)"}

// ── Pool ───────────────────────────────────────────────────────────────────
// @input int   rowCount = 8   {"label": "Row Count"}
// @input float spacing  = 300 {"label": "Row Spacing (cm)"}

// ── Lanes ──────────────────────────────────────────────────────────────────
// @input float spawnX0 = -100 {"label": "Lane Left X"}
// @input float spawnX1 = 0    {"label": "Lane Center X"}
// @input float spawnX2 = 100  {"label": "Lane Right X"}
// @input float spawnY  = 0    {"label": "Spawn Y"}

// ── Density ────────────────────────────────────────────────────────────────
// @input float density = 0.5 {"label": "Density (0–1)"}

// ───────────────────────────────────────────────────────────────────────────

var DEG2RAD = Math.PI / 180;
var laneX   = [script.spawnX0, script.spawnX1, script.spawnX2];
var rows    = [];
var pools   = []; // pools[prefabIdx] = array of { obj, prefabIdx, inUse }

// ───────────────────────────────────────────────────────────────────────────

function createEntry(prefabIdx, parent) {
    var obj = script.obstaclePrefabs[prefabIdx].instantiate(parent);
    obj.enabled = false;
    return { obj: obj, prefabIdx: prefabIdx, inUse: false };
}

function acquire(prefabIdx, parent) {
    var pool = pools[prefabIdx];
    for (var i = 0; i < pool.length; i++) {
        if (!pool[i].inUse) {
            pool[i].inUse = true;
            return pool[i];
        }
    }
    var entry = createEntry(prefabIdx, parent);
    entry.inUse = true;
    pool.push(entry);
    return entry;
}

function release(entry) {
    entry.obj.enabled = false;
    entry.inUse = false;
}

function place(entry, x, y, z) {
    var idx   = entry.prefabIdx;
    var minY  = idx < script.rotationMinY.length ? script.rotationMinY[idx] : 0;
    var maxY  = idx < script.rotationMaxY.length ? script.rotationMaxY[idx] : 0;
    var angle = (minY + Math.random() * (maxY - minY)) * DEG2RAD;
    var t     = entry.obj.getTransform();
    t.setLocalPosition(new vec3(x, y, z));
    t.setLocalRotation(quat.fromEulerAngles(0, angle, 0));
    entry.obj.enabled = true;
}

function applyDensity(row) {
    for (var i = 0; i < row.entries.length; i++) {
        row.entries[i].obj.enabled = Math.random() < script.density;
    }
}

// ───────────────────────────────────────────────────────────────────────────

script.getActiveObstacles = function () {
    var result = [];
    for (var r = 0; r < rows.length; r++) {
        var entries = rows[r].entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].obj.enabled) result.push(entries[i].obj);
        }
    }
    return result;
};

script.createEvent("OnStartEvent").bind(function () {
    var parent = script.parentObject || script.getSceneObject();
    var n      = script.obstaclePrefabs.length;

    // Pre-warm each pool with enough entries to cover all row slots
    var perType = Math.ceil((script.rowCount * 3) / Math.max(n, 1)) + 2;
    for (var p = 0; p < n; p++) {
        pools[p] = [];
        for (var k = 0; k < perType; k++) {
            pools[p].push(createEntry(p, parent));
        }
    }

    for (var r = 0; r < script.rowCount; r++) {
        var localZ  = r * script.spacing;
        var entries = [];
        for (var lane = 0; lane < 3; lane++) {
            var idx   = Math.floor(Math.random() * n);
            var entry = acquire(idx, parent);
            place(entry, laneX[lane], script.spawnY, localZ);
            entries.push(entry);
        }
        var row = { entries: entries, localZ: localZ };
        applyDensity(row);
        rows.push(row);
    }
});

script.createEvent("UpdateEvent").bind(function () {
    var parent  = script.parentObject || script.getSceneObject();
    var parentZ = parent.getTransform().getWorldPosition().z;
    var n       = script.obstaclePrefabs.length;

    for (var r = 0; r < rows.length; r++) {
        var row    = rows[r];
        var worldZ = parentZ + row.localZ;

        if (worldZ >= -script.spacing) continue;

        var maxLocalZ = -Infinity;
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].localZ > maxLocalZ) maxLocalZ = rows[j].localZ;
        }

        for (var i = 0; i < row.entries.length; i++) {
            release(row.entries[i]);
        }

        row.localZ  = maxLocalZ + script.spacing;
        row.entries = [];

        for (var lane = 0; lane < 3; lane++) {
            var idx   = Math.floor(Math.random() * n);
            var entry = acquire(idx, parent);
            place(entry, laneX[lane], script.spawnY, row.localZ);
            row.entries.push(entry);
        }

        applyDensity(row);
    }
});
