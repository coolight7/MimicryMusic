THREE.BAS = {};
THREE.BAS.ShaderChunk = {};

THREE.BAS.ShaderChunk["animation_time"] = "float tDelay = aAnimation.x;\nfloat tDuration = aAnimation.y;\nfloat tTime = clamp(uTime - tDelay, 0.0, tDuration);\nfloat tProgress = ease(tTime, 0.0, 1.0, tDuration);\n";

THREE.BAS.ShaderChunk["catmull-rom"] = "vec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t)\n{\n    vec3 v0 = (p2 - p0) * 0.5;\n    vec3 v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nvec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, vec2 c, float t)\n{\n    vec3 v0 = (p2 - p0) * c.x;\n    vec3 v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, float t)\n{\n    float v0 = (p2 - p0) * 0.5;\n    float v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, vec2 c, float t)\n{\n    float v0 = (p2 - p0) * c.x;\n    float v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n";

THREE.BAS.ShaderChunk["cubic_bezier"] = "vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t)\n{\n    vec3 tp;\n    float tn = 1.0 - t;\n\n    tp.xyz = tn * tn * tn * p0.xyz + 3.0 * tn * tn * t * c0.xyz + 3.0 * tn * t * t * c1.xyz + t * t * t * p1.xyz;\n\n    return tp;\n}\n";

THREE.BAS.ShaderChunk["ease_in_cubic"] = "float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t*t + b;\n}\n";

THREE.BAS.ShaderChunk["ease_in_out_cubic"] = "float ease(float t, float b, float c, float d) {\n  if ((t/=d/2.0) < 1.0) return c/2.0*t*t*t + b;\n  return c/2.0*((t-=2.0)*t*t + 2.0) + b;\n}\n";

THREE.BAS.ShaderChunk["ease_in_quad"] = "float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t + b;\n}\n";

THREE.BAS.ShaderChunk["ease_out_back"] = "float ease(float t, float b, float c, float d) {\n  float s = 1.70158;\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n\nfloat ease(float t, float b, float c, float d, float s) {\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n";

THREE.BAS.ShaderChunk["ease_out_cubic"] = "float ease(float t, float b, float c, float d) {\n  return c*((t=t/d - 1.0)*t*t + 1.0) + b;\n}\n";

THREE.BAS.ShaderChunk["quaternion_rotation"] = "vec3 rotateVector(vec4 q, vec3 v)\n{\n    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvec4 quatFromAxisAngle(vec3 axis, float angle)\n{\n    float halfAngle = angle * 0.5;\n    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));\n}\n";


