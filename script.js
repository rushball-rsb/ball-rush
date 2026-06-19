
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;

/* ELEMENTS */

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const menuBestEl = document.getElementById("menuBest");

const finalScoreEl = document.getElementById("finalScore");
const finalBestEl = document.getElementById("finalBest");

const gameOverBox = document.getElementById("gameOver");

/* RECORD */

let bestScore =
Number(
localStorage.getItem("ballRushBest")
) || 0;

bestEl.textContent = bestScore;
menuBestEl.textContent = bestScore;

/* GAME */

let score = 0;

let animationId = null;

let gameStarted = false;
let isGameOver = false;

/* THEMES
CHANGE EVERY 3 POINTS
*/

const themes = [

{
accent:"#00d4ff",
bg1:"#0f172a",
bg2:"#020617",
bg3:"#111827"
},

{
accent:"#ffd700",
bg1:"#2a2400",
bg2:"#151000",
bg3:"#080600"
},

{
accent:"#00ff88",
bg1:"#032615",
bg2:"#01140a",
bg3:"#000b05"
},

{
accent:"#ff4444",
bg1:"#2a0909",
bg2:"#160404",
bg3:"#080202"
},

{
accent:"#ffffff",
bg1:"#202020",
bg2:"#111111",
bg3:"#080808"
},

{
accent:"#b266ff",
bg1:"#1c0f2f",
bg2:"#10081b",
bg3:"#07040d"
}

];

/* PLAYER */

const paddle = {

x:430,
y:650,

width:140,
height:16,

speed:10

};

/* BALL */

const ball = {

x:500,
y:250,

radius:12,

dx:5,
dy:5

};

/* PARTICLES */

let particles = [];

//* CONTROLS */

let left = false;
let right = false;

let touchLeft = false;
let touchRight = false;

/* KEYBOARD */

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        left = true;
    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        right = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        left = false;
    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        right = false;
    }
});

/* TOUCH CONTROLS (MOBILE) */

document.addEventListener("touchstart", (e) => {
    const x = e.touches[0].clientX;

    if (x < window.innerWidth / 2) {
        touchLeft = true;
        touchRight = false;
    } else {
        touchRight = true;
        touchLeft = false;
    }
});

document.addEventListener("touchmove", (e) => {
    const x = e.touches[0].clientX;

    if (x < window.innerWidth / 2) {
        touchLeft = true;
        touchRight = false;
    } else {
        touchRight = true;
        touchLeft = false;
    }
});

document.addEventListener("touchend", () => {
    touchLeft = false;
    touchRight = false;
});

/* START */

startBtn.addEventListener("click",()=>{

menu.style.display = "none";

gameStarted = true;

loop();

});

/* THEME */

function updateTheme(){

const index =
Math.floor(score / 3)
%
themes.length;

const theme = themes[index];

document.documentElement.style.setProperty(
"--accent",
theme.accent
);

document.documentElement.style.setProperty(
"--bg1",
theme.bg1
);

document.documentElement.style.setProperty(
"--bg2",
theme.bg2
);

document.documentElement.style.setProperty(
"--bg3",
theme.bg3
);

}

/* PARTICLES */

function createParticle(){

particles.push({

x:ball.x,
y:ball.y,

radius:ball.radius * 0.45,

life:18

});

}

function drawParticles(){

for(let i=0;i<particles.length;i++){

const p = particles[i];

ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.radius,
0,
Math.PI * 2
);

ctx.fillStyle =
`rgba(255,255,255,${
p.life / 18
})`;

ctx.fill();

p.life--;

p.radius *= 0.95;

}

particles =
particles.filter(
p => p.life > 0
);

}

/* BALL */

function drawBall(){

ctx.save();

ctx.shadowBlur = 25;

ctx.shadowColor =
getComputedStyle(
document.documentElement
).getPropertyValue("--accent");

const gradient =
ctx.createRadialGradient(
ball.x,
ball.y,
2,
ball.x,
ball.y,
ball.radius
);

gradient.addColorStop(
0,
"#ffffff"
);

gradient.addColorStop(
1,
getComputedStyle(
document.documentElement
).getPropertyValue("--accent")
);

ctx.fillStyle = gradient;

ctx.beginPath();

ctx.arc(
ball.x,
ball.y,
ball.radius,
0,
Math.PI * 2
);

ctx.fill();

ctx.restore();

}

/* PADDLE */

function drawPaddle(){

ctx.save();

ctx.shadowBlur = 25;

ctx.shadowColor =
getComputedStyle(
document.documentElement
).getPropertyValue("--accent");

ctx.fillStyle =
getComputedStyle(
document.documentElement
).getPropertyValue("--accent");

ctx.fillRect(
paddle.x,
paddle.y,
paddle.width,
paddle.height
);

ctx.restore();

}

/* UPDATE */

function update(){

if(isGameOver) return;

if (left || touchLeft)
    paddle.x -= paddle.speed;

if (right || touchRight)
    paddle.x += paddle.speed;

if(paddle.x < 0)
paddle.x = 0;

if(
paddle.x + paddle.width >
canvas.width
){
paddle.x =
canvas.width -
paddle.width;
}

ball.x += ball.dx;
ball.y += ball.dy;

createParticle();

/* WALLS */

if(
ball.x - ball.radius < 0 ||
ball.x + ball.radius > canvas.width
){
ball.dx *= -1;
}

if(
ball.y - ball.radius < 0
){
ball.dy *= -1;
}

/* PADDLE HIT */

if(

ball.y + ball.radius >= paddle.y &&

ball.x >= paddle.x &&

ball.x <= paddle.x + paddle.width &&

ball.dy > 0

){

ball.dy *= -1;

/* HAPTIC FEEDBACK */
if (navigator.vibrate) {
    navigator.vibrate(30);
}

/* SMART BOUNCE */

const hitPoint =
(ball.x - paddle.x)
/
paddle.width;

ball.dx =
(hitPoint - 0.5) * 12;

score++;

scoreEl.textContent =
score;

ball.dx *= 1.09;
ball.dy *= 1.09;

updateTheme();

}


/* GAME OVER */

if(
ball.y - ball.radius >
canvas.height
){

gameOver();

}

}

/* DRAW */

function draw(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawParticles();

drawBall();

drawPaddle();

}

/* LOOP */

function loop(){

if(isGameOver) return;

update();

draw();

animationId =
requestAnimationFrame(loop);

}

/* GAME OVER */

function gameOver(){

if(isGameOver) return;

isGameOver = true;

cancelAnimationFrame(
animationId
);

if(score > bestScore){

bestScore = score;

localStorage.setItem(
"ballRushBest",
bestScore
);

}

bestEl.textContent =
bestScore;

menuBestEl.textContent =
bestScore;

finalScoreEl.textContent =
score;

finalBestEl.textContent =
bestScore;

gameOverBox.style.display =
"flex";

}

/* RESTART */

function restartGame(){

location.reload();

}

/* INIT */

updateTheme();
