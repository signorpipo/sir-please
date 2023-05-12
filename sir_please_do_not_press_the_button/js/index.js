/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 *     - `wle:auto-constants:start` and `wle:auto-constants:end`: The project's constants,
 *        such as the project's name, whether it should use the physx runtime, etc...
 *     - `wle:auto-benchmark:start` and `wle:auto-benchmark:end`: Append the benchmarking code
 */

/* wle:auto-imports:start */
import {Cursor} from '@wonderlandengine/components';
import {CursorTarget} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {DialogController} from './dialog/dialog-controller.js';
import {DialogManager} from './dialog/dialog-manager.js';
import {ParticlesSpawnerComponent} from './playground/particles_spawner_component.js';
import {AdjustHierarchyPhysXScaleComponent} from './pp/index.js';
import {ConsoleVRToolComponent} from './pp/index.js';
import {EasyTuneToolComponent} from './pp/index.js';
import {PPGatewayComponent} from './pp/index.js';
import {PlayerLocomotionComponent} from './pp/index.js';
import {SetActiveComponent} from './pp/index.js';
import {SetHandLocalTransformComponent} from './pp/index.js';
import {SetHeadLocalTransformComponent} from './pp/index.js';
import {SpatialAudioListenerComponent} from './pp/index.js';
import {SwitchHandObjectComponent} from './pp/index.js';
import {ToolCursorComponent} from './pp/index.js';
import {VirtualGamepadComponent} from './pp/index.js';
import {ButtonHandComponent} from './sir_please/components/button_hand_component.js';
import {DialogSound} from './sir_please/components/dialog-sound.js';
import {ExplodeButtonComponent} from './sir_please/components/explode_button_component.js';
import {FadeViewInOutComponent} from './sir_please/components/fade_view_in_out_component.js';
import {HideHandIfPoseInvalidComponent} from './sir_please/components/hide_hand_if_pose_invalid.js';
import {HideHandsComponent} from './sir_please/components/hide_hands.js';
import {SetHandednessComponent} from './sir_please/components/set_handedness_component.js';
import {SirDialogButtonComponent} from './sir_please/components/sir_dialog_button_component.js';
import {SirDialogComponent} from './sir_please/components/sir_dialog_component.js';
import {SirPleaseGatewayComponent} from './sir_please/components/sir_please_gateway_component.js';
import {StarsDomeComponent} from './sir_please/components/stars_dome.js';
/* wle:auto-imports:end */

import { loadRuntime } from '@wonderlandengine/api';

/* wle:auto-constants:start */
const RuntimeOptions = {
    physx: true,
    loader: false,
    xrFramebufferScaleFactor: 1,
    canvas: 'canvas',
};
const Constants = {
    ProjectName: 'sir_please_do_not_press_the_button',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local',],
    WebXROptionalFeatures: ['local','local-floor','hand-tracking','hit-test',],
};
/* wle:auto-constants:end */

const engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);

engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

/* WebXR setup. */

function requestSession(mode) {
    engine
        .requestXRSession(mode, Constants.WebXRRequiredFeatures, Constants.WebXROptionalFeatures)
        .catch((e) => console.error(e));
}

function setupButtonsXR() {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported;
        arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
    const vrButton = document.getElementById('vr-button');
    if (vrButton) {
        vrButton.dataset.supported = engine.vrSupported;
        vrButton.addEventListener('click', () => requestSession('immersive-vr'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(Cursor);
engine.registerComponent(CursorTarget);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(DialogController);
engine.registerComponent(DialogManager);
engine.registerComponent(ParticlesSpawnerComponent);
engine.registerComponent(AdjustHierarchyPhysXScaleComponent);
engine.registerComponent(ConsoleVRToolComponent);
engine.registerComponent(EasyTuneToolComponent);
engine.registerComponent(PPGatewayComponent);
engine.registerComponent(PlayerLocomotionComponent);
engine.registerComponent(SetActiveComponent);
engine.registerComponent(SetHandLocalTransformComponent);
engine.registerComponent(SetHeadLocalTransformComponent);
engine.registerComponent(SpatialAudioListenerComponent);
engine.registerComponent(SwitchHandObjectComponent);
engine.registerComponent(ToolCursorComponent);
engine.registerComponent(VirtualGamepadComponent);
engine.registerComponent(ButtonHandComponent);
engine.registerComponent(DialogSound);
engine.registerComponent(ExplodeButtonComponent);
engine.registerComponent(FadeViewInOutComponent);
engine.registerComponent(HideHandIfPoseInvalidComponent);
engine.registerComponent(HideHandsComponent);
engine.registerComponent(SetHandednessComponent);
engine.registerComponent(SirDialogButtonComponent);
engine.registerComponent(SirDialogComponent);
engine.registerComponent(SirPleaseGatewayComponent);
engine.registerComponent(StarsDomeComponent);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
