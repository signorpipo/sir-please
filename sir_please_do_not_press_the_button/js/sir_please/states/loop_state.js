import {Component, Property} from '@wonderlandengine/api';
import { FSM } from '../../pp';
import { GameGlobals } from "../game_globals";

class Loop {
    constructor(dialog) {
        this.dialogName = dialog;
    }

    start(fsm) {
        this._myParentFSM = fsm;
        GameGlobals.myDialogController.dialog = this.dialogName;
    }

    end(fsm) {
        this._myFSM.perform("skip");
    }


    update(dt, fsm) {
        this._myFSM.update(dt);
    }
}

class LoopSection extends Loop {
    constructor(dialog) {
        super(dialog);
    }
}

/**
 * loop_state
 */
export class LoopState {
    static TypeName = 'loop_state';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };

    constructor() {
        this._myFSM = new FSM();
        this._myFSM.addState("init");
        this._myFSM.addState("loop_one", new LoopSection("sir_loop_one"));

        this._myFSM.addTransition("init", "loop_one", "start");

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }
}
