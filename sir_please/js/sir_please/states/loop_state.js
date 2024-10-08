import { Property } from '@wonderlandengine/api';
import { BrowserUtils, FSM, Handedness, InputSourceType, InputUtils, XRUtils } from '../../pp';
import { AnalyticsUtils } from '../analytics_utils';
import { GameGlobals } from "../game_globals";

class Loop {
    constructor(dialog, endEvent) {
        this.dialogName = dialog;
        this.loopEndEvent = endEvent;

        GameGlobals.myDialogManager.addEventListener(this.loopEndEvent, this.loopEnd.bind(this));
    }

    start(fsm) {
        this._myParentFSM = fsm;
        GameGlobals.myDialogController.dialog = this.dialogName;
    }

    loopEnd() {
        this._myParentFSM.perform(this.loopEndEvent);
    }

    end(fsm) {
        AnalyticsUtils.sendEventOnce("sir_loop_end", false);
        if (XRUtils.isSessionActive()) {
            AnalyticsUtils.sendEventOnce("sir_loop_end_vr");
            if (InputUtils.getInputSourceTypeByHandedness(Handedness.LEFT) == InputSourceType.TRACKED_HAND && InputUtils.getInputSourceTypeByHandedness(Handedness.RIGHT) == InputSourceType.TRACKED_HAND) {
                AnalyticsUtils.sendEventOnce("sir_loop_end_vr_hand");
            } else {
                AnalyticsUtils.sendEventOnce("sir_loop_end_vr_gamepad");
            }
        } else {
            AnalyticsUtils.sendEventOnce("sir_loop_end_flat");
            if (BrowserUtils.isMobile()) {
                AnalyticsUtils.sendEventOnce("sir_loop_end_flat_mobile");
            } else {
                AnalyticsUtils.sendEventOnce("sir_loop_end_flat_desktop");
            }
        }

        AnalyticsUtils.sendEventOnce(this.dialogName + "_end");

        if (this.dialogName == "sir_loop_4") {
            GameGlobals.myGameCompleted = true;
        }
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
