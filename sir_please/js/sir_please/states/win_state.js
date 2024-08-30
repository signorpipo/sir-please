import { FSM, TimerState, vec3_create } from "../../pp";
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
    }

    _stopWin() {

    }

    _flyUpdate(dt, fsm) {
        GameGlobals.myButtonHand.object.pp_translate(vec3_create(0, 0.5 * dt, 0));
        this._mySirBody.pp_translate(vec3_create(0, 0.5 * dt, 0));
        this._mySirExtras.pp_translate(vec3_create(0, 0.5 * dt, 0));
    }

    _waitDialogHiddenUpdate(dt, fsm) {
        if (GameGlobals.mySirDialog.isHidden()) {
            this._myFSM.perform("end");
        }
    }
}