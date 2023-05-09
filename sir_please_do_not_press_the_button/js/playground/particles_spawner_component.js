import { Component, MeshComponent, Property } from "@wonderlandengine/api";
import { CloneParams, Globals, ObjectPoolParams, ObjectPoolsManager } from "../pp";
import { ParticleComponent } from "./particle_component";

export class ParticlesSpawnerComponent extends Component {
    static TypeName = "particles-spawner";
    static Properties = {
        _myParticlesContainer: Property.object(),
        _myRadius: Property.float(0.25),
        _myMinAmount: Property.int(15),
        _myMaxAmount: Property.int(30),
        _myScaleMultiplier: Property.float(1),
        _myHorizontalSpeedMultiplier: Property.float(1),
        _myVerticalSpeedMultiplier: Property.float(1),
        _myGravity: Property.float(9.81)
    };

    start() {
        this._myParticles = this._myParticlesContainer.pp_getChildren();

        this._myObjectPoolsManager = new ObjectPoolsManager();
        let poolParams = new ObjectPoolParams();

        poolParams.myInitialPoolSize = 10;
        poolParams.myAmountToAddWhenEmpty = 1;
        poolParams.myPercentageToAddWhenEmpty = 1;

        poolParams.myOptimizeObjectsAllocation = true;    // If true it will pre-allocate the memory before adding new objects to the pool

        let cloneParams = new CloneParams();
        cloneParams.myComponentsToInclude.push(MeshComponent.TypeName);

        for (let i = 0; i < this._myParticles.length; i++) {
            let particle = this._myParticles[i].pp_clone(cloneParams);
            particle.pp_addComponent(ParticleComponent);
            particle.pp_setActive(false);
            particle.pp_setParent(Globals.getSceneObjects(this.engine).myParticles);

            this._myObjectPoolsManager.addPool(i, particle, poolParams);
        }
    }

    spawn(position) {
        let amount = Math.pp_randomInt(this._myMinAmount, this._myMaxAmount);

        for (let i = 0; i < amount; i++) {
            let particle = this._myObjectPoolsManager.get(Math.pp_randomInt(0, this._myParticles.length - 1));
            let particleComponent = particle.pp_getComponent(ParticleComponent);

            particleComponent.onDone(this.onParticleDone.bind(this, particle));
            particleComponent.setScaleMultiplier(this._myScaleMultiplier);
            particleComponent.setHorizontalSpeedMultiplier(this._myHorizontalSpeedMultiplier);
            particleComponent.setVerticalSpeedMultiplier(this._myVerticalSpeedMultiplier);
            particleComponent.setGravity(this._myGravity);

            particle.pp_setPosition(position.vec3_add(particleComponent._myHorizontalSpeed.vec3_normalize().vec3_scale(Math.pp_random(0, this._myRadius))));

            particle.pp_setActive(true);
        }
    }

    onParticleDone(particle) {
        this._myObjectPoolsManager.release(particle);
    }
}