import { Component, Property } from "@wonderlandengine/api";
import { XRUtils } from "../../pp";

export class HideHandsComponent extends Component {
    static TypeName = "hide-hands";
    static Properties = {
        _myLeftHand: Property.object(),
        _myRightHand: Property.object()
    };

    start() {
        this._myShowOnEnterVR = false;
        this._mySessionStartedOnce = false;

        XRUtils.registerSessionStartEventListener(this, this._onXRSessionStart.bind(this));
    }

    hide() {
        this._myLeftHand.pp_setActive(false);
        this._myRightHand.pp_setActive(false);

        this._myShowOnEnterVR = false;
    }

    show() {
        if (this._mySessionStartedOnce) {
            this._myLeftHand.pp_setActive(true);
            this._myRightHand.pp_setActive(true);
        } else {
            this._myShowOnEnterVR = true;
        }
    }

    _onXRSessionStart() {
        this._mySessionStartedOnce = true;

        if (this._myShowOnEnterVR) {
            this._myShowOnEnterVR = false;
            this.show();
        }
    }
}