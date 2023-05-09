import { Component, Emitter, PhysXComponent, Property } from "@wonderlandengine/api";
import { PhysicsCollisionCollector } from "../../pp";

export class HideHandsComponent extends Component {
    static TypeName = "hide-hands";
    static Properties = {
        _myLeftHand: Property.object(),
        _myRightHand: Property.object()
    };

    hide() {
        this._myLeftHand.pp_setActive(false);
        this._myRightHand.pp_setActive(false);
    }

    show() {
        this._myLeftHand.pp_setActive(true);
        this._myRightHand.pp_setActive(true);
    }
}