import { Component, Property } from "@wonderlandengine/api";
import { EasingFunction, Globals, Timer, VisualMesh, VisualMeshParams, vec3_create, vec4_create } from "../../pp";

export class FadeViewInOutComponent extends Component {
    static TypeName = "fade-view-in-out";
    static Properties = {
        _myColor: Property.string("0, 0, 0"),
        _myTimeToFadeIn: Property.float(0),
        _myTimeToFadeOut: Property.float(0),
        _myScaleMultiplier: Property.float(10)
    };

    start() {
        this._myFadeInTimer = new Timer(this._myTimeToFadeIn, false);
        this._myFadeOutTimer = new Timer(this._myTimeToFadeOut, false);

        this._myColorVector = vec4_create(0, 0, 0, 1);
        let colorRGB = [...this._myColor.split(",")];
        this._myColorVector[0] = parseInt(colorRGB[0]) / 255;
        this._myColorVector[1] = parseInt(colorRGB[1]) / 255;
        this._myColorVector[2] = parseInt(colorRGB[2]) / 255;

        this._myFadeMaterial = Globals.getDefaultMaterials(this.engine).myFlatTransparentNoDepth.clone();
        this._myFadeMaterial.color = this._myColorVector;

        this._myFadeParentObject = this.object.pp_addObject();

        let fadeVisualParams = new VisualMeshParams(this.engine);
        fadeVisualParams.myMesh = Globals.getDefaultMeshes(this.engine).myInvertedSphere;
        fadeVisualParams.myMaterial = this._myFadeMaterial;
        fadeVisualParams.myParent = this._myFadeParentObject;
        fadeVisualParams.myLocal = true;
        fadeVisualParams.myTransform.mat4_setScale(vec3_create(0.1, 0.1, 0.1));
        this._myFadeVisual = new VisualMesh(fadeVisualParams);

        this._myFadeParentObject.pp_setParent(Globals.getPlayerObjects(this.engine).myHead, false);
        this._myFadeParentObject.pp_resetTransformLocal();
        this._myFadeParentObject.pp_scaleObject(this._myScaleMultiplier);

        this._myFadeVisual.setVisible(false);
    }

    update(dt) {
        if (this._myFadeInTimer.isRunning()) {
            this._myFadeInTimer.update(dt);
            this._myColorVector[3] = 1 - EasingFunction.easeIn(this._myFadeInTimer.getPercentage());
            if (this._myFadeInTimer.isDone()) {
                this._myColorVector[3] = 0;
            }

            this._myFadeMaterial.color = this._myColorVector;

            if (this._myFadeInTimer.isDone()) {
                this._myFadeVisual.setVisible(false);
            }
        }

        if (this._myFadeOutTimer.isRunning()) {
            this._myFadeOutTimer.update(dt);
            this._myColorVector[3] = EasingFunction.easeIn(this._myFadeOutTimer.getPercentage());
            if (this._myFadeOutTimer.isDone()) {
                this._myColorVector[3] = 1;
            }

            this._myFadeMaterial.color = this._myColorVector;
        }
    }

    fadeIn(instant = false, timeToFadeOverride = null) {
        this._myFadeVisual.setVisible(true);
        this._myFadeOutTimer.reset();

        if (instant) {
            this._myFadeInTimer.start(0);
            this.update(0);
        } else {
            this._myFadeInTimer.start(timeToFadeOverride == null ? this._myTimeToFadeIn : timeToFadeOverride);
        }
    }

    fadeOut(instant = false, timeToFadeOverride = null) {
        this._myFadeVisual.setVisible(true);
        this._myFadeInTimer.reset();

        if (instant) {
            this._myFadeOutTimer.start(0);
            this.update(0);
        } else {
            this._myFadeOutTimer.start(timeToFadeOverride == null ? this._myTimeToFadeOut : timeToFadeOverride);
        }
    }

    isFading() {
        return this._myFadeOutTimer.isRunning() || this._myFadeInTimer.isRunning();
    }

    onDeactivate() {
        this._myFadeInTimer.reset();
        this._myFadeOutTimer.reset();
        this._myFadeVisual.setVisible(false);
    }
}