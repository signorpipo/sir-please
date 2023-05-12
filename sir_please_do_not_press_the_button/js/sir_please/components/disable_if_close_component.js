import { Component, Property } from "@wonderlandengine/api";
import { ComponentUtils, Globals, vec3_create } from "../../pp";
import { GameGlobals } from "../game_globals";

export class DisableIfCloseComponent extends Component {
    static TypeName = "disable-if-close";
    static Properties = {
        _myPivot: Property.object(),
        _myObject: Property.object(),
        _myDistance: Property.float(0)
    };

    start() {
        this._myPosition = vec3_create();
        this._myOtherPosition = vec3_create();
    }

    update(dt) {
        this.object.pp_getPosition(this._myPosition);
        if (this._myObject != null) {
            this._myObject.pp_getPosition(this._myOtherPosition);
        }

        let distance = this._myPosition.vec3_distance(this._myOtherPosition);

        if (distance < this._myDistance) {
            this.object.pp_setActive(false);
        }
    }

    onActivate() {
        if (this._myPivot != null) {
            this.object.pp_getPosition(this._myPosition);
            if (this._myObject != null) {
                this._myObject.pp_getPosition(this._myOtherPosition);
            }

            let distance = this._myPosition.vec3_distance(this._myOtherPosition);

            if (distance < this._myDistance) {
                this._myPivot.pp_setScaleLocal(0.0001);
                this._myPivot.pp_setPositionLocal(vec3_create(0, -200, 0));
            } else {
                this._myPivot.pp_resetScaleLocal();
                this._myPivot.pp_resetPositionLocal();
            }
        }
    }

    pp_clone(targetObject) {
        let clonedComponent = ComponentUtils.cloneDefault(this, targetObject);

        return clonedComponent;
    }
}