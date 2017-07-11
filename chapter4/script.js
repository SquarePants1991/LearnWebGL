var triangleBuffer = null;

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

window.onWebGLLoad = function () {
  triangleBuffer = makeBuffer();
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
  mat4.rotate(rotateMatrix, rotateMatrix, elapesdTime / 1000.0, vec3.fromValues(1, 1, 1));

  var scale = 0.1 * (Math.sin(elapesdTime / 1000.0) + 1.0) + 0.4;
  var scaleMatrix = mat4.create();
  mat4.scale(scaleMatrix, scaleMatrix, vec3.fromValues(scale, scale, scale));

  var xoffset = Math.sin(elapesdTime / 1000.0);
  var translateMatrix = mat4.create();
  mat4.translate(translateMatrix, translateMatrix, vec3.fromValues(xoffset, 0, 0));

  var transform = mat4.create();
  mat4.multiply(transform, rotateMatrix, scaleMatrix);
  mat4.multiply(transform, transform, translateMatrix);

  transformUniformLoc = gl.getUniformLocation(program, 'transform');
  gl.uniformMatrix4fv(transformUniformLoc, false, transform);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}


