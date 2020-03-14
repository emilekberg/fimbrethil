class Transform extends fimbrethil.Component {
  position = {
    x: 0,
    y: 0,
    z: 0
  };
  rotation = {
    x: 0,
    y: 0,
    z: 0,
  };
}
fimbrethil.registerComponent(Transform);

class Velocity extends fimbrethil.Component {
  position = {
    x: 0,
    y: 0,
    z: 0,
  }
  rotation = {
    x: 0,
    y: 0,
    z: 0,
  }
}
fimbrethil.registerComponent(Velocity);

class Mesh extends fimbrethil.Component {
  geometry = new THREE.BoxGeometry();
  material = new THREE.MeshPhongMaterial({
    // light
    specular: 0xD76531,
    // intermediate
    color: 0xef8834,
    // dark
    emissive: 0x8c2317,
    shininess: 50,
    wireframe: false,
  });
  mesh = new THREE.Mesh(this.geometry, this.material);
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