THREE.BAS.Utils = {
  separateFaces: function (geometry) {
    var vertices = [];

    for (var i = 0, il = geometry.faces.length; i < il; i++) {

      var n = vertices.length;

      var face = geometry.faces[i];

      var a = face.a;
      var b = face.b;
      var c = face.c;

      var va = geometry.vertices[a];
      var vb = geometry.vertices[b];
      var vc = geometry.vertices[c];

      vertices.push(va.clone());
      vertices.push(vb.clone());
      vertices.push(vc.clone());

      face.a = n;
      face.b = n + 1;
      face.c = n + 2;

    }

    geometry.vertices = vertices;
    delete geometry.__tmpVertices;
  },
  tessellate: function (geometry, maxEdgeLength) {
    var edge;

    var faces = [];
    var faceVertexUvs = [];
    var maxEdgeLengthSquared = maxEdgeLength * maxEdgeLength;

    for (var i = 0, il = geometry.faceVertexUvs.length; i < il; i++) {

      faceVertexUvs[i] = [];

    }

    for (var i = 0, il = geometry.faces.length; i < il; i++) {

      var face = geometry.faces[i];

      if (face instanceof THREE.Face3) {

        var a = face.a;
        var b = face.b;
        var c = face.c;

        var va = geometry.vertices[a];
        var vb = geometry.vertices[b];
        var vc = geometry.vertices[c];

        var dab = va.distanceToSquared(vb);
        var dbc = vb.distanceToSquared(vc);
        var dac = va.distanceToSquared(vc);

        if (dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared) {

          var m = geometry.vertices.length;

          var triA = face.clone();
          var triB = face.clone();

          if (dab >= dbc && dab >= dac) {

            var vm = va.clone();
            vm.lerp(vb, 0.5);

            triA.a = a;
            triA.b = m;
            triA.c = c;

            triB.a = m;
            triB.b = b;
            triB.c = c;

            if (face.vertexNormals.length === 3) {

              var vnm = face.vertexNormals[0].clone();
              vnm.lerp(face.vertexNormals[1], 0.5);

              triA.vertexNormals[1].copy(vnm);
              triB.vertexNormals[0].copy(vnm);

            }

            if (face.vertexColors.length === 3) {

              var vcm = face.vertexColors[0].clone();
              vcm.lerp(face.vertexColors[1], 0.5);

              triA.vertexColors[1].copy(vcm);
              triB.vertexColors[0].copy(vcm);

            }

            edge = 0;

          } else if (dbc >= dab && dbc >= dac) {

            var vm = vb.clone();
            vm.lerp(vc, 0.5);

            triA.a = a;
            triA.b = b;
            triA.c = m;

            triB.a = m;
            triB.b = c;
            triB.c = a;

            if (face.vertexNormals.length === 3) {

              var vnm = face.vertexNormals[1].clone();
              vnm.lerp(face.vertexNormals[2], 0.5);

              triA.vertexNormals[2].copy(vnm);

              triB.vertexNormals[0].copy(vnm);
              triB.vertexNormals[1].copy(face.vertexNormals[2]);
              triB.vertexNormals[2].copy(face.vertexNormals[0]);

            }

            if (face.vertexColors.length === 3) {

              var vcm = face.vertexColors[1].clone();
              vcm.lerp(face.vertexColors[2], 0.5);

              triA.vertexColors[2].copy(vcm);

              triB.vertexColors[0].copy(vcm);
              triB.vertexColors[1].copy(face.vertexColors[2]);
              triB.vertexColors[2].copy(face.vertexColors[0]);

            }

            edge = 1;

          } else {

            var vm = va.clone();
            vm.lerp(vc, 0.5);

            triA.a = a;
            triA.b = b;
            triA.c = m;

            triB.a = m;
            triB.b = b;
            triB.c = c;

            if (face.vertexNormals.length === 3) {

              var vnm = face.vertexNormals[0].clone();
              vnm.lerp(face.vertexNormals[2], 0.5);

              triA.vertexNormals[2].copy(vnm);
              triB.vertexNormals[0].copy(vnm);

            }

            if (face.vertexColors.length === 3) {

              var vcm = face.vertexColors[0].clone();
              vcm.lerp(face.vertexColors[2], 0.5);

              triA.vertexColors[2].copy(vcm);
              triB.vertexColors[0].copy(vcm);

            }

            edge = 2;

          }

          faces.push(triA, triB);
          geometry.vertices.push(vm);

          for (var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j++) {

            if (geometry.faceVertexUvs[j].length) {

              var uvs = geometry.faceVertexUvs[j][i];

              var uvA = uvs[0];
              var uvB = uvs[1];
              var uvC = uvs[2];

              // AB

              if (edge === 0) {

                var uvM = uvA.clone();
                uvM.lerp(uvB, 0.5);

                var uvsTriA = [uvA.clone(), uvM.clone(), uvC.clone()];
                var uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];

                // BC

              } else if (edge === 1) {

                var uvM = uvB.clone();
                uvM.lerp(uvC, 0.5);

                var uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
                var uvsTriB = [uvM.clone(), uvC.clone(), uvA.clone()];

                // AC

              } else {

                var uvM = uvA.clone();
                uvM.lerp(uvC, 0.5);

                var uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
                var uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];

              }

              faceVertexUvs[j].push(uvsTriA, uvsTriB);

            }

          }

        } else {

          faces.push(face);

          for (var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j++) {

            faceVertexUvs[j].push(geometry.faceVertexUvs[j][i]);

          }

        }

      }

    }

    geometry.faces = faces;
    geometry.faceVertexUvs = faceVertexUvs;
  },
  tessellateRepeat: function(geometry, maxEdgeLength, times) {
    for (var i = 0; i < times; i++) {
      THREE.BAS.Utils.tessellate(geometry, maxEdgeLength);
    }
  },
  subdivide: function (geometry, subdivisions) {
    var WARNINGS = !true; // Set to true for development
    var ABC = ['a', 'b', 'c'];

    while (subdivisions-- > 0) {
      smooth(geometry);
    }

    delete geometry.__tmpVertices;
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    function getEdge(a, b, map) {
      var vertexIndexA = Math.min(a, b);
      var vertexIndexB = Math.max(a, b);

      var key = vertexIndexA + "_" + vertexIndexB;

      return map[key];
    }


    function processEdge(a, b, vertices, map, face, metaVertices) {

      var vertexIndexA = Math.min(a, b);
      var vertexIndexB = Math.max(a, b);

      var key = vertexIndexA + "_" + vertexIndexB;

      var edge;

      if (key in map) {

        edge = map[key];

      } else {

        var vertexA = vertices[vertexIndexA];
        var vertexB = vertices[vertexIndexB];

        edge = {

          a: vertexA, // pointer reference
          b: vertexB,
          newEdge: null,
          // aIndex: a, // numbered reference
          // bIndex: b,
          faces: [] // pointers to face

        };

        map[key] = edge;

      }

      edge.faces.push(face);

      metaVertices[a].edges.push(edge);
      metaVertices[b].edges.push(edge);


    }

    function generateLookups(vertices, faces, metaVertices, edges) {

      var i, il, face, edge;

      for (i = 0, il = vertices.length; i < il; i++) {

        metaVertices[i] = {edges: []};

      }

      for (i = 0, il = faces.length; i < il; i++) {

        face = faces[i];

        processEdge(face.a, face.b, vertices, edges, face, metaVertices);
        processEdge(face.b, face.c, vertices, edges, face, metaVertices);
        processEdge(face.c, face.a, vertices, edges, face, metaVertices);

      }

    }

    function newFace(newFaces, a, b, c) {
      newFaces.push(new THREE.Face3(a, b, c));
    }


    /////////////////////////////

    // Performs one iteration of Subdivision
    function smooth(geometry) {
      var tmp = new THREE.Vector3();

      var oldVertices, oldFaces;
      var newVertices, newFaces; // newUVs = [];

      var n, l, i, il, j, k;
      var metaVertices, sourceEdges;

      // new stuff.
      var sourceEdges, newEdgeVertices, newSourceVertices;

      oldVertices = geometry.vertices; // { x, y, z}
      oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }

      /******************************************************
       *
       * Step 0: Preprocess Geometry to Generate edges Lookup
       *
       *******************************************************/

      metaVertices = new Array(oldVertices.length);
      sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }

      generateLookups(oldVertices, oldFaces, metaVertices, sourceEdges);


      /******************************************************
       *
       *  Step 1.
       *  For each edge, create a new Edge Vertex,
       *  then position it.
       *
       *******************************************************/

      newEdgeVertices = [];
      var other, currentEdge, newEdge, face;
      var edgeVertexWeight, adjacentVertexWeight, connectedFaces;

      for (i in sourceEdges) {
        currentEdge = sourceEdges[i];
        newEdge = new THREE.Vector3();

        edgeVertexWeight = 3 / 8;
        adjacentVertexWeight = 1 / 8;

        connectedFaces = currentEdge.faces.length;

        // check how many linked faces. 2 should be correct.
        if (connectedFaces != 2) {

          // if length is not 2, handle condition
          edgeVertexWeight = 0.5;
          adjacentVertexWeight = 0;

          if (connectedFaces != 1) {

            if (WARNINGS) console.warn('Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge);

          }

        }

        newEdge.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight);

        tmp.set(0, 0, 0);

        for (j = 0; j < connectedFaces; j++) {

          face = currentEdge.faces[j];

          for (k = 0; k < 3; k++) {

            other = oldVertices[face[ABC[k]]];
            if (other !== currentEdge.a && other !== currentEdge.b) break;

          }

          tmp.add(other);

        }

        tmp.multiplyScalar(adjacentVertexWeight);
        newEdge.add(tmp);

        currentEdge.newEdge = newEdgeVertices.length;
        newEdgeVertices.push(newEdge);

        // console.log(currentEdge, newEdge);

      }

      /******************************************************
       *
       *  Step 2.
       *  Reposition each source vertices.
       *
       *******************************************************/

      var beta, sourceVertexWeight, connectingVertexWeight;
      var connectingEdge, connectingEdges, oldVertex, newSourceVertex;
      newSourceVertices = [];

      for (i = 0, il = oldVertices.length; i < il; i++) {

        oldVertex = oldVertices[i];

        // find all connecting edges (using lookupTable)
        connectingEdges = metaVertices[i].edges;
        n = connectingEdges.length;
        beta;

        if (n == 3) {

          beta = 3 / 16;

        } else if (n > 3) {

          beta = 3 / ( 8 * n ); // Warren's modified formula

        }

        // Loop's original beta formula
        // beta = 1 / n * ( 5/8 - Math.pow( 3/8 + 1/4 * Math.cos( 2 * Math. PI / n ), 2) );

        sourceVertexWeight = 1 - n * beta;
        connectingVertexWeight = beta;

        if (n <= 2) {

          // crease and boundary rules
          // console.warn('crease and boundary rules');

          if (n == 2) {

            if (WARNINGS) console.warn('2 connecting edges', connectingEdges);
            sourceVertexWeight = 3 / 4;
            connectingVertexWeight = 1 / 8;

            // sourceVertexWeight = 1;
            // connectingVertexWeight = 0;

          } else if (n == 1) {

            if (WARNINGS) console.warn('only 1 connecting edge');

          } else if (n == 0) {

            if (WARNINGS) console.warn('0 connecting edges');

          }

        }

        newSourceVertex = oldVertex.clone().multiplyScalar(sourceVertexWeight);

        tmp.set(0, 0, 0);

        for (j = 0; j < n; j++) {

          connectingEdge = connectingEdges[j];
          other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
          tmp.add(other);

        }

        tmp.multiplyScalar(connectingVertexWeight);
        newSourceVertex.add(tmp);

        newSourceVertices.push(newSourceVertex);

      }


      /******************************************************
       *
       *  Step 3.
       *  Generate Faces between source vertecies
       *  and edge vertices.
       *
       *******************************************************/

      newVertices = newSourceVertices.concat(newEdgeVertices);
      var sl = newSourceVertices.length, edge1, edge2, edge3;
      newFaces = [];

      for (i = 0, il = oldFaces.length; i < il; i++) {

        face = oldFaces[i];

        // find the 3 new edges vertex of each old face

        edge1 = getEdge(face.a, face.b, sourceEdges).newEdge + sl;
        edge2 = getEdge(face.b, face.c, sourceEdges).newEdge + sl;
        edge3 = getEdge(face.c, face.a, sourceEdges).newEdge + sl;

        // create 4 faces.

        newFace(newFaces, edge1, edge2, edge3);
        newFace(newFaces, face.a, edge1, edge3);
        newFace(newFaces, face.b, edge2, edge1);
        newFace(newFaces, face.c, edge3, edge2);

      }

      // Overwrite old arrays
      geometry.vertices = newVertices;
      geometry.faces = newFaces;

      // console.log('done');

    }
  },

  computeCentroid: (function () {
    var v = new THREE.Vector3();

    return function (geometry, face) {
      var a = geometry.vertices[face.a],
        b = geometry.vertices[face.b],
        c = geometry.vertices[face.c];

      v.x = (a.x + b.x + c.x) / 3;
      v.y = (a.y + b.y + c.y) / 3;
      v.z = (a.z + b.z + c.z) / 3;

      return v;
    }
  })()
};
THREE.BAS.ModelBufferGeometry = function (model) {
  THREE.BufferGeometry.call(this);

  this.modelGeometry = model;
  this.faceCount = this.modelGeometry.faces.length;
  this.vertexCount = this.modelGeometry.vertices.length;

  this.bufferIndices();
  this.bufferPositions();
};
THREE.BAS.ModelBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
THREE.BAS.ModelBufferGeometry.prototype.constructor = THREE.BAS.ModelBufferGeometry;

