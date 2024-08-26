import { BrowserUtils, FSM, Globals, Handedness, InputSourceType, InputUtils, Timer, TimerState, vec3_create, XRUtils } from "../../pp";
import { AnalyticsUtils } from "../analytics_utils";
import { GameGlobals } from "../game_globals";

export class EarthExplodesState {
    constructor(explodesAnyway) {
        this._myExplodesAnyway = explodesAnyway;

        this._myPlayerSpawn = GameGlobals.myEarthView.pp_getObjectByName("Player Spawn");
        this._myEarth = GameGlobals.myEarthView.pp_getObjectByName("Earth");
        this._myWondermelon = GameGlobals.myEarthView.pp_getObjectByName("Wondermelon");

        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "  Earth Explodes" + (explodesAnyway ? " Anyway" : ""));

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

        this._myWondermelonTimer = new Timer(0.75, false);
        this._myWondermelonSeen = false;
    }

    start(fsm) {
        this._myParentFSM = fsm;

        GameGlobals.myHideHands.hide();
        GameGlobals.myBlackFader.fadeIn(true);
        GameGlobals.myPlayerLocomotion.setIdle(true);

        let playerStartPosition = this._myPlayerSpawn.pp_getPosition();
        let rotationQuat = this._myPlayerSpawn.pp_getRotationQuat();
        GameGlobals.myPlayerTransformManager.teleportAndReset(playerStartPosition.vec3_sub(vec3_create(0, GameGlobals.myPlayerTransformManager.getHeight(), 0)), rotationQuat);
        Globals.getPlayerObjects().myCameraNonXR.pp_setUp(GameGlobals.myUp);

        if (this._myExplodesAnyway) {
            this._myFSM.perform("start_explode_anyway");
        } else {
            this._myFSM.perform("start_explode");
        }

        GameGlobals.myEarthView.pp_setActive(true);
        this._myEarth.pp_setActive(true);

        AnalyticsUtils.sendEventOnce("earth_explode", false);
        if (XRUtils.isSessionActive()) {
            AnalyticsUtils.sendEventOnce("earth_explode_vr");
            if (InputUtils.getInputSourceTypeByHandedness(Handedness.LEFT) == InputSourceType.TRACKED_HAND && InputUtils.getInputSourceTypeByHandedness(Handedness.RIGHT) == InputSourceType.TRACKED_HAND) {
                AnalyticsUtils.sendEventOnce("earth_explode_vr_hand");
            } else {
                AnalyticsUtils.sendEventOnce("earth_explode_vr_gamepad");
            }
        } else {
            AnalyticsUtils.sendEventOnce("earth_explode_flat");
            if (BrowserUtils.isMobile()) {
                AnalyticsUtils.sendEventOnce("earth_explode_flat_mobile");
            } else {
                AnalyticsUtils.sendEventOnce("earth_explode_flat_desktop");
            }
        }

        if (GameGlobals.myGameCompleted) {
            AnalyticsUtils.sendEventOnce("earth_explode_after_end", false);
        }
    }

    end(fsm) {
        GameGlobals.myBlackFader.fadeOut(true);

        if (this._myWondermelonSeen) {
            this._myWondermelonSeen = false;

            AnalyticsUtils.sendEventOnce("wondermelon_seen", false);
            if (XRUtils.isSessionActive()) {
                AnalyticsUtils.sendEventOnce("wondermelon_seen_vr", false);
            } else {
                AnalyticsUtils.sendEventOnce("wondermelon_seen_flat", false);
                if (BrowserUtils.isMobile()) {
                    AnalyticsUtils.sendEventOnce("wondermelon_seen_flat_mobile", false);
                } else {
                    AnalyticsUtils.sendEventOnce("wondermelon_seen_flat_desktop", false);
                }
            }
        }
    }

    update(dt, fsm) {
        this._myWondermelonTimer.update(dt);

        if (this._lookingAtWondermelon()) {
            if (this._myWondermelonTimer.isDone()) {
                this._myWondermelonSeen = true;
            }

            if (!this._myWondermelonTimer.isRunning()) {
                this._myWondermelonTimer.start();
            }
        } else {
            this._myWondermelonTimer.reset();
        }

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

    _lookingAtWondermelon() {
        const headForward = Globals.getPlayerObjects().myHead.pp_getForward();
        const headPosition = Globals.getPlayerObjects().myHead.pp_getPosition();
        const wondermelonPosition = this._myWondermelon.pp_getPosition();

        const wondermelonDirection = wondermelonPosition.vec3_sub(headPosition);
        const angleToWondermelon = wondermelonDirection.vec3_angle(headForward);

        if (angleToWondermelon < 9) {
            return true;
        } else {
            return false;
        }
    }
}