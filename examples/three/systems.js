function mover(world) {
  const components = fimbrethil.Archetype.create(Transform, Velocity);
  return (dt) => {
    world.query((transform, velocity) => {
      transform.position.x += velocity.position.x * dt;
      transform.position.y += velocity.position.y * dt;
      transform.position.z += velocity.position.z * dt;

      transform.rotation.x += velocity.rotation.x * dt;
      transform.rotation.y += velocity.rotation.y * dt;
      transform.rotation.z += velocity.rotation.z * dt;
    }, components);
  }
}
function render(world) {
  const components = fimbrethil.Archetype.create(Transform, Mesh);
  const lights = fimbrethil.Archetype.create(Transform, Light);
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  const cameraComponents = fimbrethil.Archetype.create(Camera, Transform);
  return (dt) => {
    // find the camera.
    let cameraInstance;
    world.query((camera, transform) => {
      if (camera.active) {
        Object.assign(camera.perspective.position, transform.position);

        cameraInstance = camera;
      }
    }, cameraComponents);
    if (!cameraInstance) {
      return;
    }
    world.query((transform, { mesh }) => {
      Object.assign(mesh.position, transform.position);
      Object.assign(mesh.rotation, transform.rotation);
      scene.add(mesh);
    }, components);
    world.query((transform, light) => {
      Object.assign(light.instance.position, transform.position);
      scene.add(light.instance);
    }, lights)
    renderer.render(scene, cameraInstance.perspective);
  }
}