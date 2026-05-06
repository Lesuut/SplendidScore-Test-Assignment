// @input Asset.AnimationAsset run
// @input Asset.AnimationAsset jump
// @input Component.AnimationPlayer animPlayer {"label": "Animation Player"}
// @input float fadeTime = 0.2 {"label": "Fade Duration (sec)"}
// @input float jumpStartTime = 0.1 {"label": "Jump Start Time (sec)"}

var RUN  = "run";
var JUMP = "jump";

var runClip  = null;
var jumpClip = null;

// 0 = полностью run, 1 = полностью jump
var blendTarget  = 0;
var blendCurrent = 0;

script.playRun = function () {
    blendTarget = 0;
};

script.playJump = function () {
    script.animPlayer.playClipAt(JUMP, script.jumpStartTime);
    blendCurrent = 1;
    blendTarget  = 1;
};

script.createEvent("OnStartEvent").bind(function () {
    if (!script.animPlayer || !script.run || !script.jump) {
        print("AnimationController: не все поля заполнены!");
        return;
    }

    runClip  = AnimationClip.createFromAnimation(RUN,  script.run);
    jumpClip = AnimationClip.createFromAnimation(JUMP, script.jump);

    runClip.playbackMode  = PlaybackMode.Loop;
    jumpClip.playbackMode = PlaybackMode.Loop;
    jumpClip.begin = script.jumpStartTime;

    runClip.weight  = 1;
    jumpClip.weight = 0;

    script.animPlayer.addClip(runClip);
    script.animPlayer.addClip(jumpClip);

    script.animPlayer.playAll();
});

script.createEvent("UpdateEvent").bind(function (e) {
    if (!runClip || !jumpClip) return;

    var speed = script.fadeTime > 0 ? e.getDeltaTime() / script.fadeTime : 1;
    blendCurrent += (blendTarget - blendCurrent) * Math.min(speed, 1);

    runClip.weight  = 1 - blendCurrent;
    jumpClip.weight = blendCurrent;
});
