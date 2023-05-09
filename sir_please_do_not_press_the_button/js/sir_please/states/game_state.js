import { FSM } from "../../pp";
import { EarthExplodesState } from "./earth_explodes_state";
import { SirRoomState } from "./sir_room_state";

export class GameState {
    constructor() {
        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "  Game");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("sir_room", new SirRoomState());
        this._myFSM.addState("earth_explode", new EarthExplodesState(false));
        this._myFSM.addState("earth_explode_anyway", new EarthExplodesState(true));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "sir_room", "start");
        this._myFSM.addTransition("sir_room", "earth_explode", "lose");
        this._myFSM.addTransition("sir_room", "earth_explode_anyway", "win");
        this._myFSM.addTransition("earth_explode", "idle", "end", this._gameOver.bind(this));
        this._myFSM.addTransition("earth_explode_anyway", "idle", "end", this._gameOver.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._myParentFSM = null;

    }

    start(fsm) {
        this._myParentFSM = fsm;

        this._myFSM.perform("start");
    }

    end() {

    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    _gameOver() {
        this._myParentFSM.perform("end");
    }
}