THREE.BAS.ModelBufferGeometry.prototype.bufferIndices = function () {
  var indexBuffer = new Uint32Array(this.faceCount * 3);

  this.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

  for (var i = 0, offset = 0; i < this.faceCount; i++, offset += 3) {
    var face = this.modelGeometry.faces[i];

    indexBuffer[offset    ] = face.a;
    indexBuffer[offset + 1] = face.b;
    indexBuffer[offset + 2] = face.c;
  }
};

THREE.BAS.ModelBufferGeometry.prototype.bufferPositions = function() {
  var positionBuffer = this.createAttribute('position', 3).array;

  for (var i = 0, offset = 0; i < this.vertexCount; i++, offset += 3) {
    var vertex = this.modelGeometry.vertices[i];

    positionBuffer[offset    ] = vertex.x;
    positionBuffer[offset + 1] = vertex.y;
    positionBuffer[offset + 2] = vertex.z;
  }
};

THREE.BAS.ModelBufferGeometry.prototype.bufferUVs = function() {
  var uvBuffer = this.createAttribute('uv', 2).array;

  for (var i = 0; i < this.faceCount; i++) {

    var face = this.modelGeometry.faces[i];
    var uv;

    uv = this.modelGeometry.faceVertexUvs[0][i][0];
    uvBuffer[face.a * 2]     = uv.x;
    uvBuffer[face.a * 2 + 1] = uv.y;

    uv = this.modelGeometry.faceVertexUvs[0][i][1];
    uvBuffer[face.b * 2]     = uv.x;
    uvBuffer[face.b * 2 + 1] = uv.y;

    uv = this.modelGeometry.faceVertexUvs[0][i][2];
    uvBuffer[face.c * 2]     = uv.x;
    uvBuffer[face.c * 2 + 1] = uv.y;
  }
};

