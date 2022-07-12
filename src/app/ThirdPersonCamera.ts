import { PerspectiveCamera, Vector3 } from "three";
import { CharacterController } from "./CharacterController";

export interface ThirdPersonCameraParams {
  camera: PerspectiveCamera;
  target: CharacterController;
}

export class ThirdPersonCamera {
  private camera: PerspectiveCamera;
  private params: ThirdPersonCameraParams;
  private currentPosition: Vector3;
  private currentLookat: Vector3;

  constructor(params: ThirdPersonCameraParams) {
    this.params = params;
    this.camera = this.params.camera;

    this.currentLookat = new Vector3();
    this.currentPosition = new Vector3();
  }

  public update(timeElapsed: number): void {
    const idealOffset = this.calculateIdealOffset();
    const idealLookat = this.calculateIdealLookat();

    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this.currentPosition.lerp(idealOffset, t);
    this.currentLookat.lerp(idealLookat, t);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat);
  }

  private calculateIdealOffset(): Vector3 {
    const idealOffset = new Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this.params.target.rotation);
    idealOffset.add(this.params.target.position);
    return idealOffset;
  }

  private calculateIdealLookat(): Vector3 {
    const idealLookat = new Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this.params.target.rotation);
    idealLookat.add(this.params.target.position);
    return idealLookat;
  }
}
