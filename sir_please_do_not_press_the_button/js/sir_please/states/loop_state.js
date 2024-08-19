import { Property } from '@wonderlandengine/api';
import { FSM } from '../../pp';
import { GameGlobals } from "../game_globals";

class Loop {
    constructor(dialog, endEvent) {
        this.dialogName = dialog;
        this.loopEndEvent = endEvent;
    }

    start(fsm) {
        this._myParentFSM = fsm;
        GameGlobals.myDialogController.dialog = this.dialogName;

        GameGlobals.myDialogManager.addEventListener(this.loopEndEvent, this.loopEnd.bind(this));
    }

    loopEnd() {
        this._myParentFSM.perform(this.loopEndEvent);
    }

    end(fsm) {
        this._myParentFSM.perform("skip");
    }

    update(dt, fsm) {
        this._myParentFSM.update(dt);
    }
}

class LoopSection extends Loop {
    constructor(dialog, endEvent) {
        super(dialog, endEvent);
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
        this._myFSM.addState("loop_one", new LoopSection("sir_loop_one", "loop_one_end"));
        this._myFSM.addState("loop_two", new LoopSection("sir_loop_2", "loop_two_end"));
        this._myFSM.addState("loop_three", new LoopSection("sir_loop_3", "loop_three_end"));
        this._myFSM.addState("loop_four", new LoopSection("sir_loop_4", "loop_four_end"));

        this._myFSM.addTransition("init", "loop_one", "start");
        this._myFSM.addTransition("loop_one", "loop_two", "loop_one_end");
        this._myFSM.addTransition("loop_two", "loop_three", "loop_two_end");
        this._myFSM.addTransition("loop_three", "loop_four", "loop_three_end");
        this._myFSM.addTransition("loop_four", "loop_one", "loop_four_end");

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }
}
