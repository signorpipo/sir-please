import { Component, Emitter, PhysXComponent } from "@wonderlandengine/api";
import { Globals, PhysicsCollisionCollector } from "../../pp";
import { SetHandednessComponent } from "./set_handedness_component";
import { CursorTarget } from "@wonderlandengine/components";
import { GameGlobals } from "../game_globals";

export class ExplodeButtonComponent extends Component {
    static TypeName = "explode-button";
    static Properties = {};

    start() {
        this._myClickEmitter = new Emitter();

        this._myPhysX = this.object.pp_getComponent(PhysXComponent);
        this._myCollisionsCollector = new PhysicsCollisionCollector(this._myPhysX, true);

        this._myCursorTarget = this.object.pp_getComponent(CursorTarget);
        this._myCursorTarget.onUpWithDown.add(this.clickButton.bind(this));

        this._myActive = false;
    }

    update(dt) {
        if (!this._myActive) return;

        this._myCollisionsCollector.update(dt);

        if (this._myCollisionsCollector.getCollisionsStart().length > 0) {
            let physx = this._myCollisionsCollector.getCollisionsStart()[0];
            let handedness = physx.pp_getComponent(SetHandednessComponent);
            if (handedness != null) {
                Globals.getGamepad(handedness.getHandedness()).pulse(0.2, 0.2);
            }

            this.clickButton();
        }

        if (GameGlobals.myButtonHand != null && GameGlobals.myButtonHand.object.pp_getPosition()[1] < this.object.pp_getPosition()[1]) {
            this.clickButton();
        }
    }

    setActive(active) {
        this._myActive = active;
    }

    registerClickEventListener(id, listener) {
        this._myClickEmitter.add(listener, { id: id });
    }

    unregisterClickEventListener(id) {
        this._myClickEmitter.remove(id);
    }

    clickButton() {
        if (!this._myActive) return;

        this._myClickEmitter.notify();
    }
}