import { Component } from "@wonderlandengine/api";
import { ComponentUtils, EasingFunction, Timer, vec3_create } from "../pp";

export class ParticleComponent extends Component {
    static TypeName = "particle";
    static Properties = {};

    init() {
        this._myOnDoneCallback = null;
        this._myScaleMultiplier = 1;
        this._myHorizontalSpeedMultiplier = 1;
        this._myVerticalSpeedMultiplier = 1;
        this._myGravity = 0;
    }

    start() {
        let randomScale = Math.pp_random(0.5, 1) * this._myScaleMultiplier;
        this._myTargetScale = vec3_create(randomScale, randomScale, randomScale);

        this.object.pp_setScale(Math.PP_EPSILON);
        this.object.pp_rotate(vec3_create(Math.pp_random(-180, 180), Math.pp_random(-180, 180), Math.pp_random(-180, 180)));

        this._mySpawnTimer = new Timer(Math.pp_random(0.1, 0.2));
        this._myLifeTimer = new Timer(Math.pp_random(0.35, 0.7), false);
        this._myUnspawnTimer = new Timer(Math.pp_random(0.1, 0.2), false);

        this._myHorizontalSpeedDirection = vec3_create(0, 0, 1).vec3_rotateAxis(Math.pp_random(-180, 180), vec3_create(0, 1, 0));
        this._myHorizontalSpeed = this._myHorizontalSpeedDirection.vec3_scale(Math.pp_random(0.5, 1) * this._myHorizontalSpeedMultiplier);

        let verticalSign = 1;
        let minVerticalValue = 0.5;
        if (this._myGravity == 0) {
            verticalSign = Math.pp_randomSign();
            minVerticalValue = 0;
        }
        this._myVerticalSpeed = vec3_create(0, verticalSign, 0).vec3_scale(Math.pp_random(minVerticalValue, 1) * this._myVerticalSpeedMultiplier);
    }

    update(dt) {
        if (this._mySpawnTimer.isRunning()) {
            this._mySpawnTimer.update(dt);

            this.object.pp_setScale(this._myTargetScale.vec3_scale(EasingFunction.easeOut(this._mySpawnTimer.getPercentage())));

            if (this._mySpawnTimer.isDone()) {
                this._myLifeTimer.start();
            }
        }

        if (this._myLifeTimer.isRunning()) {
            this._myLifeTimer.update(dt);
            if (this._myLifeTimer.isDone()) {
                this._myUnspawnTimer.start();
            }
        }

        if (this._myUnspawnTimer.isRunning()) {
            this._myUnspawnTimer.update(dt);

            this.object.pp_setScale(this._myTargetScale.vec3_scale(EasingFunction.easeOut(1 - this._myUnspawnTimer.getPercentage())));

            if (this._myUnspawnTimer.isDone()) {
                if (this._myOnDoneCallback != null) {
                    this._myOnDoneCallback();
                }
            }
        }

        this.object.pp_translate(this._myHorizontalSpeed.vec3_scale(dt));
        this.object.pp_translate(this._myVerticalSpeed.vec3_scale(dt));

        if (this._myGravity != 0) {
            this._myVerticalSpeed = this._myVerticalSpeed.vec3_sub(vec3_create(0, 1, 0).vec3_scale(this._myGravity * dt), this._myVerticalSpeed);
        }
    }

    setHorizontalSpeedMultiplier(speedMultiplier) {
        this._myHorizontalSpeedMultiplier = speedMultiplier;
    }

    setVerticalSpeedMultiplier(speedMultiplier) {
        this._myVerticalSpeedMultiplier = speedMultiplier;
    }

    setGravity(gravity) {
        this._myGravity = gravity;
    }

    setScaleMultiplier(scaleMultiplier) {
        this._myScaleMultiplier = scaleMultiplier;
    }

    onDone(onDoneCallback) {
        this._myOnDoneCallback = onDoneCallback;
    }

    onDeactivate() {
        this._myOnDoneCallback = null;
    }

    onActivate() {
        this.start();
    }

    pp_clone(targetObject) {
        let clonedComponent = ComponentUtils.cloneDefault(this, targetObject);

        return clonedComponent;
    }
}