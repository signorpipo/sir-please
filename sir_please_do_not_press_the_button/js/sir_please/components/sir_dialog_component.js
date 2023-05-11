import { Component, Property } from "@wonderlandengine/api";
import { EasingFunction, FSM, GamepadButtonID, Globals, Timer, getPlayerObjects, vec3_create } from "../../pp";
import { GameGlobals } from "../game_globals";
import { DialogController } from "../../dialog/dialog-controller";
import { SirDialogButtonComponent } from "./sir_dialog_button_component";

export class SirDialogComponent extends Component {
    static TypeName = "sir-dialog";
    static Properties = {
        _myDialog: Property.object(),
        _mySpeech: Property.object(),
        _myOption1: Property.object(),
        _myOption2: Property.object(),
        _myTriggerPosition: Property.object(),

        _myMinDistance: Property.float(0.75),
        _myMaxAngle: Property.float(90)
    };

    start() {
        this._myStarted = false;

        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "    Sir Dialog");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("hidden", this._hiddenUpdate.bind(this));
        this._myFSM.addState("pop_in", this._popInUpdate.bind(this));
        this._myFSM.addState("visible", this._visibleUpdate.bind(this));
        this._myFSM.addState("pop_out", this._popOutUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "hidden", "start", this._start.bind(this));
        this._myFSM.addTransition("hidden", "pop_in", "show", this._popIn.bind(this));
        this._myFSM.addTransition("pop_in", "visible", "end");
        this._myFSM.addTransition("visible", "pop_out", "hide", this._popOut.bind(this));
        this._myFSM.addTransition("pop_out", "hidden", "end", this._popOutDone.bind(this));

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("hidden", "idle", "stop", this._stop.bind(this));
        this._myFSM.addTransition("pop_in", "idle", "stop", this._stop.bind(this));
        this._myFSM.addTransition("visible", "idle", "stop", this._stop.bind(this));
        this._myFSM.addTransition("pop_out", "idle", "stop", this._stop.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._mySpawnTimer = new Timer(0.2, false);
        this._myUnspawnTimer = new Timer(0.2, false);
        this._myTargetScale = vec3_create(1);

        this._myDialogController = this.object.pp_getComponent(DialogController);

        this._myOption1Button = this._myOption1.pp_getComponent(SirDialogButtonComponent);
        this._myOption2Button = this._myOption2.pp_getComponent(SirDialogButtonComponent);

        this._mySpawnButtonDelayTimer = new Timer(0.4, false);
    }

    update(dt) {
        if (this._myStarted) {
            this._myFSM.update(dt);
        }
    }

    startSirDialog() {
        this._myStarted = true;
        this._myFSM.perform("start");
    }

    stopSirDialog() {
        this._myStarted = false;
        this._myFSM.perform("stop");
    }

    _hiddenUpdate(dt, fsm) {
        if (this._isDialogVisible()) {
            fsm.perform("show");
        }
    }

    _popInUpdate(dt, fsm) {
        if (this._mySpawnTimer.isRunning()) {
            this._mySpawnTimer.update(dt);

            this._myDialog.pp_setScale(this._myTargetScale.vec3_scale(Math.max(EasingFunction.easeOut(this._mySpawnTimer.getPercentage()), Math.PP_EPSILON * 100)));

            if (this._mySpawnTimer.isDone()) {
                fsm.perform("end");

                this._myOption1Button.registerClickEventListener(this, this._onButton1Click.bind(this));
                this._myOption2Button.registerClickEventListener(this, this._onButton2Click.bind(this));

                if (this._myDialogController.currentState != "") {
                    this._myDialogController.resume();
                } else {
                    this._myDialogController.play();
                }
            }
        }
    }