THREE.BAS.ModelBufferGeometry.prototype.createAttribute = function (name, itemSize) {
  var buffer = new Float32Array(this.vertexCount * itemSize);
  var attribute = new THREE.BufferAttribute(buffer, itemSize);

  this.addAttribute(name, attribute);

  return attribute;
};

THREE.BAS.PrefabBufferGeometry = function (prefab, count) {
  THREE.BufferGeometry.call(this);

  this.prefabGeometry = prefab;
  this.prefabCount = count;
  this.prefabVertexCount = prefab.vertices.length;

  this.bufferIndices();
  this.bufferPositions();
};
THREE.BAS.PrefabBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
THREE.BAS.PrefabBufferGeometry.prototype.constructor = THREE.BAS.PrefabBufferGeometry;

THREE.BAS.PrefabBufferGeometry.prototype.bufferIndices = function () {
  var prefabFaceCount = this.prefabGeometry.faces.length;
  var prefabIndexCount = this.prefabGeometry.faces.length * 3;
  var prefabIndices = [];

  for (var h = 0; h < prefabFaceCount; h++) {
    var face = this.prefabGeometry.faces[h];
    prefabIndices.push(face.a, face.b, face.c);
  }

  var indexBuffer = new Uint32Array(this.prefabCount * prefabIndexCount);

  this.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

  for (var i = 0; i < this.prefabCount; i++) {
    for (var k = 0; k < prefabIndexCount; k++) {
      indexBuffer[i * prefabIndexCount + k] = prefabIndices[k] + i * this.prefabVertexCount;
    }
  }
};

