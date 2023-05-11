import { Component, Emitter, PhysXComponent, Property } from "@wonderlandengine/api";
import { Globals, InputUtils, PhysicsCollisionCollector } from "../../pp";
import { SetHandednessComponent } from "./set_handedness_component";

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