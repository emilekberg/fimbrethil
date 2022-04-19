class Transform extends fimbrethil.Component {
  position = new THREE.Vector3();
  rotation = new THREE.Vector3();
}
fimbrethil.registerComponent(Transform);

class Velocity extends fimbrethil.Component {
  position = new THREE.Vector3();
  rotation = new THREE.Vector3();
}
fimbrethil.registerComponent(Velocity);

class Mesh extends fimbrethil.Component {
  mesh = new THREE.Object3D();
}
fimbrethil.registerComponent(Mesh);

class Light extends fimbrethil.Component {
  instance = new THREE.DirectionalLight(0xFFFFFF, 2);
}
fimbrethil.registerComponent(Light);

class Camera extends fimbrethil.Component {
  active = true;
  width = window.innerWidth;
  height = window.innerHeight;
  viewAngle = 45;
  nearClipping = 0.1;
  farClipping = 9999;

  _perspective = undefined;
  get perspective() {
    if (this._perspective === undefined) {
      this._perspective = new THREE.PerspectiveCamera(this.viewAngle, this.width / this.height, this.nearClipping, this.farClipping);
    }
    return this._perspective;
  }

}
fimbrethil.registerComponent(Camera);

class Scene extends fimbrethil.Component {
  value = new THREE.Scene();
}
fimbrethil.registerComponent(Scene);
