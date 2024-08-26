import { Component, Property } from "@wonderlandengine/api";
import { Globals, InputUtils } from "../../pp";

export class HideHandIfPoseInvalidComponent extends Component {
    static TypeName = "hide-hand-if-pose-invalid";
    static Properties = {
        _myHandedness: Property.enum(["Left", "Right"], "Left"),
        _myHand: Property.object()
    };

    start() {
        this._myHandPose = Globals.getHandPose(InputUtils.getHandednessByIndex(this._myHandedness));
    }

    update(dt) {
        if (this._myHandPose.isValid()) {
            this._myHand.pp_setActive(true);
        } else {
            this._myHand.pp_setActive(false);
        }
    }
}