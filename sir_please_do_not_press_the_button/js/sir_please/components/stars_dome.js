import { Component, Property } from "@wonderlandengine/api";
import { vec3_create } from "../../pp";

export class StarsDomeComponent extends Component {
    static TypeName = "stars-dome";
    static Properties = {
        _myStars: Property.object(),
        _myStarsCount: Property.int(0),
        _myMinDomeSize: Property.float(0),
        _myMaxDomeSize: Property.float(0),
        _myMinScale: Property.float(0),
        _myMaxScale: Property.float(0),
    };

    start() {
        this._mySpawnedStars = [];

        let maxCount = this._myStarsCount;
        let cloves = Math.ceil(Math.sqrt(this._myStarsCount));

        let angleForClove = Math.PI * 2 / cloves;

        let minDistance = this._myMinDomeSize;
        let maxDistance = this._myMaxDomeSize;

        let minExtraRotation = 0;
        let maxExtraRotation = Math.pp_toRadians(10);

        let upDirection = vec3_create(0, 1, 0);
        let horizontalDirection = vec3_create(0, 0, -1);

        for (let i = 0; i < cloves / 2; i++) {
            let verticalDirection = vec3_create(0, 1, 0);

            let rotationAxis = vec3_create();
            horizontalDirection.vec3_cross(verticalDirection, rotationAxis);
            rotationAxis.vec3_normalize(rotationAxis);

            for (let j = 0; j < cloves; j++) {
                if (this._mySpawnedStars.length < maxCount) {
                    let distance = Math.random() * (maxDistance - minDistance) + minDistance;
                    let extraAxisRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let extraUpRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let starDirection = verticalDirection.pp_clone();

                    starDirection.vec3_rotateAxisRadians(extraAxisRotation, rotationAxis, starDirection);
                    starDirection.vec3_rotateAxisRadians(extraUpRotation, upDirection, starDirection);

                    starDirection.vec3_scale(distance, starDirection);

                    this._addStar(starDirection);
                }

                verticalDirection.vec3_rotateAxisRadians(angleForClove / 2, rotationAxis, verticalDirection);

                if (this._mySpawnedStars.length < maxCount) {
                    let distance = Math.random() * (maxDistance - minDistance) + minDistance;
                    let extraAxisRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let extraUpRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let starDirection = verticalDirection.pp_clone();

                    starDirection.vec3_rotateAxisRadians(extraAxisRotation, rotationAxis, starDirection);
                    starDirection.vec3_rotateAxisRadians(extraUpRotation, upDirection, starDirection);

                    starDirection.vec3_scale(distance, starDirection);

                    this._addStar(starDirection);
                }

                verticalDirection.vec3_rotateAxisRadians(angleForClove / 2, rotationAxis, verticalDirection);
            }

            horizontalDirection.vec3_rotateAxisRadians(angleForClove, upDirection, horizontalDirection);
        }
    }

    update(dt) {
    }

    _addStar(starDirection) {
        let randomStar = Math.pp_randomPick(this._myStars.pp_getChildren()).pp_clone();
        randomStar.pp_setParent(this.object, false);
        randomStar.pp_resetTransformLocal();
        randomStar.pp_setPositionLocal(starDirection);
        randomStar.pp_setRotationLocal(vec3_create(Math.pp_random(-180, 180), Math.pp_random(-180, 180), Math.pp_random(-180, 180)));
        randomStar.pp_setScaleLocal(Math.pp_random(this._myMinScale, this._myMaxScale));

        this._mySpawnedStars.push(randomStar);
    }
}