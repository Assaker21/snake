const snake = {
  score: 0,
  body: [
    {
      x: 0,
      y: 0
    }
  ]
};

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
    max: Math.floor(document.querySelector(".canvas").clientWidth / 20)
  },
  y: {
    min: 0,
    max: Math.floor(document.querySelector(".canvas").clientWidth / 20)
  }
};

snake.body[0].x = (bounds.x.max - bounds.x.min) / 2 + bounds.x.min;
snake.body[0].y = (bounds.y.max - bounds.y.min) / 2 + bounds.y.min;

var food = {
  x: Math.floor(Math.random() * (bounds.x.max - bounds.x.min) + bounds.x.min),
  y: Math.floor(Math.random() * (bounds.y.max - bounds.y.min) + bounds.y.min)
};

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
}

function UpdateVisualsInterpolated(interpolation) {
  const score = canvas.querySelector(".score");
  score.innerHTML = FormatNumber(Lerp(oldSnake.score * 100, snake.score * 100, interpolation));

  const _food = canvas.querySelector(".food");
  _food.style.top = `${food.y * 20}px`;
  _food.style.left = `${food.x * 20}px`;

  const blocks = canvas.querySelectorAll(".block");

  if (blocks.length < snake.body.length) {
    const lastSegment = snake.body[snake.body.length - 1];
    canvas.innerHTML += `<div style="top:${lastSegment.y * 20}px; left:${lastSegment.x * 20}px" class="block"></div>\n`;
  }

  for (var i = 0; i < oldSnake.body.length; i++) {
    if (Math.abs(oldSnake.body[i].x - snake.body[i].x) > 1.1 || Math.abs(oldSnake.body[i].y - snake.body[i].y) > 1.1) {
      blocks[i].style.top = `${snake.body[i].y * 20}px`;
      blocks[i].style.left = `${snake.body[i].x * 20}px`;
    } else {
      blocks[i].style.top = `${Lerp(oldSnake.body[i].y * 20, snake.body[i].y * 20, interpolation)}px`;
      blocks[i].style.left = `${Lerp(oldSnake.body[i].x * 20, snake.body[i].x * 20, interpolation)}px`;
    }
  }
}

function FormatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function Lerp(start, end, percentage) {
  return start + (end - start) * percentage;
}

var gameisover = false;

function OnLose() {
  pause = true;
  gameisover = true;
  const gameover = document.querySelector(".gameover");
  gameover.classList.add("active");

  gameover.querySelector(".gameover-score").innerHTML = `${FormatNumber(snake.score)} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"></path></svg>`;
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
    gameover.classList.remove("active");
  });
}

var pause = false;

function TogglePause() {
  pause = !pause;

  if (pause) document.querySelector(".paused").classList.add("active");
  else document.querySelector(".paused").classList.remove("active");
}

document.addEventListener(
  "keydown",
  (event) => {
    if (gameisover) return;

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

var timer = Date.now();

function update() {
  if (Date.now() - timer < 100) {
    UpdateVisualsInterpolated((Date.now() - timer) / 100);
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
