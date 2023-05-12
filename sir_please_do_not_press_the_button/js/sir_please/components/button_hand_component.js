import { Component, Emitter, Property } from "@wonderlandengine/api";
import { Timer, vec3_create } from "../../pp";
import { GameGlobals } from "../game_globals";

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

        this._mySpawnParticlesTimer = new Timer(0);
    }

    update(dt) {
        if (this._myStarted) {
            this.object.pp_translateObject(this._myTranslateVector.vec3_set(this._myCurrentSpeed * this._mySpeedMultiplier * dt, 0, 0));

            this._mySpawnParticlesTimer.update(dt);
            if (this._mySpawnParticlesTimer.isDone()) {
                let normalizedSpeed = (this._myCurrentSpeed * this._mySpeedMultiplier / this._mySpeed);
                GameGlobals.myHandParticlesSpawner._myScaleMultiplier = 0.010 * Math.pp_mapToRange(normalizedSpeed, 0.5, 1.5, 0.75, 1.25);
                GameGlobals.myHandParticlesSpawner._myVerticalSpeedMultiplier = 1 * Math.pp_mapToRange(normalizedSpeed, 0.5, 1.5, 0.5, 1);
                GameGlobals.myHandParticlesSpawner.spawn(this.object.pp_getPosition());

                this._mySpawnParticlesTimer.start((1 / (normalizedSpeed)) / 40);
            }
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
        if (multiplier > 0) {
            this._myCurrentSpeed += this._mySpeed * multiplier;
        } else {
            this._myCurrentSpeed *= -multiplier;
        }

        if (this._myCurrentSpeed < this._myMinSpeedToStop) {
            this._myCurrentSpeed = 0;
        }
    }

    startButtonHand() {
        this._myStarted = true;

        this._myCurrentSpeed = this._mySpeed;
        this._mySpeedMultiplier = 1;

        this._mySpawnParticlesTimer.start(0);

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