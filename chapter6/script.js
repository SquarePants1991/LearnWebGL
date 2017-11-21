var triangleBuffer = null;

var perspectiveProjectionMatrix = null;
var cameraMatrix = null;
var modelMatrix1 = null;
var modelMatrix2 = null;

function makeBuffer() {
  var triangle = [
    -0.5, 0.5, 0.0, 
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
  ];
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW);
  return buffer;
}

function setupMatrix() {
  perspectiveProjectionMatrix = mat4.create();
  mat4.perspective(perspectiveProjectionMatrix, 90 / 180.0 * Math.PI, canvas.width / canvas.height, 0.1, 1000);

  cameraMatrix = mat4.create();
  mat4.lookAt(cameraMatrix, vec3.fromValues(0,0,2), vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));

  modelMatrix1 = mat4.create();
  modelMatrix2 = mat4.create();
}

window.onWebGLLoad = function () {
  triangleBuffer = makeBuffer();
  setupMatrix();
}

window.onWebGLRender = function render(deltaTime, elapesdTime) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 3, 0);

  elapsedTimeUniformLoc = gl.getUniformLocation(program, 'elapsedTime');
  gl.uniform1f(elapsedTimeUniformLoc, elapesdTime);

  // 保证canvas尺寸改变时，同步投影矩阵的值，你也可以在resize里重新计算，那样会更好。
  mat4.perspective(perspectiveProjectionMatrix, 90 / 180.0 * Math.PI, canvas.width / canvas.height, 0.1, 1000);

  var varyingFactor = (Math.sin(elapsedTime / 1000) + 1) / 2.0; // 0 ~ 1
  mat4.lookAt(cameraMatrix, vec3.fromValues(0, 0, 2 * (varyingFactor + 1)), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

  // 设置第一个model matrix
  var rotateMatrix = mat4.create();
  var translateMatrix = mat4.create();
  mat4.rotate(rotateMatrix, rotateMatrix, varyingFactor * Math.PI * 2, vec3.fromValues(0, 1, 0));
  mat4.translate(translateMatrix, translateMatrix, vec3.fromValues(-0.7, 0, 0));
  mat4.multiply(modelMatrix1, translateMatrix, rotateMatrix);

  // 设置第二个model matrix
  rotateMatrix = mat4.create();
  translateMatrix = mat4.create();
  mat4.rotate(rotateMatrix, rotateMatrix, varyingFactor * Math.PI * 2, vec3.fromValues(0, 0, 1));
  mat4.translate(translateMatrix, translateMatrix, vec3.fromValues(0.7, 0, 0));
  mat4.multiply(modelMatrix2, translateMatrix, rotateMatrix);

  // 设置投影和观察矩阵
  var projectionMatrixUniformLoc = gl.getUniformLocation(program, 'projectionMatrix');
  gl.uniformMatrix4fv(projectionMatrixUniformLoc, false, perspectiveProjectionMatrix);
  var cameraMatrixUniformLoc = gl.getUniformLocation(program, 'cameraMatrix');
  gl.uniformMatrix4fv(cameraMatrixUniformLoc, false, cameraMatrix);

  // 使用不同的model matrix绘制两次物体
  var modelMatrixUniformLoc = gl.getUniformLocation(program, 'modelMatrix');
  gl.uniformMatrix4fv(modelMatrixUniformLoc, false, modelMatrix1);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  modelMatrixUniformLoc = gl.getUniformLocation(program, 'modelMatrix');
  gl.uniformMatrix4fv(modelMatrixUniformLoc, false, modelMatrix2);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


