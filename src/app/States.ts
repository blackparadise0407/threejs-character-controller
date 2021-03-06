import { LoopOnce } from "three";
import { CharacterControllerInput } from "./CharacterControllerInput";
import { CharacterFSM } from "./CharacterFSM";

export class State {
  public parent: CharacterFSM;

  constructor(parent: CharacterFSM) {
    this.parent = parent;
  }

  public get name(): string {
    return "";
  }

  public enter(..._args: any[]): void {}
  public exit(): void {}
  public update(..._args: any[]): void {}
}

export class IdleState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "idle";
  }

  public enter(prevState: State): void {
    const idleAction = this.parent.animations["idle"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  public exit(): void {}

  public update(_: any, input: CharacterControllerInput): void {
    if (input.keys.forward || input.keys.backward) {
      this.parent.setState("walk");
    } else if (input.keys.crouch) {
      this.parent.setState("standToCrouch");
    } else if (input.keys.dance) {
      this.parent.setState("dance");
    }
  }
}

export class WalkState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "walk";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["walk"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;

      if (prevState.name == "run") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.forward) {
      if (input.keys.shift && !input.keys.crouch) {
        this.parent.setState("run");
      } else if (input.keys.crouch) {
        this.parent.setState("crouchWalk");
        return;
      }
      return;
    }
    if (input.keys.backward) {
      this.parent.setState("walkBackward");
      return;
    }

    this.parent.setState("idle");
  }
}

export class WalkBackwardState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "walkBackward";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["walkBackward"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;
      curAction.crossFadeFrom(prevAction, 0.1, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.backward) {
      if (input.keys.shift) {
        this.parent.setState("runBackward");
        return;
      }
      this.parent.setState("walkBackward");
      return;
    }

    this.parent.setState("idle");
  }
}

export class RunState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "run";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["run"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;

      if (prevState.name == "walk") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.forward || input.keys.backward) {
      if (!input.keys.shift && !input.keys.crouch) {
        this.parent.setState("walk");
      } else if (input.keys.crouch) {
        this.parent.setState("crouchWalk");
      }
      return;
    }

    this.parent.setState("idle");
  }
}

export class StandToCrouchState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "standToCrouch";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["standToCrouch"].action;

    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.reset();
      curAction.setLoop(LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.crouch) {
      if (input.keys.forward) {
        this.parent.setState("crouchWalk");
      }
      return;
    }
    this.parent.setState("idle");
  }
}

export class RunBackwardState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "runBackward";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["runBackward"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;

      if (prevState.name == "walk") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.backward) {
      if (!input.keys.shift) {
        this.parent.setState("walk");
      }
      return;
    }

    this.parent.setState("idle");
  }
}

export class CrouchWalkState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "crouchWalk";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["crouchWalk"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;

      if (prevState.name == "walk") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.forward) {
      if (input.keys.crouch) {
        this.parent.setState("crouchWalk");
        return;
      }
      if (input.keys.shift) {
        this.parent.setState("run");
        return;
      }
      this.parent.setState("walk");

      return;
    }

    this.parent.setState("crouchIdle");
  }
}

export class CrouchIdleState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "crouchIdle";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["crouchIdle"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      curAction.time = 0.0;
      curAction.enabled = true;
      curAction.setEffectiveTimeScale(1.0);
      curAction.setEffectiveWeight(1.0);
      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.crouch) {
      if (input.keys.forward) {
        this.parent.setState("crouchWalk");
        return;
      }
      return;
    }
    if (input.keys.forward) {
      this.parent.setState("walk");
      return;
    }
    this.parent.setState("idle");
  }
}

export class WalkStrafeLeftState extends State {
  constructor(parent: CharacterFSM) {
    super(parent);
  }

  public get name(): string {
    return "leftStrafeWalk";
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["leftStrafeWalk"].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.enabled = true;

      if (prevState.name == "run") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public exit(): void {}

  public update(_: number, input: CharacterControllerInput): void {
    // if (input.keys.forward) {
    //   if (input.keys.shift && !input.keys.crouch) {
    //     this.parent.setState("run");
    //   }
    //   this.parent.setState("walk");
    //   return;
    // }
    if (input.keys.left) {
      this.parent.setState("leftStrafeWalk");
      return;
    }
    this.parent.setState("idle");
  }
}

export class DanceState extends State {
  private finishCb: () => void;
  constructor(parent: CharacterFSM) {
    super(parent);
    this.finishCb = () => {
      this.finish();
    };
  }

  public get name(): string {
    return "dance";
  }

  public exit(): void {
    this.cleanUp();
  }

  public enter(prevState: State): void {
    const curAction = this.parent.animations["dance"].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener("finished", this.finishCb);

    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;

      curAction.reset();
      curAction.setLoop(LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  public update(_: number, input: CharacterControllerInput): void {
    if (input.keys.forward) {
      this.parent.setState("walk");
    } else if (input.keys.backward) {
      this.parent.setState("walkBackward");
    }
  }

  private finish(): void {
    this.cleanUp();
    this.parent.setState("idle");
  }

  private cleanUp(): void {
    const action = this.parent.animations["dance"].action;

    action.getMixer().removeEventListener("finished", this.finishCb);
  }
}
