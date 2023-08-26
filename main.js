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

var DIMENSIONS = 40;
var DELTA_TIME = 200;

var gameisover = false;
var choosingperk = false;
var pause = false;
var timer = Date.now();
var foodsEaten = 0;
var foodValue = 1;
var foodTime = Infinity;

var foodToGrow = 1;

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

var foods = [
  {
    x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
    y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min),
    timer: Date.now()
  }
];

var perksManager = new PerksManager();

perksManager.perks[0].onApply = () => {
  foodToGrow++;
  perksManager.perks[0].description = "You grow once every time you eat " + (foodToGrow + 1).toString() + " foods.";
};

perksManager.perks[1].onApply = () => {
  if (snake.body.length > 1) {
    var amount = Math.floor(snake.body.length * 0.25);
    if (amount < 1) amount = 1;

    snake.body = snake.body.splice(-amount);
    oldSnake.score = snake.score;
    oldSnake.body = [];
    for (var i = 0; i < snake.body.length; i++) {
      oldSnake.body.push({
        x: snake.body[i].x,
        y: snake.body[i].y
      });
    }
  }
};

perksManager.perks[2].onApply = () => {
  foods.push({
    x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
    y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min),
    timer: Date.now()
  });
};

perksManager.perks[3].onApply = () => {
  foodValue *= 2;
  if (foodTime == Infinity) foodTime = 8;
  else if (foodTime == 2) foodTime = 1;
  else foodTime /= 2;

  perksManager.perks[3].description = "Food value doubles x2 but gets removed automatically if not eaten after " + (foodTime <= 2 ? foodTime / 2 : foodTime - 2) + " seconds.";
};

perksManager.perks[4].onApply = () => {
  DELTA_TIME /= 1.2;
};

perksManager.perks[5].onApply = () => {
  const arr = [40, 25, 20, 16, 10, 8];

  DIMENSIONS = arr[arr.indexOf(DIMENSIONS) + 1];

  bounds = {
    x: {
      min: 0,
      max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
    },
    y: {
      min: 0,
      max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
    }
  };

  document.querySelectorAll(".block").forEach((block) => {
    block.style.width = `${DIMENSIONS}px`;
    block.style.height = `${DIMENSIONS}px`;
  });

  document.querySelectorAll(".food").forEach((food) => {
    food.style.width = `${DIMENSIONS}px`;
    food.style.height = `${DIMENSIONS}px`;

    food.querySelector("h3").style.fontSize = `${Math.round(DIMENSIONS * 0.5)}px`;
  });
};

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

document.querySelectorAll(".food").forEach((food) => {
  food.style.width = `${DIMENSIONS}px`;
  food.style.height = `${DIMENSIONS}px`;

  food.querySelector("h3").style.fontSize = `${Math.round(DIMENSIONS * 0.5)}px`;
});

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
  for (var i = 0; i < foods.length; i++) {
    if (CheckCollisionWith(snake.body[0], foods[i])) {
      OnTakeFood(i);
    }
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

function OnTakeFood(i) {
  foods[i] = {
    x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
    y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min),
    timer: Date.now()
  };

  foodsEaten++;
  if (foodsEaten >= foodToGrow) {
    foodsEaten = 0;
    var pos1 = snake.body[snake.body.length - 1];
    var pos2 = snake.body.length > 1 ? snake.body[snake.body.length - 2] : { x: pos1.x + 1, y: pos1.y };
    snake.body.push({
      x: (pos1.x - pos2.x) * 1 + pos1.x,
      y: (pos1.y - pos2.y) * 1 + pos1.y
    });
  }

  snake.score += foodValue;

  levelManager.update(snake.score);
}

