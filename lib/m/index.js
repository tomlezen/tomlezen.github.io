var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = void 0,
    height = void 0;
var forces = [],
    particles = [];
var nParticles = 250;
var p = 0;

noise.seed(Math.random());

var V2 = function () {
  function V2(x, y) {
    _classCallCheck(this, V2);

    this.x = x || 0;
    this.y = y || 0;
  }

  _createClass(V2, [{
    key: 'add',
    value: function add(vector) {
      this.x += vector.x;
      this.y += vector.y;
    }
  }, {
    key: 'reset',
    value: function reset(x, y) {
      this.x = x;
      this.y = y;
    }
  }, {
    key: 'lerp',
    value: function lerp(vector, n) {
      this.x += (vector.x - this.x) * n;
      this.y += (vector.y - this.y) * n;
    }
  }]);

  return V2;
}();

var Particle = function () {
  function Particle(x, y) {
    _classCallCheck(this, Particle);

    this.position = new V2(-100, -100);
    this.velocity = new V2();
    this.acceleration = new V2();
    this.alpha = 0;
    this.color = '#000000';
    this.points = [new V2(-10 + Math.random() * 20, -10 + Math.random() * 20), new V2(-10 + Math.random() * 20, -10 + Math.random() * 20), new V2(-10 + Math.random() * 20, -10 + Math.random() * 20)];
  }

  _createClass(Particle, [{
    key: 'update',
    value: function update() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.reset(0, 0);
      this.alpha -= 0.008;
      if (this.alpha < 0) this.alpha = 0;
    }
  }, {
    key: 'follow',
    value: function follow() {
      var x = Math.floor(this.position.x / 20);
      var y = Math.floor(this.position.y / 20);
      var index = x * Math.floor(height / 20) + y;
      var force = forces[index];
      if (force) this.applyForce(force);
    }
  }, {
    key: 'applyForce',
    value: function applyForce(force) {
      this.acceleration.add(force);
    }
  }, {
    key: 'draw',
    value: function draw() {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.moveTo(this.position.x + this.points[0].x, this.position.y + this.points[0].y);
      ctx.lineTo(this.position.x + this.points[1].x, this.position.y + this.points[1].y);
      ctx.lineTo(this.position.x + this.points[2].x, this.position.y + this.points[2].y);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }]);

  return Particle;
}();

var resize = function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  initForces();
};

var initForces = function initForces() {
  var i = 0;
  for (var x = 0; x < width; x += 20) {
    for (var y = 0; y < height; y += 20) {
      if (!forces[i]) forces[i] = new V2();
      i++;
    }
  }

  if (i < forces.length) {
    forces.splice(i + 1);
  }
};

var updateForces = function updateForces(t) {
  var i = 0;
  var xOff = 0,
      yOff = 0;
  for (var x = 0; x < width; x += 20) {
    xOff += 0.1;
    for (var y = 0; y < height; y += 20) {
      yOff += 0.1;
      var a = noise.perlin3(xOff, yOff, t * 0.00005) * Math.PI * 4;
      if (forces[i]) forces[i].reset(Math.cos(a) * 0.1, Math.sin(a) * 0.1);
      i++;
    }
  }
};

var initParticles = function initParticles() {
  for (var i = 0; i < nParticles; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height));
    particles[i].velocity.y = 0.1;
  }
};

var drawParticles = function drawParticles() {
  for (var i = 0; i < nParticles; i++) {
    particles[i].update();
    particles[i].follow();
    particles[i].draw();
  }
};

var launchParticle = function launchParticle() {
  particles[p].position.reset(emitter.x, emitter.y);
  particles[p].velocity.reset(-1 + Math.random() * 2, -1 + Math.random() * 2);
  particles[p].color = 'hsl(' + Math.floor(emitter.x / width * 256) + ',40%,' + (60 + Math.random() * 20) + '%)';
  particles[p].alpha = 1;
  p++;
  if (p === nParticles) p = 0;
};

var updateEmitter = function updateEmitter() {
  emitter.lerp(mouse, 0.4);
};

var animate = function animate(t) {
  ctx.clearRect(0, 0, width, height);
  updateEmitter();
  launchParticle();
  launchParticle();
  updateForces(t);
  drawParticles();
  requestAnimationFrame(animate);
};

var pointerMove = function pointerMove(e) {
  mouse.x = (e.touches ? e.touches[0].pageX : e.pageX) - (document.body.scrollLeft || document.documentElement.scrollLeft);
  mouse.y = (e.touches ? e.touches[0].pageY : e.pageY) - (document.body.scrollTop || document.documentElement.scrollTop);
};


var mouse = new V2(window.innerWidth / 2, window.innerHeight / 2);
var emitter = new V2(window.innerWidth / 2, window.innerHeight / 2);
if(window.innerWidth > 760){
  resize();
  initParticles();
  requestAnimationFrame(animate);

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('touchmove', pointerMove);
}