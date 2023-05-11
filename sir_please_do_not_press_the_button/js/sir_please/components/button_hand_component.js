import { Component, Emitter, Property } from "@wonderlandengine/api";
import { vec3_create } from "../../pp";

export class ButtonHandComponent extends Component {
    static TypeName = "button-hand";
    static Properties = {
        _mySpeed: Property.float(1),
        _myMinSpeedToStop: Property.float(0.01),
    };

    start() {
        this._myStarted = false;

        this._myInitialTransform = this.object.pp_getTransformQuat();

        this._myCurrentSpeed = this._mySpeed;
        this._mySpeedMultiplier = 1;

        this._myHandStopEmitter = new Emitter();

        this._myTranslateVector = vec3_create(0);
    }

    update(dt) {
        if (this._myStarted) {
            this.object.pp_translateObject(this._myTranslateVector.vec3_set(this._myCurrentSpeed * this._mySpeedMultiplier * dt, 0, 0));
        }
    }

    setSpeed(speed) {
        this._myCurrentSpeed = speed;
    }

    getSpeed() {
        return this._myCurrentSpeed;
    }

    setSpeedMultiplier(speedMultiplier) {
        this._mySpeedMultiplier = speedMultiplier;
    }

    multiplySpeed(multiplier) {
        this._myCurrentSpeed *= multiplier;

        if (this._myCurrentSpeed < this._myMinSpeedToStop) {
            this._myCurrentSpeed = 0;
        }
    }

    startButtonHand() {
        this._myStarted = true;

        this._myCurrentSpeed = this._mySpeed;
        this._mySpeedMultiplier = 1;

        this.object.pp_setTransformQuat(this._myInitialTransform);
    }

    stopButtonHand() {
        this._myStarted = false;
    }

    registerHandStopEventListener(id, listener) {
        this._myHandStopEmitter.add(listener, { id: id });
    }

    unregisterHandStopEventListener(id) {
        this._myHandStopEmitter.remove(id);
    }
}