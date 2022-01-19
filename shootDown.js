var canvas=document.getElementById('canvas');
var context=canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var collisionCanvas=document.getElementById('collisionCanvas');
var collisionContext=collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

var body = document.querySelector('body');

let score = 0 ;
let death = 0 ;
let maxLives = 3;
let gameover = false;
context.font='30px Staatliches';


// 接連下一個出現的時間
let timeToNextTarget = 0 ;
let targetInterval = 1000 ;
let lastTime = 0 ;
let targets = [];

var wdth = window.innerWidth;

class Target {
    constructor(){
        this.originWidth = 220 ;
        this.originHeight = 250 ;
        // 隨機產生不同大小的物件
        this.sizeModifier = Math.random() * 0.8 + 0.5 ;
        this.width = this.originWidth * this.sizeModifier;
        this.height = this.originHeight * this.sizeModifier;
        // 從最右邊開始出現
        this.x = canvas.width;
        // 扣掉高度避免出現卡一半的狀況
        this.y = Math.random() * (canvas.height - this.height) ;
        // 行動端速度比較慢
        if( wdth <= 500){
            this.directionX = Math.random() * 5 + 8 ;
        }else{
            this.directionX = Math.random() * 5 + 10 ;
        }
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        // 載入圖片
        this.image = new Image();
        this.image.src = 'img/strongdog.png';
        // 為每個物件加入隨機顏色框
        this.randomColors = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255)];
        this.color = 'rgb('+ this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] +')';
    }
    update(){
        this.x -= this.directionX;
        this.y -= this.directionY;
        // 超出畫面後刪除
        if( this.x < 0 - this.width) this.markedForDeletion = true;

        // 若碰到上下邊緣會反彈
        if( this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = -this.directionY;
        }
        //噴尾
        particles.push( new Particle(this.x , this.y , this.width ,  'hsla('  +  hue  +  ', 100% , 50% , 0.8 )'));
        // 若超出畫面五次就會死亡
        if ( this.x < 0 - this.width){
            death++ ;
            console.log(death);
            if(death >= maxLives) gameover = true;
        }
    }
    draw(){
        // 在collisionContext創建不同顏色的辨識顏色格
        collisionContext.fillStyle = this.color;
        collisionContext.fillRect(this.x ,this.y , this.width , this.height);
        // 在原本的context創建物件圖片
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x , y , size){
        // 載入被點擊時的圖片
        this.hit = new Image();
        this.hit.src = 'img/weakdog.png';
        this.size = size ;
        this.x = x;
        this.y = y;
        // frame
        this.frame = 0;
        // audio
        this.sound = new Audio();
        this.sound.src ='dogcry.mp3';
        // if delete or not
        this.markedForDeletion = false;
    }
    update(){
        if( this.frame == 0 ) this.sound.play();
        this.frame++;
        if( this.frame > 6) this.markedForDeletion = true;
    }
    draw(){
        context.drawImage(this.hit, this.x, this.y, this.size , this.size);
    }
}

let particles =[];
let hue = 0;
class Particle{
    constructor( x, y, size , color){
        this.size = size;
        this.x = x + this.size ;
        this.y = y + this.size / 2;
        this.radius = Math.random() * this.size / 5;
        this.maxRadius = Math.random() * 20  ;
        this.markedForDeletion = false;
        this.speedX = Math.random()* 1 + 0.5;
        this.color = color;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.5;
        if( this.radius > this.maxRadius ) this.markedForDeletion = true;
        hue++ ;
    }
    draw(){
        context.save();
        // 閃爍
        // context.globalAlpha= 1 - this.radius / this.maxRadius;
        context.beginPath();
        context.fillStyle = this.color ;
        context.arc( this.x , this.y , this.radius, 0 ,Math.PI*2 );
        context.fill();

        context.restore();
    }
}

function drawScore(){
    context.fillStyle='white';
    context.fillText( 'Score：' + score , 50, 70);
    context.fillText( 'Life：' + (maxLives - death) , 50, 110);
}
let box = document.querySelector('.box');
let restart = document.querySelector('#restart');
let gameScore = document.querySelector('#gameScore');
// gameover時出現
function drawGameOver(){
    box.style.display = 'block';
    gameScore.innerHTML = score;
    if( score > 90){
        body.style.backgroundImage = "url('./img/10.jpg')";
    }else if( score > 80){
        body.style.backgroundImage = "url('./img/9.jpg')";
    }else if( score > 70){
        body.style.backgroundImage = "url('./img/8.jpg')";
    }else if( score > 60){
        body.style.backgroundImage = "url('./img/7.jpg')";
    }else if( score > 50){
        body.style.backgroundImage = "url('./img/6.jpg')";
    }else if( score > 40){
        body.style.backgroundImage = "url('./img/5.png')";
    }else if( score > 30){
        body.style.backgroundImage = "url('./img/4.png')"; 
    }else if( score > 20){
        body.style.backgroundImage = "url('./img/3.jpg')"; 
    }else if( score > 10){
        body.style.backgroundImage = "url('./img/2.jpg')"; 
    }else{
        body.style.backgroundImage = "url('./img/1.jpg')";            
}
    restart.addEventListener('click',function(){
        window.location.reload();
    })
}


