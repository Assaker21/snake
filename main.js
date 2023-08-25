import LevelManager from "./LevelManager.js";
import PerksManager from "./PerksManager.js";

const snake = {
  score: 0,
  body: [
    {
      x: 0,
      y: 0
    }
  ]
};

const DIMENSIONS = 20;
const DELTA_TIME = 100;

var gameisover = false;
var choosingperk = false;
var pause = false;
var timer = Date.now();

var oldSnake = {
  score: 0,
  body: [
    {
      x: 0,
      y: 0
    }
  ]
};

var direction = {
  x: 1,
  y: 0
};

var bounds = {
  x: {
    min: 0,
    max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
  },
  y: {
    min: 0,
    max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
  }
};

snake.body[0].x = (bounds.x.max - bounds.x.min) / 2 + bounds.x.min;
snake.body[0].y = (bounds.y.max - bounds.y.min) / 2 + bounds.y.min;

var food = {
  x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
  y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min)
};

var perksManager = new PerksManager();

var levelManager = new LevelManager();
levelManager.onReachNewLevel = (level) => {
  pause = true;
  choosingperk = true;
  perksManager.display(() => {
    pause = false;
    choosingperk = false;
  });
};
levelManager.update(0);

const canvas = document.querySelector(".canvas");

function MoveSnake() {
  for (var i = snake.body.length - 1; i > 0; i--) {
    snake.body[i] = MoveBlock(snake.body[i], snake.body[i - 1]);
  }

  snake.body[0].x += direction.x;
  snake.body[0].y += direction.y;

  for (var i = 0; i < snake.body.length; i++) {
    if (snake.body[i].x < bounds.x.min) {
      snake.body[i].x = bounds.x.max - (bounds.x.min - snake.body[i].x);
    } else if (snake.body[i].x > bounds.x.max - 1) {
      snake.body[i].x = (snake.body[i].x % bounds.x.max) + bounds.x.min;
    }

    if (snake.body[i].y < bounds.y.min) {
      snake.body[i].y = bounds.y.max - (bounds.y.min - snake.body[i].y);
    } else if (snake.body[i].y > bounds.y.max - 1) {
      snake.body[i].y = (snake.body[i].y % bounds.y.max) + bounds.y.min;
    }
  }
}

function CheckCollisions() {
  if (CheckCollisionWith(snake.body[0], food)) {
    OnTakeFood();
  }

  for (var i = 1; i < snake.body.length; i++) {
    if (CheckCollisionWith(snake.body[0], snake.body[i])) {
      OnLose();
    }
  }
}

function CheckCollisionWith(i, j) {
  return Math.abs(i.x - j.x) < 1 && Math.abs(i.y - j.y) < 1;
}

function MoveBlock(currentBlock, previousBlock) {
  currentBlock.x = previousBlock.x;
  currentBlock.y = previousBlock.y;
  return currentBlock;
}

function OnTakeFood() {
  food = {
    x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
    y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min)
  };

  var pos1 = snake.body[snake.body.length - 1];
  var pos2 = snake.body.length > 1 ? snake.body[snake.body.length - 2] : { x: pos1.x + 1, y: pos1.y };
  snake.body.push({
    x: (pos1.x - pos2.x) * 1 + pos1.x,
    y: (pos1.y - pos2.y) * 1 + pos1.y
  });

  snake.score++;

  levelManager.update(snake.score);
}

function UpdateVisualsInterpolated(interpolation) {
  const score = document.querySelector(".score");
  score.innerHTML = FormatNumber(Lerp(oldSnake.score * 100, snake.score * 100, interpolation));

  const _food = canvas.querySelector(".food");
  _food.style.top = `${food.y * DIMENSIONS}px`;
  _food.style.left = `${food.x * DIMENSIONS}px`;
  _food.style.width = `${DIMENSIONS}px`;
  _food.style.height = `${DIMENSIONS}px`;

  const blocks = canvas.querySelectorAll(".block");
  const blockTemp = canvas.querySelector(".block-temp");
  blockTemp.style.width = `${DIMENSIONS}px`;
  blockTemp.style.height = `${DIMENSIONS}px`;

  if (interpolation == 1) blockTemp.classList.remove("active");

  if (blocks.length < snake.body.length) {
    const lastSegment = snake.body[snake.body.length - 1];
    canvas.innerHTML += `<div style="width: ${DIMENSIONS}px; height: ${DIMENSIONS}px; top:${lastSegment.y * DIMENSIONS}px; left:${lastSegment.x * DIMENSIONS}px" class="block"></div>\n`;
  }

  blocks[0].style.width = `${DIMENSIONS}px`;
  blocks[0].style.height = `${DIMENSIONS}px`;

  var sideScrolled = false;
  for (var i = 0; i < oldSnake.body.length; i++) {
    if (Math.abs(oldSnake.body[i].x - snake.body[i].x) > 1.1) {
      var targetPos = oldSnake.body[i].x - Math.sign(snake.body[i].x - oldSnake.body[i].x);
      var startPos = snake.body[i].x + Math.sign(snake.body[i].x - oldSnake.body[i].x);

      blocks[i].style.top = `${snake.body[i].y * DIMENSIONS}px`;
      blocks[i].style.left = `${Lerp(oldSnake.body[i].x * DIMENSIONS, targetPos * DIMENSIONS, interpolation)}px`;

      blockTemp.style.top = `${snake.body[i].y * DIMENSIONS}px`;
      blockTemp.style.left = `${Lerp(startPos * DIMENSIONS, snake.body[i].x * DIMENSIONS, interpolation)}px`;
      blockTemp.classList.add("active");

      sideScrolled = true;
    } else if (Math.abs(oldSnake.body[i].y - snake.body[i].y) > 1.1) {
      var targetPos = oldSnake.body[i].y - Math.sign(snake.body[i].y - oldSnake.body[i].y);
      var startPos = snake.body[i].y + Math.sign(snake.body[i].y - oldSnake.body[i].y);

      blocks[i].style.top = `${Lerp(oldSnake.body[i].y * DIMENSIONS, targetPos * DIMENSIONS, interpolation)}px`;
      blocks[i].style.left = `${snake.body[i].x * DIMENSIONS}px`;

      blockTemp.style.top = `${Lerp(startPos * DIMENSIONS, snake.body[i].y * DIMENSIONS, interpolation)}px`;
      blockTemp.style.left = `${snake.body[i].x * DIMENSIONS}px`;
      blockTemp.classList.add("active");

      sideScrolled = true;
    } else {
      blocks[i].style.top = `${Lerp(oldSnake.body[i].y * DIMENSIONS, snake.body[i].y * DIMENSIONS, interpolation)}px`;
      blocks[i].style.left = `${Lerp(oldSnake.body[i].x * DIMENSIONS, snake.body[i].x * DIMENSIONS, interpolation)}px`;
    }

    if (!sideScrolled) blockTemp.classList.remove("active");
  }
}

