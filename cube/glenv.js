var gl = null;
var defaultProgram = null;
var squareBuffer = null;
var canvasSize = { width: 0, height: 0};
var perspectiveMatrix = null;
var viewMatrix = null;
var modelMatrix = null;
var woodTexture = null;
var canvasId = null;

function setupGLEnv(canvasID) {
    canvasId = canvasID
    var canvas = document.getElementById(canvasID);
    canvasSize.width = canvas.width;
    canvasSize.height = canvas.height;
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser may not support it.');
    }

    defaultProgram = makeProgram();
    makeBuffer();
    makeMatrix();
    makeTexture();
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

function resize(newWidth, newHeight) {
    var canvas = document.getElementById(canvasId);
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvasSize.width = newWidth;
    canvasSize.height = newHeight;
    perspectiveMatrix = mat4.create();
    aspect = canvasSize.width / canvasSize.height;
    mat4.perspective(perspectiveMatrix, 90 / 180.0 * 3.1415, aspect, 0.01, 1000);
}

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

function makeBuffer() {
    var square = [
    // X轴0.5处的平面
               0.5, -0.5, 0.5, 1, 0, 0, 0, 0,
               0.5, -0.5, -0.5, 1, 0, 0, 0, 1,
               0.5, 0.5, -0.5, 1, 0, 0, 1, 1,
               0.5, 0.5, -0.5, 1, 0, 0, 1, 1,
               0.5, 0.5, 0.5, 1, 0, 0, 1, 0,
               0.5, -0.5, 0.5, 1, 0, 0, 0, 0,
               // X轴-0.5处的平面
               -0.5, -0.5, 0.5, -1, 0, 0, 0, 0,
               -0.5, -0.5, -0.5, -1, 0, 0, 0, 1,
               -0.5, 0.5, -0.5, -1, 0, 0, 1, 1,
               -0.5, 0.5, -0.5, -1, 0, 0, 1, 1,
               -0.5, 0.5, 0.5, -1, 0, 0, 1, 0,
               -0.5, -0.5, 0.5, -1, 0, 0, 0, 0,

               -0.5, 0.5, 0.5, 0, 1, 0, 0, 0,
               -0.5, 0.5, -0.5, 0, 1, 0, 0, 1,
               0.5, 0.5, -0.5, 0, 1, 0, 1, 1,
               0.5, 0.5, -0.5, 0, 1, 0, 1, 1,
               0.5, 0.5, 0.5, 0, 1, 0, 1, 0,
               -0.5, 0.5, 0.5, 0, 1, 0, 0, 0,
               -0.5, -0.5, 0.5, 0, -1, 0, 0, 0,
               -0.5, -0.5, -0.5, 0, -1, 0, 0, 1,
               0.5, -0.5, -0.5, 0, -1, 0, 1, 1,
               0.5, -0.5, -0.5, 0, -1, 0, 1, 1,
               0.5, -0.5, 0.5, 0, -1, 0, 1, 0,
               -0.5, -0.5, 0.5, 0, -1, 0, 0, 0,

               -0.5, 0.5, 0.5, 0, 0, 1, 0, 0,
               -0.5, -0.5, 0.5, 0, 0, 1, 0, 1,
               0.5, -0.5, 0.5, 0, 0, 1, 1, 1,
               0.5, -0.5, 0.5, 0, 0, 1, 1, 1,
               0.5, 0.5, 0.5, 0, 0, 1, 1, 0,
               -0.5, 0.5, 0.5, 0, 0, 1, 0, 0,
               -0.5, 0.5, -0.5, 0, 0, -1, 0, 0,
               -0.5, -0.5, -0.5, 0, 0, -1, 0, 1,
               0.5, -0.5, -0.5, 0, 0, -1, 1, 1,
               0.5, -0.5, -0.5, 0, 0, -1, 1, 1,
               0.5, 0.5, -0.5, 0, 0, -1, 1, 0,
               -0.5, 0.5, -0.5, 0, 0, -1, 0, 0,
    ];
    squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);
    return squareBuffer;
}

function makeMatrix() {
    perspectiveMatrix = mat4.create();
    aspect = canvasSize.width / canvasSize.height;
    mat4.perspective(perspectiveMatrix, 90 / 180.0 * 3.1415, aspect, 0.01, 1000);

    viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, vec3.fromValues(0.0, 1, 2), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

    modelMatrix = mat4.create();
    mat4.rotate(modelMatrix, modelMatrix, 3.14 * 0.2, vec3.fromValues(1, 1, 1));
}

function makeTexture() {
    woodTexture = gl.createTexture();
    woodImage = new Image();
    woodImage.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, woodTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, woodImage);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    woodImage.src = "./wood.jpeg";
}

function render(deltaTime, elapsedTime) {
    gl.viewport(0, 0, canvasSize.width, canvasSize.height);
    gl.clearColor(.1, .1, .1, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update model matrix by elapsedTime
    modelMatrix = mat4.create();
    mat4.rotate(modelMatrix, modelMatrix, elapsedTime / 1000.0 , vec3.fromValues(1, 1, 1));

    if (defaultProgram) {
        gl.useProgram(defaultProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);

        posLoc = gl.getAttribLocation(defaultProgram, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 4 * 8, 0);

        normalLoc = gl.getAttribLocation(defaultProgram, "normal");
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 4 * 8, 4 * 3);

        uvLoc = gl.getAttribLocation(defaultProgram, "uv");
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 4 * 8, 4 * 6);

        perspectiveMatrixLoc = gl.getUniformLocation(defaultProgram, "perspectiveMatrix");
        gl.uniformMatrix4fv(perspectiveMatrixLoc, false, perspectiveMatrix);

        viewMatrixLoc = gl.getUniformLocation(defaultProgram, "viewMatrix");
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

        modelMatrixLoc = gl.getUniformLocation(defaultProgram, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

        diffuseLoc = gl.getUniformLocation(defaultProgram, "diffuse");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, woodTexture);
        gl.uniform1i(diffuseLoc, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