window.addEventListener('click',function(e){
    // 使用collisionCanvas來取得每個物件獨立的背景色
    let detectPixelColor = collisionContext.getImageData(e.x, e.y, 1, 1);
    // 取得rbga的具體數值
    let pc = detectPixelColor.data;
    // console.log(pc);
    // 若點擊的背景色和取得的背景色一致 -> 點擊到了物件 -> 將物件丟進 markedForDeletion = true
    targets.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            // collision detected
            // 敲動錘子，200毫秒後恢復
            canvas.style.cursor ='url("./img/hit.png"), default';
            setTimeout(() => {
                canvas.style.cursor = 'url("./img/hammer.png"), default';
            },200);
            // 丟出陣列
            object.markedForDeletion = true;
            // 分數增加
            score ++;
            explosions.push(new Explosion( object.x , object.y , object.width));
        }
    });
})
// touch event can handle multiple touch points -> e.x改成e.touches[0].clientX , e.y改成e.touches[0].clientY
window.addEventListener('touchstart',function(e){
    // 使用collisionCanvas來取得每個物件獨立的背景色
    let detectPixelColor = collisionContext.getImageData(e.touches[0].clientX, e.touches[0].clientY, 1, 1);
    // 取得rbga的具體數值
    let pc = detectPixelColor.data;
    // console.log(pc);
    // 若點擊的背景色和取得的背景色一致 -> 點擊到了物件 -> 將物件丟進 markedForDeletion = true
    targets.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            // collision detected
            // 敲動錘子，200毫秒後恢復
            canvas.style.cursor ='url("./img/hit.png"), default';
            setTimeout(() => {
                canvas.style.cursor = 'url("./img/hammer.png"), default';
            },200);
            // 丟出陣列
            object.markedForDeletion = true;
            // 分數增加
            score ++;
            explosions.push(new Explosion( object.x , object.y , object.width));
        }
    });
})

// timestamp = 時間戳
function animate( timestamp ){
    context.clearRect(0, 0, canvas.width, canvas.height);
    collisionContext.clearRect(0, 0, canvas.width, canvas.height);

    // 計算增量時間
    let deltatime = timestamp - lastTime ;
    lastTime = timestamp;
    timeToNextTarget += deltatime ;

    // 當毫秒增加到超越500毫秒時，則將新的target加入targets陣列
    if(timeToNextTarget > targetInterval){
        targets.push (new Target());
        timeToNextTarget = 0 ;
        // console.log(targets);
        // 將陣列進行排序，比較大的物件放前面，比較小的物件放後面(製造深度感)
        targets.sort(function(a,b){
            return a.width - b.width;
        });
    }
    drawScore();
    // ... -> spread operator
    // 讓update()和draw()遍歷targets中所有物件
    [...targets , ...explosions , ...particles].forEach(object => object.update());
    [...targets , ...explosions , ...particles].forEach(object => object.draw());

    // 當markedForDeletion = true 則將之丟出陣列targets
    targets = targets.filter( object => !object.markedForDeletion);
    explosions = explosions.filter( object => !object.markedForDeletion);
    particles = particles.filter( object => !object.markedForDeletion);

    // 若gameover = true 則動畫停止（遊戲結束）
    if(!gameover) requestAnimationFrame(animate);
    else drawGameOver();
}
animate(0);


// resize時重新計算value
window.addEventListener('resize',function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    collisionCanvas.width = window.innerWidth;
    collisionCanvas.height = window.innerHeight;

    context.font='30px Impact, fantasy';
})

function loadImage(url, callback) { 
    var img = new Image(); 
    img.src = url; 
    if (img.complete) { 
        callback.call(img); 
        return; 
    } 
    img.onload = function () {  
        callback.call(img);
    }; 
}; 
$(function(e){
    $('canvas').css({
        "transform": "translate3d(" + (e.clientX) + "px, " + (e.clientY) + "px, 0px)"
    });
})