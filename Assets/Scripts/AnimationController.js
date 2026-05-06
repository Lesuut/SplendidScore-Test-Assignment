// @input Asset.AnimationAsset idle
// @input Asset.AnimationAsset run
// @input Asset.AnimationAsset jump
// @input Asset.AnimationAsset death
// @input Component.AnimationPlayer animPlayer {"label": "Animation Player"}
// @input float fadeTime         = 0.2 {"label": "Fade Duration (sec)"}
// @input float jumpStartTime    = 0.1 {"label": "Jump Start Time (sec)"}
// @input float runSpeedMultiplier = 1.0 {"label": "Run Speed Multiplier"}

var IDLE  = "idle";
var RUN   = "run";
var JUMP  = "jump";
var DEATH = "death";

var idleClip  = null;
var runClip   = null;
var jumpClip  = null;
var deathClip = null;

var blendTarget  = 0;
var blendCurrent = 0;

// "idle" | "run" | "dead"
var state = "idle";

function setWeights(w_idle, w_run, w_jump, w_death) {
    if (idleClip)  idleClip.weight  = w_idle;
    if (runClip)   runClip.weight   = w_run;
    if (jumpClip)  jumpClip.weight  = w_jump;
    if (deathClip) deathClip.weight = w_death;
}

script.playIdle = function () {
    state        = "idle";
    blendCurrent = 0;
    blendTarget  = 0;
    setWeights(1, 0, 0, 0);
};

script.playRun = function () {
    state       = "run";
    blendTarget = 0;
};

script.playJump = function () {
    if (state !== "run") return;
    script.animPlayer.playClipAt(JUMP, script.jumpStartTime);
    blendCurrent = 1;
    blendTarget  = 1;
};

script.playDeath = function () {
    state = "dead";
    setWeights(0, 0, 0, 1);
};

script.createEvent("OnStartEvent").bind(function () {
    if (!script.animPlayer) { print("AnimationController: нет animPlayer"); return; }

    if (script.idle)  { idleClip  = AnimationClip.createFromAnimation(IDLE,  script.idle);  idleClip.playbackMode  = PlaybackMode.Loop; }
    if (script.run)   { runClip   = AnimationClip.createFromAnimation(RUN,   script.run);   runClip.playbackMode   = PlaybackMode.Loop; }
    if (script.jump)  { jumpClip  = AnimationClip.createFromAnimation(JUMP,  script.jump);  jumpClip.playbackMode  = PlaybackMode.Loop; jumpClip.begin = script.jumpStartTime; }
    if (script.death) { deathClip = AnimationClip.createFromAnimation(DEATH, script.death); deathClip.playbackMode = PlaybackMode.Loop; }

    if (idleClip)  script.animPlayer.addClip(idleClip);
    if (runClip)   script.animPlayer.addClip(runClip);
    if (jumpClip)  script.animPlayer.addClip(jumpClip);
    if (deathClip) script.animPlayer.addClip(deathClip);

    script.animPlayer.playAll();
    script.playIdle();
});

script.createEvent("UpdateEvent").bind(function (e) {
    if (state !== "run") return;
    if (!runClip || !jumpClip) return;

    var speed = script.fadeTime > 0 ? e.getDeltaTime() / script.fadeTime : 1;
    blendCurrent += (blendTarget - blendCurrent) * Math.min(speed, 1);

    idleClip  && (idleClip.weight  = 0);
    deathClip && (deathClip.weight = 0);
    runClip.weight        = 1 - blendCurrent;
    jumpClip.weight       = blendCurrent;
    runClip.playbackSpeed = script.runSpeedMultiplier;
});
