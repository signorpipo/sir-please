import { FSM, TimerState } from "../../pp";
import { GameGlobals } from "../game_globals";
import { EarthExplodesState } from "./earth_explodes_state";
import { LoopState } from "./loop_state";
import { SirRoomState } from "./sir_room_state";

export class GameState {
    constructor() {
        this._myFSM = new FSM();
        this._myFSM.setLogEnabled(true, "  Game");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("wait_dialog", () => {
            if(GameGlobals.myDialogManager != null && GameGlobals.myDialogManager.dialogs != null){
                this._myFSM.perform("end");
            }
        });
        this._myFSM.addState("dark", new TimerState(2, "end"));
        this._myFSM.addState("sir_room", new SirRoomState());
        this._myFSM.addState("earth_explode", new EarthExplodesState(false));
        this._myFSM.addState("earth_explode_anyway", new EarthExplodesState(true));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "wait_dialog", "start");
        this._myFSM.addTransition("wait_dialog", "dark", "end");
        this._myFSM.addTransition("dark", "sir_room", "end");
        this._myFSM.addTransition("sir_room", "earth_explode", "lose");
        this._myFSM.addTransition("sir_room", "earth_explode_anyway", "win");
        this._myFSM.addTransition("earth_explode", "idle", "end", this._gameOver.bind(this));
        this._myFSM.addTransition("earth_explode_anyway", "idle", "end", this._gameOver.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._myParentFSM = null;

        this._myLoopState = new LoopState();
    }

    start(fsm) {
        this._myParentFSM = fsm;

        this._myFSM.perform("start");

        if (GameGlobals.mySkipIntro) {
            this._myFSM.perform("end");
        }

        GameGlobals.myExplodeButton.registerClickEventListener(this, this._explodeButtonPressed.bind(this));
        GameGlobals.myButtonHand.registerHandStopEventListener(this, this._handStop.bind(this));
    }

    end() {
        GameGlobals.myExplodeButton.unregisterClickEventListener(this);
        GameGlobals.myButtonHand.unregisterHandStopEventListener(this);
    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    _gameOver() {
        this._myParentFSM.performDelayed("end");
    }

    _explodeButtonPressed() {
        this._myFSM.perform("lose");
    }

    _handStop() {
        this._myFSM.perform("win");
    }
}