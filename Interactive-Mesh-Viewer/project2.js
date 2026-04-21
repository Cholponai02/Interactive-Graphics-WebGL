// Function to compute the Model-View-Projection matrix
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
    // Rotation around X axis
    var cosX = Math.cos(rotationX);
    var sinX = Math.sin(rotationX);
    var rotX = [
        1, 0, 0, 0,
        0, cosX, sinX, 0,
        0, -sinX, cosX, 0,
        0, 0, 0, 1
    ];

    // Rotation around Y axis
    var cosY = Math.cos(rotationY);
    var sinY = Math.sin(rotationY);
    var rotY = [
        cosY, 0, -sinY, 0,
        0, 1, 0, 0,
        sinY, 0, cosY, 0,
        0, 0, 0, 1
    ];
    
    // Translation matrix
    var trans = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

    // Combine transformations: MVP = Projection * Translation * RotX * RotY
    var modelView = MatrixMult(trans, MatrixMult(rotX, rotY));
    var mvp = MatrixMult(projectionMatrix, modelView);
    return mvp;
}

class MeshDrawer {
    constructor() {
        // Compile the shader program
        this.prog = InitShaderProgram(meshVS, meshFS);

        // Get attribute and uniform locations
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.swapYZLoc = gl.getUniformLocation(this.prog, 'swapYZ');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.texSampler = gl.getUniformLocation(this.prog, 'texSampler');

        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

        // Create buffers
        this.vertBuffer = gl.createBuffer();
        this.texBuffer = gl.createBuffer();

        // Initial states
        this.numTriangles = 0;
        this.isSwapYZ = false;
        this.isShowTex = false;

        // Create a WebGL texture
        this.texture = gl.createTexture();
    }

    setMesh(vertPos, texCoords) {
        // Bind and fill vertex position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        // Bind and fill texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

    swapYZ(swap) {
        this.isSwapYZ = swap;
    }

    setTexture(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        // Generate mipmaps for better filtering
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    showTexture(show) {
        this.isShowTex = show;
    }

    draw(trans) {
        gl.useProgram(this.prog);

        // Set uniforms
        gl.uniformMatrix4fv(this.mvpLoc, false, trans);
        gl.uniform1i(this.swapYZLoc, this.isSwapYZ ? 1 : 0);
        gl.uniform1i(this.showTexLoc, this.isShowTex ? 1 : 0);

        // Bind vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPosLoc);

        // Bind texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoordLoc);

        // Bind texture to unit 0
        if (this.isShowTex) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.texSampler, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }
}

// Vertex Shader
var meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    uniform mat4 mvp;
    uniform bool swapYZ;
    varying vec2 v_texCoord;
    varying float v_depth;

    void main() {
        vec3 finalPos = pos;
        if (swapYZ) {
            finalPos = vec3(pos.x, pos.z, pos.y);
        }
        gl_Position = mvp * vec4(finalPos, 1.0);
        v_texCoord = texCoord;
        v_depth = gl_Position.z; 
    }
`;

// Fragment Shader
var meshFS = `
    precision mediump float;
    uniform bool showTex;
    uniform sampler2D texSampler;
    varying vec2 v_texCoord;
    varying float v_depth;

    void main() {
        if (showTex) {
            gl_FragColor = texture2D(texSampler, v_texCoord);
        } else {
            // Default coloring as requested in Step 2
            float d = v_depth * 0.5; // Adjust factor for visualization
            gl_FragColor = vec4(1.0, d * d, 0.0, 1.0);
        }
    }
`;