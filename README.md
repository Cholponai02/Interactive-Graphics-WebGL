# Interactive Graphics Projects | Sapienza University of Rome

This repository contains a collection of projects developed as part of the **Interactive Graphics** course during my Master's in **Artificial Intelligence and Robotics**. The projects demonstrate the fundamentals of the graphics pipeline, real-time 3D rendering, and advanced shading techniques using WebGL and JavaScript.

## 🚀 Projects Overview

### 1. Interactive Mesh Viewer 
A real-time WebGL application for rendering and interacting with 3D triangular meshes.

* **Key Features:**
    * Dynamic loading and parsing of `.obj` files.
    * Custom implementation of the **Model-View-Projection (MVP)** matrix for 3D transformations.
    * Interactive controls for translation, rotation, and scaling.
    * Support for 2D texture mapping and Y-Z axis swapping.
* **Technologies:** WebGL, GLSL, JavaScript, HTML5.

### 2. Advanced Blinn-Phong Renderer
An extension of the mesh viewer that introduces physically-based shading and complex lighting models.

* **Key Features:**
    * Implementation of the **Blinn-Phong Reflection Model** (Ambient, Diffuse, and Specular components).
    * Real-time lighting calculations in Camera Space using **Halfway Vectors**.
    * Support for vertex normals and normal transformation matrices (Inverse-Transpose).
    * Interactive light direction and material shininess control.
    * Seamless integration of textures with shading.
* **Technologies:** Advanced GLSL Shaders, Linear Algebra for Graphics, WebGL.

---

## 🛠️ Technical Details

### Math & Physics
The projects involve heavy use of linear algebra, including:
- Matrix multiplication for coordinate space transformations.
- Normal vector normalization and transformation.
- Dot products for Lambertian reflectance and specular highlights.

### Shaders (GLSL)
- **Vertex Shaders:** Handle coordinate transformations and pass data (normals, UVs) to the fragment stage.
- **Fragment Shaders:** Execute per-pixel lighting calculations and texture sampling.

---

## 📂 Project Structure

```text
.
├── Interactive-Mesh-Viewer/      
│   ├── project2.html              # UI and WebGL Setup
│   ├── project2.js                # MVP Logic & MeshDrawer Class
│   └── obj.js                     # OBJ Parser
├── Advanced-Blinn-Phong-Renderer/ 
│   ├── project3.html              # Advanced UI with Light Control
│   ├── project3.js                # Shading Logic & Normal Handling
│   └── obj.js                     # Shared OBJ Parser
└── assets/                        # Sample .obj models and textures
