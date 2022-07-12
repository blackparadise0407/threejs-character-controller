export class CharacterControllerInput {
  public keys!: { [key: string]: boolean };

  constructor() {
    this.init();
  }

  private init(): void {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      crouch: false,
    };

    document.addEventListener(
      "keydown",
      (e) => {
        this.onKeyDown(e);
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        this.onKeyUp(e);
      },
      false
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case "w":
        this.keys.forward = true;
        break;
      case "s":
        this.keys.backward = true;
        break;
      case "a":
        this.keys.left = true;
        break;
      case "d":
        this.keys.right = true;
        break;
      case "c":
        this.keys.crouch = true;
        break;
      case "shift":
        this.keys.shift = true;
        break;
      case " ":
        this.keys.space = true;
        break;
      default:
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case "w":
        this.keys.forward = false;
        break;
      case "s":
        this.keys.backward = false;
        break;
      case "a":
        this.keys.left = false;
        break;
      case "d":
        this.keys.right = false;
        break;
      case "c":
        this.keys.crouch = false;
        break;
      case "shift":
        this.keys.shift = false;
        break;
      case " ":
        this.keys.space = false;
        break;
      default:
        break;
    }
  }
}