function FormatNumber(num) {
  /*if (num >= 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }*/
  return num.toString().padStart(8, "0");
}

function Lerp(start, end, percentage) {
  return start + (end - start) * percentage;
}

function OnLose() {
  pause = true;
  gameisover = true;
  const gameover = document.querySelector(".gameover");
  gameover.classList.add("active");

  gameover.querySelector(".gameover-score").innerHTML = `${snake.score * 100} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"></path></svg>`;
  gameover.querySelector(".gameover-button").addEventListener("click", () => {
    gameisover = false;

    food = {
      x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
      y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min)
    };

    snake.score = 0;
    snake.body = [
      {
        x: (bounds.x.max - bounds.x.min) / 2 + bounds.x.min,
        y: (bounds.y.max - bounds.y.min) / 2 + bounds.y.min
      }
    ];

    oldSnake.score = 0;
    oldSnake.body = [
      {
        x: (bounds.x.max - bounds.x.min) / 2 + bounds.x.min,
        y: (bounds.y.max - bounds.y.min) / 2 + bounds.y.min
      }
    ];

    const canvas = document.querySelector(".canvas");
    canvas.querySelectorAll(".block").forEach((e) => {
      e.remove();
    });
    canvas.innerHTML += `<div class="block"></div>`;

    pause = false;

    perksManager = new PerksManager();
    levelManager = new LevelManager();
    levelManager.onReachNewLevel = () => {
      pause = true;
      choosingperk = true;
      perksManager.display(() => {
        pause = false;
        choosingperk = false;
      });
    };
    levelManager.update(0);

    gameover.classList.remove("active");
  });
}

function TogglePause() {
  pause = !pause;

  if (pause) document.querySelector(".paused").classList.add("active");
  else document.querySelector(".paused").classList.remove("active");
}

document.addEventListener(
  "keydown",
  (event) => {
    if (gameisover || choosingperk) return;

    var name = event.key;

    if (name == "p" || name == "P") {
      TogglePause();
    }

    if (pause) return;

    if ((name == "w" || name == "W") && (snake.body.length <= 1 || snake.body[1].y - snake.body[0].y != -1)) {
      direction.x = 0;
      direction.y = -1;
    } else if ((name == "a" || name == "A") && (snake.body.length <= 1 || snake.body[1].x - snake.body[0].x != -1)) {
      direction.x = -1;
      direction.y = 0;
    } else if ((name == "d" || name == "D") && (snake.body.length <= 1 || snake.body[1].x - snake.body[0].x != 1)) {
      direction.x = 1;
      direction.y = 0;
    } else if ((name == "s" || name == "S") && (snake.body.length <= 1 || snake.body[1].y - snake.body[0].y != 1)) {
      direction.x = 0;
      direction.y = 1;
    }
  },
  false
);

function update() {
  if (Date.now() - timer < DELTA_TIME) {
    UpdateVisualsInterpolated((Date.now() - timer) / DELTA_TIME);
    requestAnimationFrame(update);
    return;
  }

  UpdateVisualsInterpolated(1);

  if (pause) {
    requestAnimationFrame(update);
    return;
  }

  timer = Date.now();

  oldSnake.score = snake.score;
  oldSnake.body = [];
  for (var i = 0; i < snake.body.length; i++) {
    oldSnake.body.push({
      x: snake.body[i].x,
      y: snake.body[i].y
    });
  }

  MoveSnake();

  CheckCollisions();

  requestAnimationFrame(update);
}

update();
