import { FSM, Globals, TimerState, vec3_create } from "../../pp";
import { GameGlobals } from "../game_globals";

export class EarthExplodesState {
    constructor(explodesAnyway) {
        this._myExplodesAnyway = explodesAnyway;

        this._myPlayerSpawn = GameGlobals.myEarthView.pp_getObjectByName("Player Spawn");
        this._myEarth = GameGlobals.myEarthView.pp_getObjectByName("Earth");

        this._myFSM = new FSM();
        this._myFSM.setLogEnabled(true, "  Earth Explodes");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("click_wait", new TimerState(2, "end"));
        this._myFSM.addState("explode_wait", new TimerState(1, "end"));
        this._myFSM.addState("final_wait", new TimerState(2, "end"));
        this._myFSM.addState("fade_out", this._fadeOutUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "explode_wait", "start_explode", this._playClick.bind(this));
        this._myFSM.addTransition("idle", "click_wait", "start_explode_anyway");
        this._myFSM.addTransition("click_wait", "explode_wait", "end", this._playClick.bind(this));
        this._myFSM.addTransition("explode_wait", "final_wait", "end", this._explode.bind(this));
        this._myFSM.addTransition("final_wait", "fade_out", "end", this._startFadeOut.bind(this));
        this._myFSM.addTransition("fade_out", "idle", "end", this._explodeEnd.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._myParentFSM = null;

        this._myClickAudioPlayer = Globals.getAudioManager().createAudioPlayer("clickEarth");
        this._myExplodeAudioPlayer = Globals.getAudioManager().createAudioPlayer("explode");
    }

    start(fsm) {
        this._myParentFSM = fsm;

        GameGlobals.myBlackFader.fadeIn(true);
        GameGlobals.myPlayerLocomotion.setIdle(true);

        let playerStartPosition = this._myPlayerSpawn.pp_getPosition();
        let rotationQuat = this._myPlayerSpawn.pp_getRotationQuat();
        GameGlobals.myPlayerTransformManager.teleportAndReset(playerStartPosition.vec3_sub(vec3_create(0, GameGlobals.myPlayerTransformManager.getHeight(), 0)), rotationQuat);

        if (this._myExplodesAnyway) {
            this._myFSM.perform("start_explode_anyway");
        } else {
            this._myFSM.perform("start_explode");
        }

        this._myEarth.pp_setActive(true);
    }

    end(fsm) {
        GameGlobals.myBlackFader.fadeOut(true);
    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    _fadeOutUpdate(dt, fsm) {
        if (!GameGlobals.myBlackFader.isFading()) {
            fsm.perform("end");
        }
    }

    _playClick(fsm) {
        if (this._myClickAudioPlayer != null) {
            this._myClickAudioPlayer.setPosition(this._myEarth.pp_getPosition());
            this._myClickAudioPlayer.play();
        }
    }

    _explode(fsm) {
        if (this._myExplodeAudioPlayer != null) {
            this._myExplodeAudioPlayer.setPosition(this._myEarth.pp_getPosition());
            this._myExplodeAudioPlayer.play();
        }

        this._myEarth.pp_setActive(false);

        GameGlobals.myExplodeParticlesSpawner.spawn(this._myEarth.pp_getPosition());
    }

    _startFadeOut(fsm) {
        GameGlobals.myBlackFader.fadeOut();
    }

    _explodeEnd(fsm) {
        this._myParentFSM.perform("end");
    }
}