import { Component, Emitter, PhysXComponent } from "@wonderlandengine/api";
import { Globals, PhysicsCollisionCollector } from "../../pp";
import { SetHandednessComponent } from "./set_handedness_component";

export class ExplodeButtonComponent extends Component {
    static TypeName = "explode-button";
    static Properties = {};

    start() {
        this._myClickEmitter = new Emitter();

        this._myPhysX = this.object.pp_getComponent(PhysXComponent);
        this._myCollisionsCollector = new PhysicsCollisionCollector(this._myPhysX, true);
    }

    update(dt) {
        this._myCollisionsCollector.update(dt);

        if (this._myCollisionsCollector.getCollisionsStart().length > 0) {
            let physx = this._myCollisionsCollector.getCollisionsStart()[0];
            let handedness = physx.pp_getComponent(SetHandednessComponent);
            if (handedness != null) {
                Globals.getGamepad(handedness.getHandedness()).pulse(0.2, 0.2);
            }

            this.clickButton();
        }
    }

    registerClickEventListener(id, listener) {
        this._myClickEmitter.add(listener, { id: id });
    }

    unregisterClickEventListener(id) {
        this._myClickEmitter.remove(id);
    }

    clickButton() {
        this._myClickEmitter.notify();
    }
}