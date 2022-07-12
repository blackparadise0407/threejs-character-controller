import {
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import model from "@/resources/model.fbx?url";

import {
  CharacterController,
  CharacterControllerParams,
} from "./CharacterController";
import { ThirdPersonCamera } from "./ThirdPersonCamera";

export class Application {
  private renderer!: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private controls!: CharacterController;
  private manager!: LoadingManager;
  private mixers!: AnimationMixer[];
  private target!: Group;
  private previousAnimate!: number | null;
  private thirdPersonCamera!: ThirdPersonCamera;

  constructor() {
    this.init();
  }

  private init(): void {
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.manager = new LoadingManager(undefined, (_, loaded, total) => {
      console.log(loaded, total);
    });

    this.scene = new Scene();

    // All other inits have to be after new Scene();

    this.initCamera();
    this.initOrbitControls();
    this.initLights();
    this.initPlane();

    this.mixers = [];
    this.previousAnimate = null;

    process.env.NODE_ENV === "development" && this.initHelpers();

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    this.loadAnimatedModel();
    this.animate();
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }

  private initOrbitControls(): void {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(25, 10, 25);
    controls.target.set(0, 10, 0);
    controls.enabled = false;
    controls.update();
  }

  private initLights(): void {
    const aLight = new AmbientLight(0xffffff, 0.25);
    this.scene.add(aLight);

    const dLight = new DirectionalLight(0xffffff, 1.0);
    dLight.position.set(-100, 100, 100);
    dLight.target.position.set(0, 0, 0);
    dLight.castShadow = true;
    dLight.shadow.bias = -0.001;
    dLight.shadow.mapSize.width = 4096;
    dLight.shadow.mapSize.height = 4096;
    dLight.shadow.camera.near = 0.1;
    dLight.shadow.camera.far = 500.0;
    dLight.shadow.camera.near = 0.5;
    dLight.shadow.camera.far = 500.0;
    dLight.shadow.camera.left = 50;
    dLight.shadow.camera.right = -50;
    dLight.shadow.camera.top = 50;
    dLight.shadow.camera.bottom = -50;
    this.scene.add(dLight);
  }

  private initPlane(): void {
    const geometry = new PlaneGeometry(1000, 1000, 100, 100);
    const material = new MeshStandardMaterial({ color: 0xaeaeae });
    const plane = new Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
  }

  private animate(): void {
    requestAnimationFrame((t) => {
      if (this.previousAnimate === null) {
        this.previousAnimate = t;
      }

      this.animate();

      this.render();
      this.step(t - this.previousAnimate);
      this.previousAnimate = t;
    });
  }

  private step(timeElapsed: number): void {
    const timeElapsedS = timeElapsed * 0.001;
    if (this.mixers) {
      this.mixers.map((m) => m.update(timeElapsedS));
    }

    if (this.controls) {
      this.controls.update(timeElapsedS);
    }

    this.thirdPersonCamera.update(timeElapsedS);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private initHelpers(): void {
    this.scene.add(new AxesHelper(100), new GridHelper(1000, 100));
  }

  private loadModel(): void {
    const loader = new FBXLoader(this.manager);
    loader.load(model, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse((c) => {
        c.receiveShadow = true;
        c.castShadow = true;
      });

      this.target = fbx;
      this.scene.add(this.target);
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private loadAnimatedModel(): void {
    const params: CharacterControllerParams = {
      scene: this.scene,
      camera: this.camera,
    };

    this.controls = new CharacterController(params);

    this.thirdPersonCamera = new ThirdPersonCamera({
      camera: this.camera,
      target: this.controls,
    });
  }
}