THREE.BAS.PrefabBufferGeometry.prototype.bufferPositions = function() {
  var positionBuffer = this.createAttribute('position', 3).array;

  for (var i = 0, offset = 0; i < this.prefabCount; i++) {
    for (var j = 0; j < this.prefabVertexCount; j++, offset += 3) {
      var prefabVertex = this.prefabGeometry.vertices[j];

      positionBuffer[offset    ] = prefabVertex.x;
      positionBuffer[offset + 1] = prefabVertex.y;
      positionBuffer[offset + 2] = prefabVertex.z;
    }
  }
};

// todo test
THREE.BAS.PrefabBufferGeometry.prototype.bufferUvs = function() {
  var prefabFaceCount = this.prefabGeometry.faces.length;
  var prefabVertexCount = this.prefabVertexCount = this.prefabGeometry.vertices.length;
  var prefabUvs = [];

  for (var h = 0; h < prefabFaceCount; h++) {
    var face = this.prefabGeometry.faces[h];
    var uv = this.prefabGeometry.faceVertexUvs[0][h];

    prefabUvs[face.a] = uv[0];
    prefabUvs[face.b] = uv[1];
    prefabUvs[face.c] = uv[2];
  }

  var uvBuffer = this.createAttribute('uv', 2);

  for (var i = 0, offset = 0; i < this.prefabCount; i++) {
    for (var j = 0; j < prefabVertexCount; j++, offset += 2) {
      var prefabUv = prefabUvs[j];

      uvBuffer.array[offset] = prefabUv.x;
      uvBuffer.array[offset + 1] = prefabUv.y;
    }
  }
};

