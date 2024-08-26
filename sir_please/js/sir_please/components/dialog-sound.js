import { Component, Property } from '@wonderlandengine/api';
import { DialogManager } from '../../dialog/dialog-manager';
import { Globals } from "../../pp";

/**
 * dialog-sound
 */
export class DialogSound extends Component {
    static TypeName = 'dialog-sound';
    /* Properties that are configurable in the editor */
    static Properties = {
        dialogManager: Property.object(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.audioPlayers = new Map();
    }

    start() {
        this.dialogManager.getComponent(DialogManager).addSound("alert", "alert");
        this.dialogManager.getComponent(DialogManager).addSound("blip", "blip");
    }

    onSound(path) {
        if (!this.audioPlayers.has(path) || !this.audioPlayers.get(path)) {
            this.audioPlayers.set(path, Globals.getAudioManager().createAudioPlayer(path));
        }

        var player = this.audioPlayers.get(path);
        player.setPosition(this.object.pp_getPosition());
        player.play();
    }
}
