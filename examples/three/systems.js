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
function transformUpdateSystem(world) {
  const components = fimbrethil.Archetype.create(Transform, Mesh);
  return () => {
    world.query((transform, mesh) => {
      mesh.mesh.position.copy(transform.position);
      mesh.mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    }, components);
  }
}
function render(world) {
  const componentsScene = fimbrethil.Archetype.create(Scene);
  const renderer = new THREE.WebGLRenderer();
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  const cameraComponents = fimbrethil.Archetype.create(Camera, Transform);
  return (dt) => {
    // find the camera.
    let cameraInstance;
    let sceneInstance;
    world.query((scene) => {
      sceneInstance = scene.value;
    }, componentsScene);
    world.query((camera, transform) => {
      if (camera.active) {
        camera.perspective.position.copy(transform.position);
        cameraInstance = camera;
      }
    }, cameraComponents);
    if (!cameraInstance) {
      return;
    }
    renderer.render(sceneInstance, cameraInstance.perspective);
  }
}