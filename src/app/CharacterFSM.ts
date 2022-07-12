import { AnimationsMap } from "./CharacterController";
import { FiniteStateMachine } from "./FiniteStateMachine";
import {
  CrouchIdleState,
  CrouchWalkState,
  DanceState,
  IdleState,
  RunBackwardState,
  RunState,
  StandToCrouchState,
  WalkBackwardState,
  WalkState,
  WalkStrafeLeftState,
} from "./States";

export class CharacterFSM extends FiniteStateMachine {
  public animations: AnimationsMap;

  constructor(animations: AnimationsMap) {
    super();
    this.animations = animations;
    this.init();
  }

  private init(): void {
    this.addState("idle", IdleState);
    this.addState("walk", WalkState);
    this.addState("run", RunState);
    this.addState("standToCrouch", StandToCrouchState);
    this.addState("walkBackward", WalkBackwardState);
    this.addState("runBackward", RunBackwardState);
    this.addState("crouchWalk", CrouchWalkState);
    this.addState("crouchIdle", CrouchIdleState);
    this.addState("leftStrafeWalk", WalkStrafeLeftState);
    this.addState("dance", DanceState);
  }
}
