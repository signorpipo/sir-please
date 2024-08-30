import { FSM, MathUtils, Timer, TimerState, vec3_create } from "../../pp";
import { GameGlobals } from "../game_globals";

export class WinState {

    constructor(trackedHandTeleportUpdate, sirBody, sirExtras) {
        this._myTrackedHandTeleportUpdate = trackedHandTeleportUpdate;
        this._mySirBody = sirBody;
        this._mySirExtras = sirExtras;

        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "  Win");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("wait_dialog_hidden", this._waitDialogHiddenUpdate.bind(this));
        this._myFSM.addState("first_wait", new TimerState(1.5, "end"));
        this._myFSM.addState("fly", this._flyUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "wait_dialog_hidden", "start", this._startWin.bind(this));
        this._myFSM.addTransition("wait_dialog_hidden", "first_wait", "end");
        this._myFSM.addTransition("first_wait", "fly", "end");

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("wait_dialog_hidden", "idle", "stop", this._stopWin.bind(this));
        this._myFSM.addTransition("first_wait", "idle", "stop", this._stopWin.bind(this));
        this._myFSM.addTransition("fly", "idle", "stop", this._stopWin.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._mySpawnParticlesTimer = new Timer(0);
        this._myAccelerationTimer = new Timer(10);
        this._myMaxParticleTimer = new Timer(10);

        this._myCurrentAcceleration = 0;

        this._myCurrentSpeed = 0;
        this._myTakeOffSpeed = 0.075;
    }

    start(fsm) {
        this._myFSM.perform("start");
    }

    end(fsm) {
        this._myFSM.perform("stop");
    }

    update(dt, fsm) {
        this._myTrackedHandTeleportUpdate();

        this._myFSM.update(dt);
    }

    _startWin() {
        GameGlobals.myButtonHand.stopButtonHand();

        this._mySpawnParticlesTimer.start(0);
        this._myAccelerationTimer.start();
        this._myMaxParticleTimer.start();
        this._myCurrentSpeed = 0;
        this._myCurrentAcceleration = 0;
    }

    _stopWin() {

    }

    _flyUpdate(dt, fsm) {
        if (this._mySirBody.pp_getPosition()[1] < 2000) {
            if (this._myAccelerationTimer.getPercentage() < 1) {
                this._myCurrentAcceleration = MathUtils.interpolate(0.001, 2, this._myAccelerationTimer.getPercentage(), easeInExpo);
            }

            this._myAccelerationTimer.update(dt);
            this._myMaxParticleTimer.update(dt);

            if (this._myAccelerationTimer.getPercentage() == 1) {
                this._myCurrentAcceleration += 1 * dt;
            }

            this._myCurrentSpeed += this._myCurrentAcceleration * dt;
            this._myCurrentSpeed = Math.min(this._myCurrentSpeed, 500);

            GameGlobals.myButtonHand.object.pp_translate(vec3_create(0, this._myCurrentSpeed * dt, 0));
            this._mySirBody.pp_translate(vec3_create(0, this._myCurrentSpeed * dt, 0));
            this._mySirExtras.pp_translate(vec3_create(0, this._myCurrentSpeed * dt, 0));

            this._mySpawnParticlesTimer.update(dt);
            if (this._mySpawnParticlesTimer.isDone()) {
                GameGlobals.myHandParticlesSpawner._myScaleMultiplier = 0.010 * Math.pp_mapToRange(this._myMaxParticleTimer.getPercentage(), 0, 1, 0.75, 1.5);
                GameGlobals.myHandParticlesSpawner._myVerticalSpeedMultiplier = -1 * Math.pp_mapToRange(this._myMaxParticleTimer.getPercentage(), 0, 1, 0.5, 1.25);
                GameGlobals.myHandParticlesSpawner.spawn(GameGlobals.myButtonHand.object.pp_getPosition());

                this._mySpawnParticlesTimer.start(MathUtils.interpolate(1, 0.01, this._myMaxParticleTimer.getPercentage(), easeTimer));
            }
        }
    }

    _waitDialogHiddenUpdate(dt, fsm) {
        if (GameGlobals.mySirDialog.isHidden()) {
            this._myFSM.perform("end");
        }
    }
}

function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(3.5, 10 * x - 10);
}

function easeTimer(x) {
    return 1 - (1 - x) * (1 - x);
}