/**
 * based on BufferGeometry.computeVertexNormals
 * calculate vertex normals for a prefab, and repeat the data in the normal buffer
 */
THREE.BAS.PrefabBufferGeometry.prototype.computeVertexNormals = function () {
  var index = this.index;
  var attributes = this.attributes;
  var positions = attributes.position.array;

  if (attributes.normal === undefined) {
    this.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(positions.length), 3));
  }

  var normals = attributes.normal.array;

  var vA, vB, vC,

  pA = new THREE.Vector3(),
  pB = new THREE.Vector3(),
  pC = new THREE.Vector3(),

  cb = new THREE.Vector3(),
  ab = new THREE.Vector3();

  var indices = index.array;
  var prefabIndexCount = this.prefabGeometry.faces.length * 3;

  for (var i = 0; i < prefabIndexCount; i += 3) {
    vA = indices[i + 0] * 3;
    vB = indices[i + 1] * 3;
    vC = indices[i + 2] * 3;

    pA.fromArray(positions, vA);
    pB.fromArray(positions, vB);
    pC.fromArray(positions, vC);

    cb.subVectors(pC, pB);
    ab.subVectors(pA, pB);
    cb.cross(ab);

    normals[vA] += cb.x;
    normals[vA + 1] += cb.y;
    normals[vA + 2] += cb.z;

    normals[vB] += cb.x;
    normals[vB + 1] += cb.y;
    normals[vB + 2] += cb.z;

    normals[vC] += cb.x;
    normals[vC + 1] += cb.y;
    normals[vC + 2] += cb.z;
  }

  for (var j = 1; j < this.prefabCount; j++) {
    for (var k = 0; k < prefabIndexCount; k++) {
      normals[j * prefabIndexCount + k] = normals[k];
    }
  }

  this.normalizeNormals();

  attributes.normal.needsUpdate = true;
};

THREE.BAS.PrefabBufferGeometry.prototype.createAttribute = function (name, itemSize, factory) {
  var buffer = new Float32Array(this.prefabCount * this.prefabVertexCount * itemSize);
  var attribute = new THREE.BufferAttribute(buffer, itemSize);

  this.addAttribute(name, attribute);

  if (factory) {
    for (var i = 0, offset = 0; i < this.prefabCount; i++) {
      var r = factory(i, this.prefabCount);

      for (var j = 0; j < this.prefabVertexCount; j++) {
        for (var k = 0; k < itemSize; k++) {
          buffer[offset++] = typeof r === 'number' ? r : r[k];
        }
      }
    }
  }

  return attribute;
};

