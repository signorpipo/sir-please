import { Component, Emitter, PhysXComponent } from "@wonderlandengine/api";
import { CursorTarget } from "@wonderlandengine/components";
import { BrowserUtils, Globals, InputSourceType, InputUtils, PhysicsCollisionCollector, XRUtils } from "../../pp";
import { AnalyticsUtils } from "../analytics_utils";
import { GameGlobals } from "../game_globals";
import { SetHandednessComponent } from "./set_handedness_component";

export class ExplodeButtonComponent extends Component {
    static TypeName = "explode-button";
    static Properties = {};

    start() {
        this._myClickEmitter = new Emitter();

        this._myPhysX = this.object.pp_getComponent(PhysXComponent);
        this._myCollisionsCollector = new PhysicsCollisionCollector(this._myPhysX, true);

        this._myCursorTarget = this.object.pp_getComponent(CursorTarget);
        this._myCursorTarget.onUpWithDown.add(this.clickButton.bind(this, true));

        this._myActive = false;
    }

    update(dt) {
        if (!this._myActive) return;

        this._myCollisionsCollector.update(dt);

        if (this._myCollisionsCollector.getCollisionsStart().length > 0 && !GameGlobals.myBlackFader.isFading()) {
            let physx = this._myCollisionsCollector.getCollisionsStart()[0];
            let handedness = physx.pp_getComponent(SetHandednessComponent);
            if (handedness != null) {
                this.clickButton(true, handedness.getHandedness());
            } else {
                this.clickButton(false);
            }
        }

        if (GameGlobals.myButtonHand != null && GameGlobals.myButtonHand.object.pp_getPosition()[1] < this.object.pp_getPosition()[1]) {
            this.clickButton(false);
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

    clickButton(manualClick = true, handedness = null) {
        if (!this._myActive) return;

        if (handedness == null) {
            Globals.getLeftGamepad().pulse(0.2, 0.2);
            Globals.getRightGamepad().pulse(0.2, 0.2);
        } else {
            Globals.getGamepad(handedness).pulse(0.2, 0.2);
        }

        this._myClickEmitter.notify();

        if (manualClick) {
            if (XRUtils.isSessionActive()) {
                AnalyticsUtils.sendEventOnce("manual_explode_vr", false);
                if (handedness != null) {
                    if (InputUtils.getInputSourceTypeByHandedness(handedness) == InputSourceType.TRACKED_HAND) {
                        AnalyticsUtils.sendEventOnce("manual_explode_vr_hand");
                    } else {
                        AnalyticsUtils.sendEventOnce("manual_explode_vr_gamepad");
                    }
                } else {
                    AnalyticsUtils.sendEventOnce("manual_explode_vr_no_handedness");
                }
            } else {
                AnalyticsUtils.sendEventOnce("manual_explode_flat");
                if (BrowserUtils.isMobile()) {
                    AnalyticsUtils.sendEventOnce("manual_explode_flat_mobile");
                } else {
                    AnalyticsUtils.sendEventOnce("manual_explode_flat_desktop");
                }
            }
        }
    }
}