const scene = document.querySelector('a-scene');
const obstacleRoot = document.getElementById('obstacles');
const starsRoot = document.getElementById('stars');
const laneMarkersRoot = document.getElementById('laneMarkers');
const playerRig = document.getElementById('playerRig');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startButton = document.getElementById('startButton');
const hitSound = document.getElementById('hitSound');

const lanes = [-1.8, 0, 1.8];
const state = {
  running: false,
  score: 0,
  best: Number(localStorage.getItem('sky-runner-best') || 0),
  speed: 8,
  spawnTimer: 0,
  spawnEvery: 1.25,
  moveLeft: false,
  moveRight: false,
  lateralVelocity: 0,
  lastTime: 0,
  obstacles: [],
};

bestEl.textContent = String(state.best);

function seedEnvironment() {
  for (let i = 0; i < 90; i += 1) {
    const star = document.createElement('a-sphere');
    star.setAttribute('radius', (Math.random() * 0.04 + 0.015).toFixed(3));
    star.setAttribute('color', i % 3 === 0 ? '#7df9ff' : '#ffffff');
    star.setAttribute('emissive', i % 3 === 0 ? '#7df9ff' : '#cfd8ff');
    star.setAttribute('position', `${(Math.random() - 0.5) * 45} ${Math.random() * 16 + 2} ${-Math.random() * 120}`);
    starsRoot.appendChild(star);
  }

  for (let z = 0; z > -120; z -= 6) {
    lanes.forEach((lane) => {
      const marker = document.createElement('a-box');
      marker.setAttribute('width', 0.08);
      marker.setAttribute('height', 0.02);
      marker.setAttribute('depth', 2.3);
      marker.setAttribute('color', '#46b3ff');
      marker.setAttribute('emissive', '#46b3ff');
      marker.setAttribute('position', `${lane} 0.01 ${z}`);
      laneMarkersRoot.appendChild(marker);
    });
  }
}

function resetGame() {
  state.running = true;
  state.score = 0;
  state.speed = 8;
  state.spawnTimer = 0;
  state.spawnEvery = 1.25;
  state.obstacles.forEach((obstacle) => obstacle.remove());
  state.obstacles = [];
  scoreEl.textContent = '0';
  playerRig.object3D.position.set(0, 1.6, 4);
}

function spawnObstacle() {
  const safeLane = Math.floor(Math.random() * lanes.length);

  lanes.forEach((lane, index) => {
    if (index === safeLane) return;

    const obstacle = document.createElement('a-box');
    obstacle.dataset.hit = 'false';
    obstacle.setAttribute('width', 1.1);
    obstacle.setAttribute('height', 2.7);
    obstacle.setAttribute('depth', 1.2);
    obstacle.setAttribute('color', '#ff4d6d');
    obstacle.setAttribute('emissive', '#ff4d6d');
    obstacle.setAttribute('position', `${lane} 1.4 -45`);
    obstacleRoot.appendChild(obstacle);
    state.obstacles.push(obstacle);
  });
}

function endGame() {
  state.running = false;
  hitSound.currentTime = 0;
  hitSound.play().catch(() => {});
  state.best = Math.max(state.best, state.score);
  localStorage.setItem('sky-runner-best', String(state.best));
  bestEl.textContent = String(state.best);
}

function updatePlayer(delta) {
  const direction = (state.moveRight ? 1 : 0) - (state.moveLeft ? 1 : 0);
  const targetVelocity = direction * 5;
  state.lateralVelocity += (targetVelocity - state.lateralVelocity) * Math.min(delta * 8, 1);
  const nextX = playerRig.object3D.position.x + state.lateralVelocity * delta;
  playerRig.object3D.position.x = THREE.MathUtils.clamp(nextX, -2, 2);
}

function updateObstacles(delta) {
  const playerPosition = playerRig.object3D.position;

  state.obstacles = state.obstacles.filter((obstacle) => {
    obstacle.object3D.position.z += state.speed * delta;

    if (obstacle.object3D.position.z > 8) {
      obstacle.remove();
      state.score += 1;
      scoreEl.textContent = String(state.score);
      state.speed = Math.min(16, 8 + state.score * 0.12);
      state.spawnEvery = Math.max(0.55, 1.25 - state.score * 0.012);
      return false;
    }

    const closeX = Math.abs(obstacle.object3D.position.x - playerPosition.x) < 0.7;
    const closeZ = Math.abs(obstacle.object3D.position.z - playerPosition.z) < 0.9;

    if (state.running && closeX && closeZ && obstacle.dataset.hit === 'false') {
      obstacle.dataset.hit = 'true';
      endGame();
    }

    return true;
  });
}

function tick(time) {
  if (!state.lastTime) {
    state.lastTime = time;
  }

  const delta = Math.min((time - state.lastTime) / 1000, 0.1);
  state.lastTime = time;

  updatePlayer(delta);

  if (state.running) {
    state.spawnTimer += delta;
    if (state.spawnTimer >= state.spawnEvery) {
      state.spawnTimer = 0;
      spawnObstacle();
    }
    updateObstacles(delta);
  }

  requestAnimationFrame(tick);
}

function handleKey(event, pressed) {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    state.moveLeft = pressed;
  }
  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    state.moveRight = pressed;
  }
}

window.addEventListener('keydown', (event) => handleKey(event, true));
window.addEventListener('keyup', (event) => handleKey(event, false));
startButton.addEventListener('click', resetGame);
scene.addEventListener('loaded', () => {
  seedEnvironment();
  resetGame();
  requestAnimationFrame(tick);
});
