import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  LoadingManager,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import { CharacterControllerInput } from "./CharacterControllerInput";
import { CharacterFSM } from "./CharacterFSM";
import { FiniteStateMachine } from "./FiniteStateMachine";

import model from "@/resources/model.fbx?url";
import idle from "@/resources/animations/idle.fbx?url";
import walk from "@/resources/animations/walk.fbx?url";
import run from "@/resources/animations/run.fbx?url";
import walkBackward from "@/resources/animations/walkBackward.fbx?url";
import standToCrouch from "@/resources/animations/standToCrouch.fbx?url";
import runBackward from "@/resources/animations/runBackward.fbx?url";
import crouchWalk from "@/resources/animations/crouchWalk.fbx?url";
import crouchIdle from "@/resources/animations/crouchIdle.fbx?url";
import leftStrafeWalk from "@/resources/animations/leftStrafeWalk.fbx?url";
import dance from "@/resources/animations/dance.fbx?url";

export interface CharacterControllerParams {
  camera: PerspectiveCamera;
  scene: Scene;
}

export interface AnimationsMap {
  [key: string]: {
    clip: AnimationClip;
    action: AnimationAction;
  };
}

export class CharacterController {
  private params!: CharacterControllerParams;
  private decceleration!: Vector3;
  private acceleration!: Vector3;
  private velocity!: Vector3;
  private animations!: AnimationsMap;
  private input!: CharacterControllerInput;
  private stateMachine!: FiniteStateMachine;
  private target!: Group;
  private mixer!: AnimationMixer;
  private manager!: LoadingManager;
  private _position!: Vector3;

  constructor(params: CharacterControllerParams) {
    this.init(params);
  }

  public get position(): Vector3 {
    return this._position;
  }

  public get rotation(): Quaternion {
    if (!this.target) {
      return new Quaternion();
    }
    return this.target.quaternion;
  }

  private init(params: CharacterControllerParams): void {
    this.params = params;
    this.decceleration = new Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new Vector3(2, 0.25, 70.0);
    this.velocity = new Vector3(0, 0, 0);
    this._position = new Vector3();

    this.animations = {};
    this.input = new CharacterControllerInput();
    this.stateMachine = new CharacterFSM(this.animations);

    this.loadModels();
  }

  private loadModels(): void {
    const loader = new FBXLoader();
    loader.load(model, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse((c) => {
        c.castShadow = true;
      });

      this.target = fbx;
      this.params.scene.add(this.target);

      this.mixer = new AnimationMixer(this.target);
      this.manager = new LoadingManager();

      this.manager.onLoad = () => {
        this.stateMachine.setState("idle");
      };

      const onLoad = (animName: string, anim: Group) => {
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);

        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this.manager);
      loader.load(walk, (a) => {
        onLoad("walk", a);
      });
      loader.load(idle, (a) => {
        onLoad("idle", a);
      });
      loader.load(run, (a) => {
        onLoad("run", a);
      });
      loader.load(walkBackward, (a) => {
        onLoad("walkBackward", a);
      });
      loader.load(runBackward, (a) => {
        onLoad("runBackward", a);
      });
      loader.load(standToCrouch, (a) => {
        onLoad("standToCrouch", a);
      });
      loader.load(crouchWalk, (a) => {
        onLoad("crouchWalk", a);
      });
      loader.load(crouchIdle, (a) => {
        onLoad("crouchIdle", a);
      });
      loader.load(leftStrafeWalk, (a) => {
        onLoad("leftStrafeWalk", a);
      });
      loader.load(dance, (a) => {
        onLoad("dance", a);
      });
    });
  }

  public update(timeInSeconds: number): void {
    if (!this.target) {
      return;
    }

    this.stateMachine.update(timeInSeconds, this.input);

    const velocity = this.velocity;
    const frameDecceleration = new Vector3(
      velocity.x * this.decceleration.x,
      velocity.y * this.decceleration.y,
      velocity.z * this.decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this.target;
    const _Q = new Quaternion();
    const _A = new Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this.acceleration.clone();
    if (this.input.keys.shift && !this.input.keys.crouch) {
      acc.multiplyScalar(4.0);
    }

    if (
      this.stateMachine.currentState?.name == "jump" ||
      this.stateMachine.currentState?.name == "crouchIdle"
    ) {
      acc.multiplyScalar(0.0);
    }

    if (this.input.keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this.input.keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this.input.keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * Math.PI * timeInSeconds * this.acceleration.y
      );
      _R.multiply(_Q);
    }
    if (this.input.keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * -Math.PI * timeInSeconds * this.acceleration.y
      );
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);

    oldPosition.copy(controlObject.position);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }
  }
}
