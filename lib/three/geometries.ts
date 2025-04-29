import * as THREE from '@/lib/three/module-fix';
import { EntityType } from '../state/entityTypes';
import { BufferGeometryUtils } from './bufferGeometryUtils';

/**
 * Cache for geometries to avoid recreating them
 */
const geometryCache: Record<string, THREE.BufferGeometry> = {};

/**
 * Get drone geometry
 */
export function getDroneGeometry(detailLevel: 'high' | 'medium' | 'low' = 'medium'): THREE.BufferGeometry {
  const cacheKey = `drone_${detailLevel}`;
  
  if (geometryCache[cacheKey]) {
    return geometryCache[cacheKey];
  }
  
  let geometry: THREE.BufferGeometry;
  
  switch (detailLevel) {
    case 'high':
      // Detailed drone model
      const bodyRadius = 1;
      const bodyHeight = 0.5;
      const armLength = 2;
      const propRadius = 0.6;
      
      // Create body
      const body = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
      body.translate(0, 0, 0);
      
      // Create arms
      const arm = new THREE.BoxGeometry(armLength, 0.2, 0.2);
      arm.translate(armLength / 2, 0, 0);
      
      // Create propellers
      const propeller = new THREE.CylinderGeometry(propRadius, propRadius, 0.1, 16);
      propeller.rotateX(Math.PI / 2);
      
      // Position the meshes
      const arm1 = arm.clone();
      const arm2 = arm.clone();
      const arm3 = arm.clone();
      const arm4 = arm.clone();
      
      arm1.rotateY(0);
      arm2.rotateY(Math.PI / 2);
      arm3.rotateY(Math.PI);
      arm4.rotateY(-Math.PI / 2);
      
      const prop1 = propeller.clone();
      const prop2 = propeller.clone();
      const prop3 = propeller.clone();
      const prop4 = propeller.clone();
      
      prop1.translate(armLength, 0, 0);
      prop2.translate(0, 0, armLength);
      prop3.translate(-armLength, 0, 0);
      prop4.translate(0, 0, -armLength);
      
      // Combine geometries
      const droneGeometry = BufferGeometryUtils.mergeBufferGeometries([
        body, arm1, arm2, arm3, arm4, prop1, prop2, prop3, prop4
      ]);
      
      geometry = droneGeometry;
      break;
      
    case 'medium':
      // Simpler drone model
      const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 8);
      const armGeo = new THREE.BoxGeometry(3, 0.2, 0.2);
      
      // Combine geometries
      const mediumDrone = BufferGeometryUtils.mergeBufferGeometries([
        bodyGeo,
        armGeo.clone().rotateY(0),
        armGeo.clone().rotateY(Math.PI / 2)
      ]);
      
      geometry = mediumDrone;
      break;
      
    case 'low':
      // Simple box representation
      geometry = new THREE.BoxGeometry(2, 0.4, 2);
      break;
  }
  
  // Cache the geometry
  geometryCache[cacheKey] = geometry;
  
  return geometry;
}

/**
 * Get vehicle geometry
 */
export function getVehicleGeometry(detailLevel: 'high' | 'medium' | 'low' = 'medium'): THREE.BufferGeometry {
  const cacheKey = `vehicle_${detailLevel}`;
  
  if (geometryCache[cacheKey]) {
    return geometryCache[cacheKey];
  }
  
  let geometry: THREE.BufferGeometry;
  
  switch (detailLevel) {
    case 'high':
      // Detailed vehicle model
      const body = new THREE.BoxGeometry(4, 1.5, 2);
      body.translate(0, 0.75, 0);
      
      const cabin = new THREE.BoxGeometry(2, 1, 1.8);
      cabin.translate(0.5, 1.75, 0);
      
      const wheel1 = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
      wheel1.rotateX(Math.PI / 2);
      wheel1.translate(1.5, 0.5, 1);
      
      const wheel2 = wheel1.clone();
      wheel2.translate(-3, 0, 0);
      
      const wheel3 = wheel1.clone();
      wheel3.translate(0, 0, -2);
      
      const wheel4 = wheel2.clone();
      wheel4.translate(0, 0, -2);
      
      // Combine geometries
      const vehicleGeometry = BufferGeometryUtils.mergeBufferGeometries([
        body, cabin, wheel1, wheel2, wheel3, wheel4
      ]);
      
      geometry = vehicleGeometry;
      break;
      
    case 'medium':
      // Simpler vehicle model
      const bodyGeo = new THREE.BoxGeometry(4, 1.5, 2);
      bodyGeo.translate(0, 0.75, 0);
      
      const cabinGeo = new THREE.BoxGeometry(2, 1, 1.8);
      cabinGeo.translate(0.5, 1.75, 0);
      
      // Combine geometries
      const mediumVehicle = BufferGeometryUtils.mergeBufferGeometries([
        bodyGeo, cabinGeo
      ]);
      
      geometry = mediumVehicle;
      break;
      
    case 'low':
      // Simple box representation
      geometry = new THREE.BoxGeometry(4, 1.5, 2);
      geometry.translate(0, 0.75, 0);
      break;
  }
  
  // Cache the geometry
  geometryCache[cacheKey] = geometry;
  
  return geometry;
}

