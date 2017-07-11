var gl = null;
var canvas = null; // 绘制3D物体的Canvas
var program = null; // 和Shader交互的通道

function makeProgram() {
  program = gl.createProgram();

  vertexShaderNode = document.getElementById("shader-vs");
  vertexShader = makeShader(vertexShaderNode.textContent, gl.VERTEX_SHADER);
  fragmentShaderNode = document.getElementById("shader-fs");
  fragmentShader = makeShader(fragmentShaderNode.textContent, gl.FRAGMENT_SHADER);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

function makeShader(shaderSrc, shaderType) {
  shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function makeBuffer() {
  var triangle = [
    0.0, 0.5, 0.0, -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
  ];
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW);
  return buffer;
}

function setupGLEnv(canvasID) {
  canvas = document.getElementById(canvasID);
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    alert('天呐！您的浏览器竟然不支持WebGL，快去更新浏览器吧。');
  }
  program = makeProgram();
  if (window.onWebGLLoad) {
    window.onWebGLLoad();
  }
}

function resize(newWidth, newHeight) {
  canvas.width = newWidth;
  canvas.height = newHeight;
}

var lastRenderTime = (new Date()).getTime(); // 上次渲染的时间
var elapsedTime = 0; // 经过的总时间
var glInfoNode = null; // 显示fps信息的html元素
var collectedFrameCount = 0; // 需要多收集几帧再计算fps，这里存储收集了几帧
var collectedFrameDuration = 0; // 存储收集的几帧花了多长时间

window.onresize = function() {
  resize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight - 1);
}

window.onload = function() {
  setupGLEnv('glCanvas');
  glInfoNode = document.getElementById("glInfo");
  resize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight - 1);
  renderLoop();
}

function renderLoop() {
  now = (new Date()).getTime();
  deltaTime = now - lastRenderTime;
  lastRenderTime = now;
  elapsedTime += deltaTime;

  if (window.onWebGLRender) {
    window.onWebGLRender(deltaTime, elapsedTime);
  }

  collectedFrameDuration += deltaTime;
  collectedFrameCount++;
  if (collectedFrameCount >= 10) {
    fps = parseInt(1000.0 * collectedFrameCount / collectedFrameDuration);
    if (isNaN(fps) == false || fps < 1000) {
      glInfoNode.textContent = "FPS: " + fps;
    }
    collectedFrameCount = 0;
    collectedFrameDuration = 0;
  }
  requestAnimationFrame(renderLoop);
}
