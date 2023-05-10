import { Component, Emitter, PhysXComponent } from "@wonderlandengine/api";
import { PhysicsCollisionCollector } from "../../pp";

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
            this._myClickEmitter.notify();
        }
    }

    registerClickEventListener(id, listener) {
        this._myClickEmitter.add(listener, { id: id });
    }

    unregisterClickEventListener(id) {
        this._myClickEmitter.remove(id);
    }
}