    _visibleUpdate(dt, fsm) {
        if (!this._isDialogVisible()) {
            fsm.perform("hide");
        }

        if (this._myDialogController.isWaitingForResponse()) {
            this._myOption1Button.setPreventClick(false);
            this._myOption2Button.setPreventClick(false);

            if (!this._myOption1Button.isVisible()) {
                this._myOption1Button.show();
                this._mySpawnButtonDelayTimer.start();
            } else if (!this._myOption2Button.isVisible()) {
                if (this._mySpawnButtonDelayTimer.isRunning()) {
                    this._mySpawnButtonDelayTimer.update(dt);
                    if (this._mySpawnButtonDelayTimer.isDone()) {
                        this._myOption2Button.show();
                    }

                }
            }
        } else {
            this._myOption1Button.setPreventClick(true);
            this._myOption2Button.setPreventClick(true);

            if (this._myOption1Button.isVisible()) {
                if (this._mySpawnButtonDelayTimer.isRunning()) {
                    this._mySpawnButtonDelayTimer.update(dt);
                    if (this._mySpawnButtonDelayTimer.isDone()) {
                        this._myOption1Button.hide();
                        this._mySpawnButtonDelayTimer.start();
                    }
                } else {
                    this._mySpawnButtonDelayTimer.start();
                }
            } else if (this._myOption2Button.isVisible()) {
                if (this._mySpawnButtonDelayTimer.isRunning()) {
                    this._mySpawnButtonDelayTimer.update(dt);
                    if (this._mySpawnButtonDelayTimer.isDone()) {
                        this._myOption2Button.hide();
                    }

                }
            }
        }
    }

    _popOutUpdate(dt, fsm) {
        if (this._myUnspawnTimer.isRunning()) {
            this._myUnspawnTimer.update(dt);

            this._myDialog.pp_setScale(this._myTargetScale.vec3_scale(Math.max(EasingFunction.easeOut(1 - this._myUnspawnTimer.getPercentage()), Math.PP_EPSILON * 100)));

            if (this._myUnspawnTimer.isDone()) {
                this._stop();

                fsm.perform("end");
            }
        }
    }

    _start(fsm) {
        this._mySpeech.pp_setActive(false);

        this._myOption1Button.startButton();
        this._myOption2Button.startButton();
        this._mySpawnButtonDelayTimer.reset();
    }

    _popIn(fsm) {
        this._mySpawnTimer.start();

        this._myDialog.pp_setScale(Math.PP_EPSILON * 100);

        this._mySpeech.pp_setActive(true);

        this._myOption1Button.startButton();
        this._myOption2Button.startButton();

        if (this._myDialogController.isWaitingForResponse()) {
            this._myOption1Button.show();
            this._myOption2Button.show();
        }

        this._mySpawnButtonDelayTimer.reset();
    }

    _popOut(fsm) {
        this._myOption1Button.unregisterClickEventListener(this);
        this._myOption2Button.unregisterClickEventListener(this);

        this._myUnspawnTimer.start();

        this._myDialog.pp_setScale(1);
    }

    _stop(fsm) {
        this._mySpawnTimer.reset();
        this._myUnspawnTimer.reset();

        this._mySpeech.pp_setActive(false);

        this._myOption1Button.unregisterClickEventListener(this);
        this._myOption2Button.unregisterClickEventListener(this);

        this._myOption1Button.stopButton();
        this._myOption2Button.stopButton();
        this._mySpawnButtonDelayTimer.reset();
    }

    _isDialogVisible() {
        let visible = false;

        let playerPosition = GameGlobals.myPlayerTransformManager.getPosition();
        let playerForward = GameGlobals.myPlayerTransformManager.getRotationQuat().quat_getForward();

        let dialogTriggerPosition = this._myTriggerPosition.pp_getPosition();

        let flatPlayerPosition = playerPosition.vec3_removeComponentAlongAxis(GameGlobals.myUp);
        let flatPlayerForward = playerForward.vec3_removeComponentAlongAxis(GameGlobals.myUp);

        let flatDialogTriggerPosition = dialogTriggerPosition.vec3_removeComponentAlongAxis(GameGlobals.myUp);

        if (flatPlayerPosition.vec3_distance(flatDialogTriggerPosition) <= this._myMinDistance) {
            let flatVectorToTrigger = flatDialogTriggerPosition.vec3_sub(flatPlayerPosition);
            if (flatPlayerForward.vec3_angle(flatVectorToTrigger) <= this._myMaxAngle) {
                visible = true;
            }
        }

        return visible;
    }

    _popOutDone() {
        this._myDialogController.pause()
    }

    _onButton1Click() {
        this._myDialogController.advance(0);
    }

    _onButton2Click() {
        this._myDialogController.advance(1);
    }
}