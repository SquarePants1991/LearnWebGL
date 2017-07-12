var triangleBuffer = null;
var perspectiveProjectionMatrix = null;
var orthoProjectionMatrix = null;
var currentProjectionMatrix = null;

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

function setupProjectionMatrixSelect() {
  currentProjectionMatrix = perspectiveProjectionMatrix;
  currentBuffer = triangleBuffer;
  var selectNode = document.getElementById("projectionModeSelect");
  selectNode.onchange = function (evt) {
    switch (evt.target.value) {
      case 'perspective': 
        currentProjectionMatrix = perspectiveProjectionMatrix;
        break;
      case 'ortho': 
        currentProjectionMatrix = orthoProjectionMatrix;
        break;
    }
  }
}

window.onWebGLLoad = function () {
  triangleBuffer = makeBuffer();
  perspectiveProjectionMatrix = mat4.create();
  mat4.perspective(perspectiveProjectionMatrix, 80 / 180.0 * Math.PI, canvas.width / canvas.height, 0.1, 1000);

  orthoProjectionMatrix = mat4.create();
  mat4.ortho(orthoProjectionMatrix, -0.8, 0.8, -0.8, 0.8, -100, 100);

  setupProjectionMatrixSelect();
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

  var rotateMatrix = mat4.create();
  mat4.rotate(rotateMatrix, rotateMatrix, elapesdTime / 1000.0, vec3.fromValues(0, 1, 0));

  var translateMatrix = mat4.create();
  mat4.translate(translateMatrix, translateMatrix, vec3.fromValues(0, 0, -1));

  var transform = mat4.create();
  mat4.multiply(transform, translateMatrix, rotateMatrix);
  mat4.multiply(transform, currentProjectionMatrix, transform);

  transformUniformLoc = gl.getUniformLocation(program, 'transform');
  gl.uniformMatrix4fv(transformUniformLoc, false, transform);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


