// Function to compute the Model-View matrix (without projection)
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
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

    // Combine: MV = Translation * RotationX * RotationY
    var mv = MatrixMult( trans, MatrixMult( rotX, rotY ) );
    return mv;
}

class MeshDrawer
{
    constructor()
    {
        // Compile the shader program with shading logic
        this.prog = InitShaderProgram( meshVS, meshFS );
        
        // Uniform locations
        this.mvpLoc        = gl.getUniformLocation( this.prog, 'mvp' );
        this.mvLoc         = gl.getUniformLocation( this.prog, 'mv' );
        this.normMatLoc    = gl.getUniformLocation( this.prog, 'normalMat' );
        this.lightDirLoc   = gl.getUniformLocation( this.prog, 'lightDir' );
        this.shininessLoc  = gl.getUniformLocation( this.prog, 'shininess' );
        this.showTexLoc    = gl.getUniformLocation( this.prog, 'showTex' );
        this.swapYZLoc     = gl.getUniformLocation( this.prog, 'swapYZ' );
        this.texSamplerLoc = gl.getUniformLocation( this.prog, 'texSampler' );
        
        // Attribute locations
        this.vertPosLoc    = gl.getAttribLocation( this.prog, 'pos' );
        this.texCoordLoc   = gl.getAttribLocation( this.prog, 'texCoord' );
        this.normalLoc     = gl.getAttribLocation( this.prog, 'normal' );

        // Buffers
        this.vertBuffer    = gl.createBuffer();
        this.texBuffer     = gl.createBuffer();
        this.normBuffer    = gl.createBuffer();
        
        this.numTriangles  = 0;
        
        // Texture
        this.texture       = gl.createTexture();
        this.isTextureReady = false;

        // Default values
        this.lightDir      = [0, 0, 1];
        this.shininess     = 1.0;
        this.isShowTex     = false;
        this.isSwapYZ      = false;
    }
    
    setMesh( vertPos, texCoords, normals )
    {
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );
        
        this.numTriangles = vertPos.length / 3;
    }
    
    swapYZ( swap )
    {
        this.isSwapYZ = swap;
    }
    
    setTexture( img )
    {
        gl.bindTexture( gl.TEXTURE_2D, this.texture );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
        gl.generateMipmap( gl.TEXTURE_2D );
        
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        
        this.isTextureReady = true;
    }
    
    showTexture( show )
    {
        this.isShowTex = show;
    }
    
    setLightDir( x, y, z )
    {
        this.lightDir = [x, y, z];
    }
    
    setShininess( shininess )
    {
        this.shininess = shininess;
    }
    
    draw( matrixMVP, matrixMV, matrixNormal )
    {
        gl.useProgram( this.prog );
        
        // Pass matrices
        gl.uniformMatrix4fv( this.mvpLoc, false, matrixMVP );
        gl.uniformMatrix4fv( this.mvLoc, false, matrixMV );
        gl.uniformMatrix3fv( this.normMatLoc, false, matrixNormal );
        
        // Pass other uniforms
        gl.uniform3fv( this.lightDirLoc, this.lightDir );
        gl.uniform1f( this.shininessLoc, this.shininess );
        gl.uniform1i( this.showTexLoc, this.isShowTex ? 1 : 0 );
        gl.uniform1i( this.swapYZLoc, this.isSwapYZ ? 1 : 0 );
        
        // Set Attributes
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
        gl.vertexAttribPointer( this.vertPosLoc, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vertPosLoc );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
        gl.vertexAttribPointer( this.texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.texCoordLoc );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer );
        gl.vertexAttribPointer( this.normalLoc, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.normalLoc );
        
        if (this.isShowTex && this.isTextureReady) {
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, this.texture );
            gl.uniform1i( this.texSamplerLoc, 0 );
        }

        gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
    }
}

// Vertex Shader
var meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    attribute vec3 normal;

    uniform mat4 mvp;
    uniform mat4 mv;
    uniform mat3 normalMat;
    uniform bool swapYZ;

    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_posCam;

    void main() {
        vec3 p = pos;
        vec3 n = normal;
        if (swapYZ) {
            p = vec3(pos.x, pos.z, pos.y);
            n = vec3(normal.x, normal.z, normal.y);
        }
        
        // Transform normal and position to camera space
        v_posCam = (mv * vec4(p, 1.0)).xyz;
        v_normal = normalize(normalMat * n);
        v_texCoord = texCoord;
        
        gl_Position = mvp * vec4(p, 1.0);
    }
`;

// Fragment Shader (Blinn-Phong Shading)
var meshFS = `
    precision mediump float;

    uniform bool showTex;
    uniform sampler2D texSampler;
    uniform vec3 lightDir;
    uniform float shininess;

    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_posCam;

    void main() {
        vec3 n = normalize(v_normal);
        vec3 l = normalize(lightDir);
        vec3 v = normalize(-v_posCam); // View vector (camera is at 0,0,0)
        vec3 h = normalize(l + v);     // Halfway vector for Blinn

        // Parameters
        float ambient = 0.15; // Ambient intensity
        
        // Diffuse
        float diff = max(dot(n, l), 0.0);
        
        // Specular
        float spec = 0.0;
        if (diff > 0.0) {
            spec = pow(max(dot(n, h), 0.0), shininess);
        }

        vec3 kd;
        if (showTex) {
            kd = texture2D(texSampler, v_texCoord).rgb;
        } else {
            kd = vec3(1.0, 1.0, 1.0); // Base color white
        }

        // Final Color calculation
        // I = white (1,1,1), Ks = white (1,1,1)
        vec3 diffusePart = kd * (diff + ambient);
        vec3 specularPart = vec3(1.0) * spec;

        gl_FragColor = vec4(diffusePart + specularPart, 1.0);
    }
`;