/**
 * Get stationary entity geometry
 */
export function getStationaryGeometry(detailLevel: 'high' | 'medium' | 'low' = 'medium'): THREE.BufferGeometry {
  const cacheKey = `stationary_${detailLevel}`;
  
  if (geometryCache[cacheKey]) {
    return geometryCache[cacheKey];
  }
  
  let geometry: THREE.BufferGeometry;
  
  switch (detailLevel) {
    case 'high':
      // Detailed stationary model
      const base = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
      base.translate(0, 0.25, 0);
      
      const tower = new THREE.CylinderGeometry(0.5, 0.8, 3, 16);
      tower.translate(0, 2, 0);
      
      const antenna = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
      antenna.translate(0, 4.5, 0);
      
      // Combine geometries
      const stationaryGeometry = BufferGeometryUtils.mergeBufferGeometries([
        base, tower, antenna
      ]);
      
      geometry = stationaryGeometry;
      break;
      
    case 'medium':
      // Simpler stationary model
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 10);
      baseGeo.translate(0, 0.25, 0);
      
      const towerGeo = new THREE.CylinderGeometry(0.5, 0.8, 3, 10);
      towerGeo.translate(0, 2, 0);
      
      // Combine geometries
      const mediumStationary = BufferGeometryUtils.mergeBufferGeometries([
        baseGeo, towerGeo
      ]);
      
      geometry = mediumStationary;
      break;
      
    case 'low':
      // Simple cylinder representation
      geometry = new THREE.CylinderGeometry(1, 1, 3, 8);
      geometry.translate(0, 1.5, 0);
      break;
  }
  
  // Cache the geometry
  geometryCache[cacheKey] = geometry;
  
  return geometry;
}

/**
 * Get geometry for entity type
 */
export function getGeometryForEntityType(
  type: EntityType,
  detailLevel: 'high' | 'medium' | 'low' = 'medium'
): THREE.BufferGeometry {
  switch (type) {
    case EntityType.DRONE:
      return getDroneGeometry(detailLevel);
    case EntityType.VEHICLE:
      return getVehicleGeometry(detailLevel);
    case EntityType.STATIONARY:
      return getStationaryGeometry(detailLevel);
    default:
      // Fallback to simple sphere
      return new THREE.SphereGeometry(1, 16, 16);
  }
}

/**
 * Create trajectory line geometry
 */
export function createTrajectoryLineGeometry(points: THREE.Vector3[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  return geometry;
}

/**
 * Create terrain geometry
 */
export function createTerrainGeometry(
  width: number,
  height: number,
  resolution: number,
  heightData: number[][]
): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    resolution - 1,
    resolution - 1
  );
  
  // Rotate to be horizontal
  geometry.rotateX(-Math.PI / 2);
  
  // Update vertex heights
  const positions = geometry.attributes.position.array;
  
  for (let i = 0, j = 0; i < positions.length; i += 3, j++) {
    const x = Math.floor((j % resolution) / resolution * heightData.length);
    const z = Math.floor(Math.floor(j / resolution) / resolution * heightData[0].length);
    
    if (heightData[x] && heightData[x][z] !== undefined) {
      // Set Y position (height)
      positions[i + 1] = heightData[x][z];
    }
  }
  
  // Update normals
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Create grid geometry
 */
export function createGridGeometry(
  size: number,
  divisions: number,
  color1 = 0x888888,
  color2 = 0x888888
): THREE.GridHelper {
  return new THREE.GridHelper(size, divisions, color1, color2);
} 