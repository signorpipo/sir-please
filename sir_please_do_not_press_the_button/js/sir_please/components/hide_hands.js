import { Component, Property } from "@wonderlandengine/api";
import { XRUtils } from "../../pp";

export class HideHandsComponent extends Component {
    static TypeName = "hide-hands";
    static Properties = {
        _myLeftHand: Property.object(),
        _myRightHand: Property.object()
    };

    start() {
        this._myShowHands = false;
    }

    update(dt) {
        if (XRUtils.isSessionActive()) {
            if (this._myShowHands) {
                this._myLeftHand.pp_setActive(true);
                this._myRightHand.pp_setActive(true);
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