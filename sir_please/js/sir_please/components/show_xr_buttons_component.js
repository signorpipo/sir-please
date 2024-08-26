import { Component } from "@wonderlandengine/api";
import { XRUtils } from "../../pp/index.js";

export let _ButtonBehaviorWhenNotAvailable = {
    NONE: "none",
    DISABLE: "disable",
    HIDE: "hide"
};

/** The buttons must first be enabled from the Wonderland Engine editor -> Project Settings / VR & AR */
export class ShowXRButtonsComponent extends Component {
    static TypeName = "pp-show-xr-buttons";

    init() {
        this._myShowVRButton = true;
        this._myVRButtonBehaviorWhenNotAvailable = 2;
        this._myShowARButton = false;
        this._myARButtonBehaviorWhenNotAvailable = 2;

        this._myFirstUpdate = false;

        this._myVRButtonVisibilityUpdated = false;
        this._myVRButtonUsabilityUpdated = false;
        this._myVRButtonDisabledOpacityUpdated = false;

        this._myARButtonVisibilityUpdated = false;
        this._myARButtonUsabilityUpdated = false;
        this._myARButtonDisabledOpacityUpdated = false;

        this._myXRButtonsContainer = document.getElementById("xr-buttons-container");

        this._myVRButton = document.getElementById("vr-button");
        this._myARButton = document.getElementById("ar-button");
    }

    start() {
        XRUtils.registerSessionStartEndEventListeners(this, this._onXRSessionStart.bind(this), this._onXRSessionEnd.bind(this), true);
    }

    update(dt) {
        if (!this._myFirstUpdate) {
            this._myFirstUpdate = true;

            if (this._myXRButtonsContainer != null) {
                if (this._myShowVRButton || this._myShowARButton) {
                    this._myXRButtonsContainer.style.setProperty("display", "flex");
                } else {
                    this._myXRButtonsContainer.style.setProperty("display", "none");
                }
            }

            if (this._myVRButton != null) {
                if (this._myShowVRButton) {
                    this._myVRButton.style.setProperty("display", "block");
                } else {
                    this._myVRButton.style.setProperty("display", "none");
                }
            }

            if (this._myARButton != null) {
                if (this._myShowARButton) {
                    this._myARButton.style.setProperty("display", "block");
                } else {
                    this._myARButton.style.setProperty("display", "none");
                }
            }
        } else {
            this._updateXRButtons(dt);
        }
    }

    _updateXRButtons(dt) {
        if (this._myShowVRButton) {
            if (!this._myVRButtonUsabilityUpdated) {
                if (this._myVRButton != null) {
                    if (!this._myVRButtonVisibilityUpdated) {
                        this._myVRButton.style.setProperty("transform", "scale(1)");
                        this._myVRButtonVisibilityUpdated = true;
                    }

                    if (!this._myVRButtonUsabilityUpdated) {
                        if (XRUtils.isVRSupported()) {
                            this._myVRButton.style.setProperty("opacity", "1");
                            this._myVRButton.style.setProperty("pointer-events", "all");

                            this._myVRButtonUsabilityUpdated = true;
                        } else if (!this._myVRButtonDisabledOpacityUpdated) {
                            switch (this._myVRButtonBehaviorWhenNotAvailable) {
                                case 0:
                                    this._myVRButton.style.setProperty("opacity", "1");
                                    this._myVRButton.style.setProperty("pointer-events", "all");
                                    break;
                                case 1:
                                    this._myVRButton.style.setProperty("opacity", "0.5");
                                    break;
                                case 2:
                                    this._myVRButton.style.setProperty("display", "none");
                                    break;
                            }

                            this._myVRButtonDisabledOpacityUpdated = true;
                        }
                    }
                } else {
                    this._myVRButtonUsabilityUpdated = true;
                }
            }
        }

        if (this._myShowARButton) {
            if (!this._myARButtonUsabilityUpdated) {
                if (this._myARButton != null) {
                    if (!this._myARButtonVisibilityUpdated) {
                        this._myARButton.style.setProperty("transform", "scale(1)");
                        this._myARButtonVisibilityUpdated = true;
                    }

                    if (!this._myARButtonUsabilityUpdated) {
                        if (XRUtils.isARSupported()) {
                            this._myARButton.style.setProperty("opacity", "1");
                            this._myARButton.style.setProperty("pointer-events", "all");

                            this._myARButtonUsabilityUpdated = true;
                        } else if (!this._myARButtonDisabledOpacityUpdated) {
                            switch (this._myARButtonBehaviorWhenNotAvailable) {
                                case 0:
                                    this._myARButton.style.setProperty("opacity", "1");
                                    this._myARButton.style.setProperty("pointer-events", "all");
                                    break;
                                case 1:
                                    this._myARButton.style.setProperty("opacity", "0.5");
                                    break;
                                case 2:
                                    this._myARButton.style.setProperty("display", "none");
                                    break;
                            }

                            this._myARButtonDisabledOpacityUpdated = true;
                        }
                    }
                } else {
                    this._myARButtonUsabilityUpdated = true;
                }
            }
        }
    }

    _onXRSessionStart() {
        if (this._myXRButtonsContainer != null) {
            this._myXRButtonsContainer.style.setProperty("display", "none");
        }
    }

    _onXRSessionEnd() {
        if (this._myXRButtonsContainer != null && (this._myShowVRButton || this._myShowARButton)) {
            this._myXRButtonsContainer.style.setProperty("display", "flex");
        }
    }
}