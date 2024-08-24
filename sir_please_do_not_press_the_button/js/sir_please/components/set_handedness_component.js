import { Component, Property } from "@wonderlandengine/api";
import { InputUtils } from "../../pp";

export class SetHandednessComponent extends Component {
    static TypeName = "set-handedness";
    static Properties = {
        _myHandedness: Property.enum(["Left", "Right"], "Left")
    };

    getHandedness() {
        return InputUtils.getHandednessByIndex(this._myHandedness);
    }
}