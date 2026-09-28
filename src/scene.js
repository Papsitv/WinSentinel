import * as THREE from "three";
import { STATUS_BY_ID } from "./scenarios.js";

const BACKGROUND = 0x0c141d;
const CONNECTIONS = [
  {
    start: [-4.5, 2.2, 0.6],
    end: [-1.05, 1.9, 0.56],
    height: 2.7,
    offset: 0.14,
  },
  {
    start: [4.4, 1.0, -0.8],
    end: [1.03, 1.12, -0.45],
    height: 1.55,
    offset: 0.53,
  },
  {
    start: [1.1, 4.0, -2.5],
    end: [0.45, 2.62, -0.1],
    height: 4.3,
    offset: 0.83,
  },
  {
    start: [-2.5, 0.65, -3.4],
    end: [-0.7, 0.72, -0.65],
    height: 1.25,
    offset: 0.36,
  },
  {
    start: [3.7, 3.3, 2.8],
    end: [0.9, 2.2, 0.48],
    height: 3.9,
    offset: 0.69,
  },
];

function makeMaterial(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.45,
    ...extra,
  });
}

function makeTower(scene) {
  const group = new THREE.Group();
  const shellMaterial = makeMaterial(0x1a2734, { roughness: 0.3, metalness: 0.62 });
  const frontMaterial = makeMaterial(0x111b27, { roughness: 0.28, metalness: 0.4 });
  const trimMaterial = makeMaterial(0x314455, { roughness: 0.28, metalness: 0.72 });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x76e4c4,
    emissive: 0x76e4c4,
    emissiveIntensity: 1.6,
    roughness: 0.25,
    metalness: 0.2,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, 2.74, 1.42),
    shellMaterial,
  );
  body.position.y = 1.48;
  body.castShadow = true;
  group.add(body);

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 2.48, 0.07),
    frontMaterial,
  );
  front.position.set(0, 1.48, 0.75);
  group.add(front);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.15, 1.67),
    trimMaterial,
  );
  roof.position.y = 2.91;
  roof.castShadow = true;
  group.add(roof);

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.18, 1.95),
    trimMaterial,
  );
  plinth.position.y = 0.08;
  group.add(plinth);

  for (let index = 0; index < 4; index += 1) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.16, 0.38, 0.055),
      trimMaterial,
    );
    panel.position.set(0, 0.58 + index * 0.56, 0.81);
    group.add(panel);

    const display = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.035, 0.025),
      accentMaterial,
    );
    display.position.set(-0.12, 0.63 + index * 0.56, 0.85);
    group.add(display);

    const indicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      accentMaterial,
    );
    indicator.position.set(0.42, 0.63 + index * 0.56, 0.86);
    group.add(indicator);
  }

  const sideLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 2.1, 0.025),
    accentMaterial,
  );
  sideLight.position.set(-0.82, 1.55, 0.76);
  group.add(sideLight);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8),
    trimMaterial,
  );
  antenna.position.set(0.67, 3.23, 0.35);
  group.add(antenna);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 14, 14),
    accentMaterial,
  );
  beacon.position.set(0.67, 3.53, 0.35);
  group.add(beacon);

  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.018, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x76e4c4, transparent: true, opacity: 0.58 }),
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.02;
  scene.add(baseRing);

  group.position.y = 0.04;
  scene.add(group);

  return { group, accentMaterial, baseRing };
}

function makeConnection(scene, pathSpec, statusColor) {
  const start = new THREE.Vector3(...pathSpec.start);
  const end = new THREE.Vector3(...pathSpec.end);
  const middle = new THREE.Vector3(
    (start.x + end.x) / 2,
    pathSpec.height,
    (start.z + end.z) / 2,
  );
  const curve = new THREE.CatmullRomCurve3([start, middle, end]);
  const points = curve.getPoints(42);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: statusColor,
    transparent: true,
    opacity: 0.42,
  });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const endpoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 12),
    new THREE.MeshBasicMaterial({ color: statusColor }),
  );
  endpoint.position.copy(start);
  scene.add(endpoint);

  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 10),
    new THREE.MeshBasicMaterial({ color: statusColor }),
  );
  scene.add(particle);

  return {
    curve,
    line,
    endpoint,
    particle,
    offset: pathSpec.offset,
  };
}

function makeBackdrop(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({
      color: 0x0d1721,
      roughness: 0.9,
      metalness: 0.12,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.04;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(24, 36, 0x273947, 0x1a2936);
  grid.position.y = -0.025;
  grid.material.transparent = true;
  grid.material.opacity = 0.44;
  scene.add(grid);

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let index = 0; index < 150; index += 1) {
    starPositions.push(
      (Math.random() - 0.5) * 22,
      1.5 + Math.random() * 9,
      (Math.random() - 0.5) * 18,
    );
  }
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0x8badbf,
      size: 0.025,
      transparent: true,
      opacity: 0.48,
      sizeAttenuation: true,
    }),
  );
  scene.add(stars);
}

export function createSecurityScene(canvas, viewport, onUnavailable = () => {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
  } catch {
    onUnavailable();
    return { setVerdict() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.FogExp2(BACKGROUND, 0.027);

  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  camera.position.set(7.2, 6.4, 10.8);
  camera.lookAt(0, 1.6, 0);

  scene.add(new THREE.HemisphereLight(0x9dc5dc, 0x101820, 2.0));
  const keyLight = new THREE.DirectionalLight(0xd7edff, 3.2);
  keyLight.position.set(5, 9, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x3e92a7, 18, 18, 2);
  rimLight.position.set(-4, 3.5, -3);
  scene.add(rimLight);

  makeBackdrop(scene);
  const tower = makeTower(scene);
  const connections = CONNECTIONS.map((spec) =>
    makeConnection(scene, spec, new THREE.Color(0x76e4c4)),
  );

  let activeColor = new THREE.Color(0x76e4c4);
  let activePriority = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clock = new THREE.Clock();

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();

  function setVerdict(status) {
    activeColor.set(status.color);
    activePriority = status.priority;
    tower.baseRing.material.color.copy(activeColor);
    tower.accentMaterial.color.copy(activeColor);
    tower.accentMaterial.emissive.copy(activeColor);
    tower.baseRing.material.opacity = status.priority === 0 ? 0.42 : 0.78;

    connections.forEach((connection, index) => {
      const trafficColor =
        status.priority === 0 && index % 2 === 1
          ? new THREE.Color(0x5a8e9c)
          : activeColor;
      connection.line.material.color.copy(trafficColor);
      connection.particle.material.color.copy(trafficColor);
      connection.endpoint.material.color.copy(trafficColor);
      connection.line.material.opacity =
        status.priority === 0 ? 0.23 : 0.35 + status.priority * 0.055;
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const pace = reducedMotion.matches ? 0 : 0.13 + activePriority * 0.055;

    if (!reducedMotion.matches) {
      tower.group.rotation.y = Math.sin(elapsed * 0.16) * 0.045;
      tower.group.position.y = 0.04 + Math.sin(elapsed * 0.85) * 0.035;
      tower.baseRing.rotation.z = elapsed * 0.055;
      tower.accentMaterial.emissiveIntensity =
        1.25 + (Math.sin(elapsed * (1.1 + activePriority * 0.15)) + 1) * 0.35;
    }

    connections.forEach((connection) => {
      const progress = (elapsed * pace + connection.offset) % 1;
      connection.particle.position.copy(connection.curve.getPoint(progress));
    });

    renderer.render(scene, camera);
  }

  setVerdict(STATUS_BY_ID.safe);
  animate();

  return { setVerdict };
}
