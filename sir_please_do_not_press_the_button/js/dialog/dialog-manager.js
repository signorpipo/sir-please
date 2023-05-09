import { Component, Property } from '@wonderlandengine/api';

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
    }

    getDialog(name) {
        return this.dialogs[name];
    }

    play(dialogController) {
        if (this.playingDialog) return;

        this.playingDialog = dialogController;
        dialogController.play();
    }

    end(dialog) {
        if (this.playingDialog != dialog) return;
        this.playingDialog = null;
    }

    advance(choiceIndex) {
        if (!this.playingDialog) return;
        this.playingDialog.advance(choiceIndex);
    }
}
