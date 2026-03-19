const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const game = {
  width: canvas.width,
  height: canvas.height,
  score: 0,
  lives: 3,
  gameOver: false,
  elapsed: 0,
  enemyTimer: 0,
  stars: [],
};

const input = {
  left: false,
  right: false,
  shoot: false,
};

const player = {
  x: game.width / 2,
  y: game.height - 72,
  w: 42,
  h: 28,
  speed: 300,
  fireCooldown: 0,
  fireDelay: 0.17,
};

const bullets = [];
const enemies = [];

for (let i = 0; i < 90; i += 1) {
  game.stars.push({
    x: Math.random() * game.width,
    y: Math.random() * game.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 24 + 10,
  });
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const rectHit = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function resetGame() {
  game.score = 0;
  game.lives = 3;
  game.gameOver = false;
  game.elapsed = 0;
  game.enemyTimer = 0;

  bullets.length = 0;
  enemies.length = 0;

  player.x = game.width / 2;
  player.y = game.height - 72;
  player.fireCooldown = 0;
}

function spawnEnemy() {
  const w = 34;
  const h = 30;
  enemies.push({
    x: Math.random() * (game.width - w),
    y: -h,
    w,
    h,
    speed: Math.random() * 55 + 80,
  });
}

function shoot() {
  bullets.push({
    x: player.x + player.w / 2 - 3,
    y: player.y - 10,
    w: 6,
    h: 14,
    speed: 460,
  });
}

function updateStars(dt) {
  for (const star of game.stars) {
    star.y += star.speed * dt;
    if (star.y > game.height) {
      star.y = -4;
      star.x = Math.random() * game.width;
    }
  }
}

function update(dt) {
  if (game.gameOver) {
    return;
  }

  game.elapsed += dt;
  game.enemyTimer -= dt;
  player.fireCooldown -= dt;

  if (input.left) {
    player.x -= player.speed * dt;
  }
  if (input.right) {
    player.x += player.speed * dt;
  }

  player.x = clamp(player.x, 0, game.width - player.w);

  if (input.shoot && player.fireCooldown <= 0) {
    shoot();
    player.fireCooldown = player.fireDelay;
  }

  const spawnInterval = Math.max(0.25, 1.1 - Math.floor(game.elapsed / 8) * 0.08);
  if (game.enemyTimer <= 0) {
    spawnEnemy();
    game.enemyTimer = spawnInterval;
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const b = bullets[i];
    b.y -= b.speed * dt;
    if (b.y + b.h < 0) {
      bullets.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    e.y += e.speed * dt;

    if (e.y > game.height) {
      enemies.splice(i, 1);
      game.lives -= 1;
      if (game.lives <= 0) {
        game.gameOver = true;
      }
      continue;
    }

    if (rectHit(player, e)) {
      game.gameOver = true;
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      const b = bullets[j];
      if (rectHit(b, e)) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        game.score += 100;
        break;
      }
    }
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(player.w / 2, 0);
  ctx.lineTo(player.w, player.h);
  ctx.lineTo(0, player.h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(player.w / 2 - 4, player.h - 10, 8, 10);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = "#e11d48";
  ctx.fillRect(0, 0, enemy.w, enemy.h);
  ctx.fillStyle = "#fda4af";
  ctx.fillRect(5, 6, 8, 8);
  ctx.fillRect(enemy.w - 13, 6, 8, 8);
  ctx.restore();
}

function drawBullet(bullet) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, game.width, game.height);

  for (const star of game.stars) {
    ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawHud() {
  ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
  ctx.fillRect(12, 12, game.width - 24, 36);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 18px 'Noto Sans JP', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`SCORE ${game.score}`, 24, 30);
  ctx.fillText(`LIFE ${game.lives}`, game.width - 108, 30);
}

function drawGameOver() {
  if (!game.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "700 38px 'Zen Dots', sans-serif";
  ctx.fillText("GAME OVER", game.width / 2, game.height / 2 - 16);

  ctx.font = "700 20px 'Noto Sans JP', sans-serif";
  ctx.fillText(`SCORE ${game.score}`, game.width / 2, game.height / 2 + 24);
  ctx.font = "400 16px 'Noto Sans JP', sans-serif";
  ctx.fillText("Rキーでリスタート", game.width / 2, game.height / 2 + 54);
  ctx.textAlign = "left";
}

function draw() {
  drawBackground();
  drawPlayer();
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
  drawHud();
  drawGameOver();
}

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  updateStars(dt);
  update(dt);
  draw();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    input.left = true;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    input.right = true;
  }
  if (event.code === "Space") {
    input.shoot = true;
    event.preventDefault();
  }
  if (event.code === "KeyR" && game.gameOver) {
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    input.left = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    input.right = false;
  }
  if (event.code === "Space") {
    input.shoot = false;
  }
});

resetGame();
requestAnimationFrame(loop);
