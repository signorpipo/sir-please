import {Component, Emitter, Property} from '@wonderlandengine/api';

/**
 * dialog-manager
 */
export class DialogManager extends Component {
    static TypeName = 'dialog-manager';

    init() {
        fetch('./Dialog.json')
            .then((response) => response.json())
            .then((json) => {
                console.log(json)
                this.dialogs = json;
            });

        this.events = new Map();
        this.sounds = new Map();
    }

    /**
     * Get a dialog json object by name
     * @param name Name of the dialog to get
     */
    getDialog(name) {
        return this.dialogs[name];
    }

    /**
     * Start a dialog on a dialog controller
     * @param dialogController Controller to play
     */
    play(dialogController) {
        if(this.playingDialog) return;
        this.playingDialog = dialogController;
        dialogController.play();
    }

    /**
     * Triggered when a dialog comes to an end
     * Internal function, pls no touch
     * @param dialogController Controller that ended
     */
    onEnd(dialogController) {
        if(this.playingDialog != dialogController) return;
        this.playingDialog = null;
    }

    /**
     * Stop the current dialog which resets it
     */
    stop() {
        if(!this.playingDialog) return;
        this.playingDialog.stop();
        this.playingDialog = null;
    }

    /**
     * Pause the current dialog
     * This also resets the text animator
     */
    pause() {
        if(!this.playingDialog) return;
        this.playingDialog.pause();
    }

    /**
     * Resume the current dialog
     */
    resume() {
        if(!this.playingDialog) return;
        this.playingDialog.resume();
    }

    /**
     * Advance the current dialog with a response
     * @param choiceIndex Index of the response to advance with, provide -1 if there are no responses
     */
    advance(choiceIndex) {
        if(!this.playingDialog) return;
        this.playingDialog.advance(choiceIndex);
    }

    /**
     * Wether the dialog is waiting for a response or timer
     */
    isWaitingForResponse() {
        if(!this.playingDialog) return false;
        return this.playingDialog.isWaitingForResponse();
    }

    /**
     * Wether a dialog is currently playing
     */
    isPlaying() {
        return this.playingDialog != undefined;
    }

    /**
     * Add a listener for a dialog event
     */
    addEventListener(name, callback) {
        if (!this.events.has(name)) {
            this.events.set(name, new Emitter());
        }
        this.events.get(name).add(callback);
    }

    /**
     * Dispatch a dialog event
     * @param name Name of the event to dispatch
     */
    dispatchEvent(name) {
        if (!this.events.has(name)) return;
        const emitter = this.events.get(name);
        emitter.notify();
    }

    addSound(name, path) {
        this.sounds.set(name, path);
    }

    triggerSound(name, source) {
        if(!this.sounds.has(name)) {
            console.warn("No sound by name " + name + " exists");
            return;
        }
        var sound = this.sounds.get(name);
        source.onSound(sound);
    }

    triggerAnimation(name) {
        // TODO
    }
}
