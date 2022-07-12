import { CharacterControllerInput } from "./CharacterControllerInput";
import { State } from "./States";

export class FiniteStateMachine {
  public currentState: State | null;

  private states: { [name: string]: typeof State };

  constructor() {
    this.states = {};
    this.currentState = null;
  }

  public addState(name: string, type: typeof State): void {
    this.states[name] = type;
  }

  public setState(name: string): void {
    const prevState = this.currentState;

    if (prevState) {
      if (prevState.name === name) {
        return;
      }
      prevState.exit();
    }

    if (this.states[name]) {
      // @ts-ignore
      const nextState = new this.states[name](this);

      this.currentState = nextState;
      nextState.enter(prevState);
    }
  }

  public update(timeElapsed: number, input: CharacterControllerInput): void {
    if (this.currentState) {
      this.currentState.update(timeElapsed, input);
    }
  }
}
