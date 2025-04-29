import * as THREE from '@/lib/three/module-fix';

/**
 * Custom implementation of BufferGeometryUtils for this project
 */
export class BufferGeometryUtils {
  /**
   * Merges multiple BufferGeometry instances into one
   */
  static mergeBufferGeometries(
    geometries: THREE.BufferGeometry[],
    useGroups = false
  ): THREE.BufferGeometry {
    if (geometries.length < 1) {
      throw new Error('BufferGeometryUtils: No geometries provided for merge');
    }

    if (geometries.length === 1) {
      return geometries[0].clone();
    }

    let isIndexed = geometries[0].index !== null;
    const attributesUsed = new Set(Object.keys(geometries[0].attributes));
    const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
    const attributes: Record<string, THREE.BufferAttribute[]> = {};
    const morphAttributes: Record<string, THREE.BufferAttribute[][]> = {};
    const morphTargetsRelative = geometries[0].morphTargetsRelative;
    const mergedGeometry = new THREE.BufferGeometry();
    let offset = 0;

    // Ensure all geometries match in their attributes and index state
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const geometryAttributes = geometry.attributes;

      // Validate index state consistency
      if (isIndexed !== (geometry.index !== null)) {
        console.error('BufferGeometryUtils: Inconsistent use of indices across geometries');
        return new THREE.BufferGeometry();
      }

      // Validate attribute consistency
      for (const name in geometryAttributes) {
        if (!attributesUsed.has(name)) {
          console.error(`BufferGeometryUtils: Attribute '${name}' not present in all geometries`);
          return new THREE.BufferGeometry();
        }
      }

      // Validate that all required attributes are present
      for (const name of attributesUsed) {
        if (!(name in geometryAttributes)) {
          console.error(`BufferGeometryUtils: Attribute '${name}' missing from geometry ${i}`);
          return new THREE.BufferGeometry();
        }
      }

      // Setup attributes array if it doesn't exist yet
      for (const name of attributesUsed) {
        if (!attributes[name]) {
          attributes[name] = [];
        }
        
        // We only support non-interleaved attributes for merging
        const attr = geometryAttributes[name as keyof typeof geometryAttributes];
        if (attr instanceof THREE.InterleavedBufferAttribute) {
          console.error('BufferGeometryUtils: InterleavedBufferAttribute not supported for merging');
          return new THREE.BufferGeometry();
        }
        attributes[name].push(attr as THREE.BufferAttribute);
      }

      // Handle morph attributes
      if (morphTargetsRelative !== geometry.morphTargetsRelative) {
        console.error('BufferGeometryUtils: Inconsistent morphTargetsRelative values');
        return new THREE.BufferGeometry();
      }

      for (const name in geometry.morphAttributes) {
        if (!morphAttributesUsed.has(name)) {
          console.error(`BufferGeometryUtils: Morph attribute '${name}' not present in all geometries`);
          return new THREE.BufferGeometry();
        }
      }

      for (const name of morphAttributesUsed) {
        if (!morphAttributes[name]) {
          morphAttributes[name] = [];
        }
        
        const morphAttr = geometry.morphAttributes[name as keyof typeof geometry.morphAttributes] || [];
        // Ensure morphAttributes are convertible to BufferAttribute[]
        const bufferMorphAttrs: THREE.BufferAttribute[] = [];
        
        for (let j = 0; j < morphAttr.length; j++) {
          const attr = morphAttr[j];
          if (attr instanceof THREE.InterleavedBufferAttribute) {
            console.error('BufferGeometryUtils: InterleavedBufferAttribute not supported for morphAttributes');
            return new THREE.BufferGeometry();
          }
          bufferMorphAttrs.push(attr as THREE.BufferAttribute);
        }
        
        morphAttributes[name].push(bufferMorphAttrs);
      }

      // Track offset for groups
      if (useGroups) {
        let count: number;
        if (isIndexed) {
          count = geometry.index!.count;
        } else if (geometry.attributes.position) {
          count = geometry.attributes.position.count;
        } else {
          console.error('BufferGeometryUtils: No position attribute found');
          return new THREE.BufferGeometry();
        }

        mergedGeometry.addGroup(offset, count, i);
        offset += count;
      }
    }

    // Merge attributes
    for (const name in attributes) {
      const mergedAttribute = this.mergeBufferAttributes(attributes[name]);
      if (!mergedAttribute) {
        console.error(`BufferGeometryUtils: Could not merge attribute '${name}'`);
        return new THREE.BufferGeometry();
      }
      mergedGeometry.setAttribute(name, mergedAttribute);
    }

    // Merge morph attributes
    for (const name in morphAttributes) {
      const numMorphTargets = morphAttributes[name][0].length;
      const mergedMorphAttribute: THREE.BufferAttribute[] = [];

      for (let i = 0; i < numMorphTargets; i++) {
        const morphAttributesToMerge: THREE.BufferAttribute[] = [];
        for (let j = 0; j < morphAttributes[name].length; j++) {
          morphAttributesToMerge.push(morphAttributes[name][j][i]);
        }
        
        const mergedMorphAttributeForTarget = this.mergeBufferAttributes(morphAttributesToMerge);
        if (!mergedMorphAttributeForTarget) {
          console.error(`BufferGeometryUtils: Could not merge morph attribute '${name}'`);
          return new THREE.BufferGeometry();
        }
        mergedMorphAttribute.push(mergedMorphAttributeForTarget);
      }

      mergedGeometry.morphAttributes[name as keyof typeof mergedGeometry.morphAttributes] = mergedMorphAttribute;
    }

    // Merge indices
    if (isIndexed) {
      let indexOffset = 0;
      const mergedIndex: number[] = [];

      for (let i = 0; i < geometries.length; i++) {
        const index = geometries[i].index!;
        for (let j = 0; j < index.count; j++) {
          mergedIndex.push(index.getX(j) + indexOffset);
        }
        indexOffset += geometries[i].attributes.position.count;
      }

      mergedGeometry.setIndex(mergedIndex);
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

    let TypedArray: Float32ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor;
    let itemSize: number;
    let normalized: boolean;
    let arrayLength = 0;

    // Determine array type and dimensions from first attribute
    const firstAttribute = attributes[0];
    TypedArray = firstAttribute.array.constructor as any;
    itemSize = firstAttribute.itemSize;
    normalized = firstAttribute.normalized;

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