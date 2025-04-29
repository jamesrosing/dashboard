import * as THREE from 'three';

// Define a type for the possible TypedArray constructors
type TypedArrayConstructor = 
  | Int8ArrayConstructor 
  | Uint8ArrayConstructor 
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

/**
 * Custom implementation of BufferGeometryUtils for the dashboard project
 * Provides utilities for working with Three.js BufferGeometry objects
 */
export class BufferGeometryUtils {
  /**
   * Merges multiple THREE.BufferGeometry instances into one
   * @param geometries - Array of buffer geometries to merge
   * @param useGroups - Whether to create groups in the merged geometry
   * @returns Merged buffer geometry, or null if the input is invalid
   */
  static mergeBufferGeometries(
    geometries: THREE.BufferGeometry[], 
    useGroups: boolean = true
  ): THREE.BufferGeometry | null {
    // Input validation
    if (!geometries || geometries.length < 1) {
      return null;
    }

    if (geometries.length === 1) {
      return geometries[0].clone();
    }

    let isIndexed = true;

    // Check if all geometries are indexed consistently
    for (let i = 0; i < geometries.length; i++) {
      if (!geometries[i].index) {
        isIndexed = false;
        break;
      }
    }

    // Verify attribute consistency when needed
    const geometriesCount = geometries.length;
    const firstGeometry = geometries[0];
    const attributesUsed = new Set(Object.keys(firstGeometry.attributes));
    
    for (let i = 1; i < geometriesCount; i++) {
      const geometry = geometries[i];
      const geometryAttributes = Object.keys(geometry.attributes);
      
      // Check matching attributes
      for (const name of attributesUsed) {
        if (!geometryAttributes.includes(name)) {
          console.error(`Unable to merge: geometry at index ${i} does not have attribute '${name}'`);
          return null;
        }
        
        const attr1 = firstGeometry.attributes[name];
        const attr2 = geometry.attributes[name];
        
        if (attr1.itemSize !== attr2.itemSize) {
          console.error(`Unable to merge: attribute '${name}' has different itemSize`);
          return null;
        }
      }
    }

    // Count vertices and indices
    let vertexCount = 0;
    let indexCount = 0;
    
    for (let i = 0; i < geometriesCount; i++) {
      const geometry = geometries[i];
      vertexCount += geometry.attributes.position.count;
      
      if (isIndexed) {
        indexCount += geometry.index!.count;
      }
    }

    // Create merged geometry
    const mergedGeometry = new THREE.BufferGeometry();
    
    // Process attributes
    for (const name of attributesUsed) {
      const attribute = firstGeometry.attributes[name];
      const itemSize = attribute.itemSize;
      const mergedAttribute = new THREE.BufferAttribute(
        new Float32Array(vertexCount * itemSize), 
        itemSize
      );
      
      let offset = 0;
      
      for (let i = 0; i < geometriesCount; i++) {
        const geometry = geometries[i];
        const geometryAttribute = geometry.attributes[name];
        const attributeArray = geometryAttribute.array;
        
        for (let j = 0; j < attributeArray.length; j++) {
          mergedAttribute.array[offset + j] = attributeArray[j];
        }
        
        offset += attributeArray.length;
      }
      
      mergedGeometry.setAttribute(name, mergedAttribute);
    }

    // Process indices
    if (isIndexed) {
      const indexType = vertexCount > 65535 
        ? Uint32Array 
        : Uint16Array;
      
      const mergedIndices = new indexType(indexCount);
      let indexOffset = 0;
      let vertexOffset = 0;
      
      for (let i = 0; i < geometriesCount; i++) {
        const geometry = geometries[i];
        const index = geometry.index!.array;
        const vertexCount = geometry.attributes.position.count;
        
        for (let j = 0; j < index.length; j++) {
          mergedIndices[indexOffset + j] = index[j] + vertexOffset;
        }
        
        indexOffset += index.length;
        vertexOffset += vertexCount;
      }
      
      mergedGeometry.setIndex(new THREE.BufferAttribute(mergedIndices, 1));
    }

    // Process groups if needed
    if (useGroups) {
      let offset = 0;
      let indexOffset = 0;
      
      for (let i = 0; i < geometriesCount; i++) {
        const geometry = geometries[i];
        
        if (geometry.groups && geometry.groups.length > 0) {
          // Copy groups from the original geometry
          for (let j = 0; j < geometry.groups.length; j++) {
            const group = geometry.groups[j];
            mergedGeometry.addGroup(
              group.start + indexOffset,
              group.count,
              group.materialIndex
            );
          }
        } else if (isIndexed) {
          // Create a new group for the geometry
          mergedGeometry.addGroup(
            indexOffset,
            geometry.index!.count,
            i
          );
        } else {
          // Create a new group for the geometry based on vertex count
          mergedGeometry.addGroup(
            offset,
            geometry.attributes.position.count,
            i
          );
        }
        
        if (isIndexed) {
          indexOffset += geometry.index!.count;
        }
        
        offset += geometry.attributes.position.count;
      }
    }

    // Process morph attributes
    if (firstGeometry.morphAttributes) {
      const morphKeys = Object.keys(firstGeometry.morphAttributes);
      
      if (morphKeys.length > 0) {
        const morphTargets: Record<string, THREE.BufferAttribute> = {};
        
        for (let i = 0; i < morphKeys.length; i++) {
          const morphKey = morphKeys[i];
          const morphAttributeArrays: THREE.BufferAttribute[][] = [];
          let morphAttributeCount = 0;
          
          // Count morphs to create arrays of the right size
          for (let j = 0; j < geometriesCount; j++) {
            const geometry = geometries[j];
            
            if (geometry.morphAttributes && morphKey in geometry.morphAttributes) {
              const morphAttrs = geometry.morphAttributes[morphKey as keyof typeof geometry.morphAttributes];
              if (morphAttrs) {
                morphAttributeCount += morphAttrs.length;
                morphAttributeArrays.push(morphAttrs as THREE.BufferAttribute[]);
              }
            }
          }
          
          // Don't process if no morph attributes for this key
          if (morphAttributeCount === 0) continue;
          
          // Create the morph buffer attribute
          const morphItemSize = morphAttributeArrays[0][0].itemSize;
          const morphAttrLength = morphAttributeArrays[0][0].count * morphItemSize;
          
          const morphArray = new Float32Array(morphAttrLength);
          const morphBufferAttribute = new THREE.BufferAttribute(morphArray, morphItemSize);
          
          // Fill the morph attribute
          for (let j = 0; j < morphAttrLength; j++) {
            let value = 0;
            for (let k = 0; k < morphAttributeArrays.length; k++) {
              if (morphAttributeArrays[k][0]) {
                value += morphAttributeArrays[k][0].array[j];
              }
            }
            morphArray[j] = value;
          }
          
          morphTargets[morphKey] = morphBufferAttribute;
        }
        
        // Assign the morph attributes to the merged geometry
        for (const key in morphTargets) {
          mergedGeometry.morphAttributes[key as keyof typeof mergedGeometry.morphAttributes] = [morphTargets[key]];
        }
      }
    }

    // Update bounding information
    mergedGeometry.computeBoundingSphere();
    mergedGeometry.computeBoundingBox();
    
    return mergedGeometry;
  }

  /**
   * Merge array of buffer attributes
   */
  private static mergeBufferAttributes(
    attributes: THREE.BufferAttribute[]
  ): THREE.BufferAttribute | null {
    if (attributes.length === 0) return null;

    // Keep as let since it's assigned later
    let TypedArray: TypedArrayConstructor;
    const itemSize: number = attributes[0].itemSize;
    const normalized: boolean = attributes[0].normalized;
    let arrayLength = 0;

    // Determine array type and dimensions from first attribute
    const firstAttribute = attributes[0];
    TypedArray = firstAttribute.array.constructor as TypedArrayConstructor;

    // Calculate total array length
    for (let i = 0; i < attributes.length; i++) {
      arrayLength += attributes[i].array.length;
    }

    // Create merged array and fill with data
    const array = new TypedArray(arrayLength);
    let offset = 0;

    for (let i = 0; i < attributes.length; i++) {
      array.set(attributes[i].array, offset);
      offset += attributes[i].array.length;
    }

    // Create and return the merged attribute
    return new THREE.BufferAttribute(array, itemSize, normalized);
  }
} 