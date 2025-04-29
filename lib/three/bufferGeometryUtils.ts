import * as THREE from 'three';

/**
 * Custom implementation of BufferGeometryUtils
 * Inspired by three.js/examples/jsm/utils/BufferGeometryUtils.js
 */
export class BufferGeometryUtils {
  /**
   * Merges multiple BufferGeometries into one
   */
  static mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    // Validate input
    if (!geometries || geometries.length < 1) {
      return new THREE.BufferGeometry();
    }
    
    if (geometries.length === 1) {
      return geometries[0].clone();
    }
    
    // Initialize result variables
    let attributesMap: Record<string, {
      array: Float32Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array,
      itemSize: number
    }> = {};
    const mergedGeometry = new THREE.BufferGeometry();
    
    let vertexCount = 0;
    let indexCount = 0;
    
    // Count vertices and indices
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      vertexCount += geometry.attributes.position.count;
      
      if (geometry.index) {
        indexCount += geometry.index.count;
      }
    }
    
    // Process non-indexed geometries
    let hasIndex = geometries[0].index !== null;
    
    // Create attributes
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const geometryAttributes = geometry.attributes;
      
      // Validate attributes match across geometries
      if (i === 0) {
        // Initialize attribute object
        for (const name in geometryAttributes) {
          const attribute = geometryAttributes[name];
          const itemSize = attribute.itemSize;
          
          // Create appropriate typed array based on attribute's array type
          let array;
          if (attribute.array instanceof Float32Array) {
            array = new Float32Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Int8Array) {
            array = new Int8Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Int16Array) {
            array = new Int16Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Int32Array) {
            array = new Int32Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Uint8Array) {
            array = new Uint8Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Uint16Array) {
            array = new Uint16Array(vertexCount * itemSize);
          } else if (attribute.array instanceof Uint32Array) {
            array = new Uint32Array(vertexCount * itemSize);
          } else {
            // Default to Float32Array if type is not recognized
            array = new Float32Array(vertexCount * itemSize);
          }
          
          attributesMap[name] = {
            itemSize,
            array
          };
        }
      } else {
        // Check if attribute types and itemSize match
        for (const name in geometryAttributes) {
          if (!attributesMap[name]) {
            console.error('Non-matching attributes in geometries');
            return new THREE.BufferGeometry();
          }
        }
      }
      
      // Ensure all geometries have the same indexing
      if (hasIndex !== (geometry.index !== null)) {
        console.error('Non-matching index state in geometries');
        return new THREE.BufferGeometry();
      }
    }
    
    // Merge non-indexed geometries
    let offset = 0;
    const indexOffset = [];
    let attributeOffset = 0;
    
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const geometryAttributes = geometry.attributes;
      
      // Copy attribute data
      for (const name in geometryAttributes) {
        const attribute = geometryAttributes[name];
        const targetAttribute = attributesMap[name];
        const itemSize = attribute.itemSize;
        
        for (let j = 0; j < attribute.count; j++) {
          for (let k = 0; k < itemSize; k++) {
            targetAttribute.array[attributeOffset + j * itemSize + k] = attribute.array[j * itemSize + k];
          }
        }
      }
      
      attributeOffset += geometryAttributes.position.count * geometryAttributes.position.itemSize;
      indexOffset.push(offset);
      offset += geometryAttributes.position.count;
    }
    
    // Create merged geometry
    for (const name in attributesMap) {
      const data = attributesMap[name];
      mergedGeometry.setAttribute(
        name,
        new THREE.BufferAttribute(data.array, data.itemSize)
      );
    }
    
    // Merge indices if geometries are indexed
    if (hasIndex) {
      let indexArray = new Uint32Array(indexCount);
      let indexOffset = 0;
      let vertexOffset = 0;
      
      for (let i = 0; i < geometries.length; i++) {
        const geometry = geometries[i];
        const index = geometry.index;
        
        if (index) {
          for (let j = 0; j < index.count; j++) {
            indexArray[indexOffset++] = index.array[j] + vertexOffset;
          }
        }
        
        vertexOffset += geometry.attributes.position.count;
      }
      
      mergedGeometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
    }
    
    // Merge morph attributes if present
    // (simplified version, would need to be expanded for full support)
    if (geometries[0].morphAttributes) {
      const morphAttributes = {};
      const morphTargetsRelative = geometries[0].morphTargetsRelative;
      
      mergedGeometry.morphTargetsRelative = morphTargetsRelative;
    }
    
    // Merge groups if present
    let groupOffset = 0;
    
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const groups = geometry.groups;
      
      if (groups && groups.length > 0) {
        for (let j = 0; j < groups.length; j++) {
          const group = groups[j];
          mergedGeometry.addGroup(
            group.start + groupOffset,
            group.count,
            group.materialIndex
          );
        }
      } else {
        const start = groupOffset;
        const count = geometry.attributes.position.count;
        mergedGeometry.addGroup(start, count, 0);
      }
      
      groupOffset += geometry.attributes.position.count;
    }
    
    // Update bounding info
    mergedGeometry.computeBoundingSphere();
    mergedGeometry.computeBoundingBox();
    
    return mergedGeometry;
  }
} 