function UpdateVisualsInterpolated(interpolation) {
  const score = document.querySelector(".score");
  score.innerHTML = FormatNumber(Math.round(Lerp(oldSnake.score * 100, snake.score * 100, interpolation)));

  var _foods = canvas.querySelectorAll(".food");
  if (_foods.length < foods.length) {
    for (var i = 0; i < foods.length - _foods.length; i++) {
      canvas.innerHTML =
        `<div class="food">
    <h3 class="food-value">100</h3>
  </div>` + canvas.innerHTML;
    }

    _foods = canvas.querySelectorAll(".food");
  }

  for (var i = 0; i < foods.length; i++) {
    _foods[i].style.top = `${foods[i].y * DIMENSIONS}px`;
    _foods[i].style.left = `${foods[i].x * DIMENSIONS}px`;
    _foods[i].style.width = `${DIMENSIONS}px`;
    _foods[i].style.height = `${DIMENSIONS}px`;

    _foods[i].querySelector("h3").innerHTML = foodValue * 100;
    _foods[i].querySelector("h3").style.fontSize = `${Math.round(DIMENSIONS * 0.5)}px`;
  }

  const blocks = canvas.querySelectorAll(".block");
  if (blocks.length > snake.body.length) {
    for (var i = 0; i < blocks.length; i++) {
      if (i > snake.body.length - 1) {
        blocks[i].remove();
      }
    }
  }

  var blockTemps = canvas.querySelectorAll(".block-temp");
  if (blockTemps.length < Math.max(snake.body.length, oldSnake.body.length)) {
    for (var i = 0; i < Math.max(snake.body.length, oldSnake.body.length) - blockTemps.length; i++) {
      canvas.innerHTML = canvas.innerHTML + `<div class="block-temp"></div>`;
    }
  }

  var blockTemps = canvas.querySelectorAll(".block-temp");

  blockTemps.forEach((blockTemp) => {
    blockTemp.style.width = `${DIMENSIONS}px`;
    blockTemp.style.height = `${DIMENSIONS}px`;

    if (interpolation == 1) blockTemp.classList.remove("active");
  });

  //if (interpolation == 1) blockTemp.classList.remove("active");

  if (blocks.length < snake.body.length) {
    const lastSegment = snake.body[snake.body.length - 1];
    canvas.innerHTML += `<div style="width: ${DIMENSIONS}px; height: ${DIMENSIONS}px; top:${lastSegment.y * DIMENSIONS}px; left:${lastSegment.x * DIMENSIONS}px" class="block"></div>\n`;
  }

  blocks[0].style.width = `${DIMENSIONS}px`;
  blocks[0].style.height = `${DIMENSIONS}px`;

  var sideScrolled = false;
  for (var i = 0; i < oldSnake.body.length; i++) {
    var blockTemp = blockTemps[i];
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

    foodValue = 1;
    foodTime = Infinity;

    DELTA_TIME = 200;
    DIMENSIONS = 40;

    foodsEaten = 0;
    foodToGrow = 1;

    bounds = {
      x: {
        min: 0,
        max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
      },
      y: {
        min: 0,
        max: Math.floor(document.querySelector(".canvas").clientWidth / DIMENSIONS)
      }
    };

    document.querySelectorAll(".block").forEach((block) => {
      block.style.width = `${DIMENSIONS}px`;
      block.style.height = `${DIMENSIONS}px`;
    });

    document.querySelectorAll(".food").forEach((food) => {
      food.style.width = `${DIMENSIONS}px`;
      food.style.height = `${DIMENSIONS}px`;
    });

    foods = [
      {
        x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
        y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min),
        timer: Date.now()
      }
    ];

    document.querySelectorAll(".food").forEach((foodie) => foodie.remove());

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

    perksManager.reset();
    levelManager.reset();

    gameover.classList.remove("active");
  });
}

function TogglePause() {
  pause = !pause;

  if (pause) document.querySelector(".paused").classList.add("active");
  else document.querySelector(".paused").classList.remove("active");
}

function CheckOnFood() {
  for (var i = 0; i < foods.length; i++) {
    if (Date.now() - foods[i].timer > foodTime * 1000) {
      foods[i] = {
        x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
        y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min),
        timer: Date.now()
      };
    }
  }
}

document.addEventListener(
  "keydown",
  (event) => {
    if (gameisover || choosingperk) return;

    var name = event.key;
    console.log(name);

    if (name == "p" || name == "P") {
      TogglePause();
    }

    if (pause) return;

    if ((name == "w" || name == "W" || name == "ArrowUp") && (snake.body.length <= 1 || (snake.body[1].y - snake.body[0].y != -1 && direction.y != 1))) {
      direction.x = 0;
      direction.y = -1;
    } else if ((name == "a" || name == "A" || name == "ArrowLeft") && (snake.body.length <= 1 || (snake.body[1].x - snake.body[0].x != -1 && direction.x != 1))) {
      direction.x = -1;
      direction.y = 0;
    } else if ((name == "d" || name == "D" || name == "ArrowRight") && (snake.body.length <= 1 || (snake.body[1].x - snake.body[0].x != 1 && direction.x != -1))) {
      direction.x = 1;
      direction.y = 0;
    } else if ((name == "s" || name == "S" || name == "ArrowDown") && (snake.body.length <= 1 || (snake.body[1].y - snake.body[0].y != 1 && direction.y != -1))) {
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

  CheckOnFood();

  requestAnimationFrame(update);
}

update();