THREE.BAS.PrefabBufferGeometry.prototype.setAttribute4 = function (name, data) {
  var offset = 0;
  var array = this.geometry.attributes[name].array;
  var i, j;

  for (i = 0; i < data.length; i++) {
    var v = data[i];

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x;
      array[offset++] = v.y;
      array[offset++] = v.z;
      array[offset++] = v.w;
    }
  }

  this.geometry.attributes[name].needsUpdate = true;
};
THREE.BAS.PrefabBufferGeometry.prototype.setAttribute3 = function (name, data) {
  var offset = 0;
  var array = this.geometry.attributes[name].array;
  var i, j;

  for (i = 0; i < data.length; i++) {
    var v = data[i];

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x;
      array[offset++] = v.y;
      array[offset++] = v.z;
    }
  }

  this.geometry.attributes[name].needsUpdate = true;
};
THREE.BAS.PrefabBufferGeometry.prototype.setAttribute2 = function (name, data) {
  var offset = 0;
  var array = this.geometry.attributes[name].array;
  var i, j;

  for (i = 0; i < this.prefabCount; i++) {
    var v = data[i];

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x;
      array[offset++] = v.y;
    }
  }

  this.geometry.attributes[name].needsUpdate = true;
};

THREE.BAS.BaseAnimationMaterial = function (parameters) {
  THREE.ShaderMaterial.call(this);

  this.shaderFunctions = [];
  this.shaderParameters = [];
  this.shaderVertexInit = [];
  this.shaderTransformNormal = [];
  this.shaderTransformPosition = [];

  this.setValues(parameters);
};
THREE.BAS.BaseAnimationMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
THREE.BAS.BaseAnimationMaterial.prototype.constructor = THREE.BAS.BaseAnimationMaterial;

// abstract
THREE.BAS.BaseAnimationMaterial.prototype._concatVertexShader = function () {
  return '';
};

