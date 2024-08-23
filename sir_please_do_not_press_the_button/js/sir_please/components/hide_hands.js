import { Component, Property } from "@wonderlandengine/api";
import { Globals, Handedness, XRUtils } from "../../pp";

export class HideHandsComponent extends Component {
    static TypeName = "hide-hands";
    static Properties = {
        _myLeftHand: Property.object(),
        _myRightHand: Property.object()
    };

    start() {
        this._myShowHands = false;

        this._myHandPoseRight = Globals.getHandPose(Handedness.RIGHT);
        this._myHandPoseLeft = Globals.getHandPose(Handedness.LEFT);
    }

    update(dt) {
        if (XRUtils.isSessionActive() && this._myShowHands) {
            if (this._myHandPoseRight.isValid()) {
                this._myRightHand.pp_setActive(true);
            } else {
                this._myRightHand.pp_setActive(false);
            }

            if (this._myHandPoseLeft.isValid()) {
                this._myLeftHand.pp_setActive(true);
            } else {
                this._myLeftHand.pp_setActive(false);
            }
        } else {
            this._myLeftHand.pp_setActive(false);
            this._myRightHand.pp_setActive(false);
        }
    }

    hide() {
        this._myShowHands = false;
    }

    show() {
        this._myShowHands = true;
    }
}