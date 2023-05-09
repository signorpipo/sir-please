import { registerPlaygroundComponents } from "../playground/init_playground";
import { FadeViewInOutComponent } from "./components/fade_view_in_out_component";
import { SirPleaseGatewayComponent } from "./components/sir_please_gateway_component";

export function initSirPlease(engine) {
    registerPlaygroundComponents(engine);

    registerSirPleaseComponents(engine);
}

export function registerSirPleaseComponents(engine) {
    engine.registerComponent(FadeViewInOutComponent);
    engine.registerComponent(SirPleaseGatewayComponent);
}