THREE.BAS.BaseAnimationMaterial.prototype._concatFunctions = function () {
  return this.shaderFunctions.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatParameters = function () {
  return this.shaderParameters.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatVertexInit = function () {
  return this.shaderVertexInit.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatTransformNormal = function () {
  return this.shaderTransformNormal.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatTransformPosition = function () {
  return this.shaderTransformPosition.join('\n');
};


THREE.BAS.BaseAnimationMaterial.prototype.setUniformValues = function (values) {
  for (var key in values) {
    if (key in this.uniforms) {
      var uniform = this.uniforms[key];
      var value = values[key];

      // todo add matrix uniform types
      switch (uniform.type) {
        case 'c': // color
          uniform.value.set(value);
          break;
        case 'v2': // vectors
        case 'v3':
        case 'v4':
          uniform.value.copy(value);
          break;
        case 'f': // float
        case 't': // texture
        default:
          uniform.value = value;
      }
    }
  }
};

THREE.BAS.BasicAnimationMaterial = function(parameters, uniformValues) {
  THREE.BAS.BaseAnimationMaterial.call(this, parameters);

  var basicShader = THREE.ShaderLib['basic'];

  this.uniforms = THREE.UniformsUtils.merge([basicShader.uniforms, this.uniforms]);
  this.lights = false;
  this.vertexShader = this._concatVertexShader();
  this.fragmentShader = basicShader.fragmentShader;

  // todo add missing default defines
  uniformValues.map && (this.defines['USE_MAP'] = '');
  uniformValues.normalMap && (this.defines['USE_NORMALMAP'] = '');

  this.setUniformValues(uniformValues);
};
THREE.BAS.BasicAnimationMaterial.prototype = Object.create(THREE.BAS.BaseAnimationMaterial.prototype);
THREE.BAS.BasicAnimationMaterial.prototype.constructor = THREE.BAS.BasicAnimationMaterial;

THREE.BAS.BasicAnimationMaterial.prototype._concatVertexShader = function() {
  // based on THREE.ShaderLib.phong
  return [

    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "uv_pars_vertex" ],
    THREE.ShaderChunk[ "uv2_pars_vertex" ],
    THREE.ShaderChunk[ "envmap_pars_vertex" ],
    THREE.ShaderChunk[ "color_pars_vertex" ],
    THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
    THREE.ShaderChunk[ "skinning_pars_vertex" ],
    THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

    this._concatFunctions(),

    this._concatParameters(),

    "void main() {",

    this._concatVertexInit(),

    THREE.ShaderChunk[ "uv_vertex" ],
    THREE.ShaderChunk[ "uv2_vertex" ],
    THREE.ShaderChunk[ "color_vertex" ],
    THREE.ShaderChunk[ "skinbase_vertex" ],

    "	#ifdef USE_ENVMAP",

    THREE.ShaderChunk[ "beginnormal_vertex" ],

    this._concatTransformNormal(),

    THREE.ShaderChunk[ "morphnormal_vertex" ],
    THREE.ShaderChunk[ "skinnormal_vertex" ],
    THREE.ShaderChunk[ "defaultnormal_vertex" ],

    "	#endif",

    THREE.ShaderChunk[ "begin_vertex" ],

    this._concatTransformPosition(),

    THREE.ShaderChunk[ "morphtarget_vertex" ],
    THREE.ShaderChunk[ "skinning_vertex" ],
    THREE.ShaderChunk[ "project_vertex" ],
    THREE.ShaderChunk[ "logdepthbuf_vertex" ],

    THREE.ShaderChunk[ "worldpos_vertex" ],
    THREE.ShaderChunk[ "envmap_vertex" ],

    "}"

  ].join( "\n" );
};

THREE.BAS.PhongAnimationMaterial = function(parameters, uniformValues) {
    THREE.BAS.BaseAnimationMaterial.call(this, parameters);

    var phongShader = THREE.ShaderLib['phong'];

    this.uniforms = THREE.UniformsUtils.merge([phongShader.uniforms, this.uniforms]);
    this.lights = true;
    this.vertexShader = this._concatVertexShader();
    this.fragmentShader = phongShader.fragmentShader;

    // todo add missing default defines
    uniformValues.map && (this.defines['USE_MAP'] = '');
    uniformValues.normalMap && (this.defines['USE_NORMALMAP'] = '');

    this.setUniformValues(uniformValues);
};
THREE.BAS.PhongAnimationMaterial.prototype = Object.create(THREE.BAS.BaseAnimationMaterial.prototype);
THREE.BAS.PhongAnimationMaterial.prototype.constructor = THREE.BAS.PhongAnimationMaterial;

THREE.BAS.PhongAnimationMaterial.prototype._concatVertexShader = function() {
    // based on THREE.ShaderLib.phong
    return [
        "#define PHONG",

        "varying vec3 vViewPosition;",

        "#ifndef FLAT_SHADED",

        "	varying vec3 vNormal;",

        "#endif",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "uv_pars_vertex" ],
        THREE.ShaderChunk[ "uv2_pars_vertex" ],
        THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
        THREE.ShaderChunk[ "envmap_pars_vertex" ],
        THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
        THREE.ShaderChunk[ "color_pars_vertex" ],
        THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
        THREE.ShaderChunk[ "skinning_pars_vertex" ],
        THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

        this._concatFunctions(),

        this._concatParameters(),

        "void main() {",

        this._concatVertexInit(),

        THREE.ShaderChunk[ "uv_vertex" ],
        THREE.ShaderChunk[ "uv2_vertex" ],
        THREE.ShaderChunk[ "color_vertex" ],
        THREE.ShaderChunk[ "beginnormal_vertex" ],

        this._concatTransformNormal(),

        THREE.ShaderChunk[ "morphnormal_vertex" ],
        THREE.ShaderChunk[ "skinbase_vertex" ],
        THREE.ShaderChunk[ "skinnormal_vertex" ],
        THREE.ShaderChunk[ "defaultnormal_vertex" ],

        "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

        "	vNormal = normalize( transformedNormal );",

        "#endif",

        THREE.ShaderChunk[ "begin_vertex" ],

        this._concatTransformPosition(),

        THREE.ShaderChunk[ "displacementmap_vertex" ],
        THREE.ShaderChunk[ "morphtarget_vertex" ],
        THREE.ShaderChunk[ "skinning_vertex" ],
        THREE.ShaderChunk[ "project_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_vertex" ],

        "	vViewPosition = - mvPosition.xyz;",

        THREE.ShaderChunk[ "worldpos_vertex" ],
        THREE.ShaderChunk[ "envmap_vertex" ],
        THREE.ShaderChunk[ "lights_phong_vertex" ],
        THREE.ShaderChunk[ "shadowmap_vertex" ],

        "}"

    ].join( "\n" );
};