import * as THREE from 'three';

/**
 * Collection of shader-based effects for entity visualization
 */
export class ShaderEffects {
  /**
   * Creates a glowing outline effect shader material
   * @param color The color of the glow effect
   * @param intensity The intensity of the glow
   * @returns ShaderMaterial for the glow effect
   */
  static createGlowMaterial(color: THREE.Color | string = '#00ffff', intensity: number = 1.5): THREE.Material {
    try {
      const glowColor = color instanceof THREE.Color ? color : new THREE.Color(color);
      
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: glowColor },
          intensity: { value: intensity },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float intensity;
          uniform float time;
          
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          
          void main() {
            float rim = smoothstep(0.0, 1.0, 1.0 - dot(normalize(vViewPosition), vNormal));
            rim = pow(rim, 2.0) * intensity * (0.8 + 0.2 * sin(time * 2.0));
            
            gl_FragColor = vec4(color * rim, rim);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } catch (e) {
      console.error('Error creating glow material:', e);
      // Fallback to basic material if shader creation fails
      return new THREE.MeshBasicMaterial({ 
        color: color instanceof THREE.Color ? color : new THREE.Color(color),
        transparent: true,
        opacity: 0.5,
        side: THREE.BackSide 
      });
    }
  }
  
  /**
   * Creates a pulsing highlight effect for selected entities
   * @param color The base color of the highlight
   * @param pulseSpeed The speed of the pulsing effect (Hz)
   * @returns ShaderMaterial for the pulsing effect
   */
  static createPulsingHighlightMaterial(color: THREE.Color | string = '#ffff00', pulseSpeed: number = 1.0): THREE.Material {
    try {
      const highlightColor = color instanceof THREE.Color ? color : new THREE.Color(color);
      
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: highlightColor },
          pulseSpeed: { value: pulseSpeed },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float pulseSpeed;
          uniform float time;
          
          varying vec2 vUv;
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            float pulse = 0.5 + 0.5 * sin(time * pulseSpeed);
            float alpha = smoothstep(0.5 * pulse, 0.0, dist);
            
            gl_FragColor = vec4(color, alpha * 0.7);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
    } catch (e) {
      console.error('Error creating pulsing highlight material:', e);
      // Fallback to basic material if shader creation fails
      return new THREE.MeshBasicMaterial({ 
        color: color instanceof THREE.Color ? color : new THREE.Color(color),
        transparent: true,
        opacity: 0.5 
      });
    }
  }
  
  /**
   * Creates a trajectory line shader material with animated flow effect
   * @param color The color of the trajectory
   * @param speed The speed of the animation
   * @returns ShaderMaterial for the animated trajectory
   */
  static createTrajectoryMaterial(color: THREE.Color | string = '#0088ff', speed: number = 1.0): THREE.Material {
    try {
      const lineColor = color instanceof THREE.Color ? color : new THREE.Color(color);
      
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: lineColor },
          speed: { value: speed },
          time: { value: 0 },
          dashSize: { value: 0.25 },
          gapSize: { value: 0.1 }
        },
        vertexShader: `
          uniform float time;
          uniform float speed;
          
          attribute float lineDistance;
          
          varying float vLineDistance;
          
          void main() {
            vLineDistance = lineDistance;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          uniform float speed;
          uniform float dashSize;
          uniform float gapSize;
          
          varying float vLineDistance;
          
          void main() {
            float totalSize = dashSize + gapSize;
            float modulo = mod(vLineDistance + time * speed, totalSize);
            float intensity = step(modulo, dashSize) * (1.0 - modulo / dashSize * 0.5);
            
            gl_FragColor = vec4(color, intensity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } catch (e) {
      console.error('Error creating trajectory material:', e);
      // Fallback to basic material if shader creation fails
      return new THREE.LineBasicMaterial({ 
        color: color instanceof THREE.Color ? color : new THREE.Color(color),
        transparent: true,
        opacity: 0.7
      });
    }
  }
  
  /**
   * Creates a status indicator material with animated rings
   * @param color The color of the status indicator
   * @param intensity The intensity of the effect
   * @returns ShaderMaterial for the status indicator
   */
  static createStatusIndicatorMaterial(color: THREE.Color | string = '#00ff00', intensity: number = 1.0): THREE.Material {
    try {
      const indicatorColor = color instanceof THREE.Color ? color : new THREE.Color(color);
      
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: indicatorColor },
          intensity: { value: intensity },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float intensity;
          uniform float time;
          
          varying vec2 vUv;
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            
            // Create multiple rings
            float ring1 = 1.0 - smoothstep(0.45, 0.55, dist);
            float ring2 = smoothstep(0.35, 0.45, dist) - smoothstep(0.45, 0.55, dist);
            float ring3 = 1.0 - smoothstep(0.15, 0.25, abs(dist - 0.35 - 0.1 * sin(time * 2.0)));
            
            float alpha = max(ring1 * 0.2, max(ring2 * 0.4, ring3 * 0.7)) * intensity;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
    } catch (e) {
      console.error('Error creating status indicator material:', e);
      // Fallback to basic material if shader creation fails
      return new THREE.MeshBasicMaterial({ 
        color: color instanceof THREE.Color ? color : new THREE.Color(color),
        transparent: true,
        opacity: 0.7
      });
    }
  }
  
  /**
   * Updates the time uniform for all animated shader materials
   * @param materials Array of shader materials to update
   * @param deltaTime Time since last update in seconds
   */
  static updateMaterials(materials: THREE.ShaderMaterial[], deltaTime: number): void {
    materials.forEach(material => {
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value += deltaTime;
      }
    });
  }
  
  /**
   * Creates a safe shader material with fallbacks
   * @param config Configuration for the shader material
   * @returns ShaderMaterial or fallback material
   */
  static createSafeShaderMaterial(config: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: { [key: string]: { value: any } };
    transparent?: boolean;
    side?: THREE.Side;
    blending?: THREE.Blending;
    depthWrite?: boolean;
    fallbackColor?: THREE.Color | string;
  }): THREE.Material {
    try {
      return new THREE.ShaderMaterial({
        vertexShader: config.vertexShader,
        fragmentShader: config.fragmentShader,
        uniforms: config.uniforms,
        transparent: config.transparent !== undefined ? config.transparent : true,
        side: config.side || THREE.FrontSide,
        blending: config.blending || THREE.NormalBlending,
        depthWrite: config.depthWrite !== undefined ? config.depthWrite : true
      });
    } catch (e) {
      console.error('Error creating shader material:', e);
      // Fallback to basic material
      const fallbackColor = config.fallbackColor || '#ffffff';
      return new THREE.MeshBasicMaterial({
        color: fallbackColor instanceof THREE.Color ? fallbackColor : new THREE.Color(fallbackColor),
        transparent: config.transparent,
        side: config.side,
        depthWrite: config.depthWrite
      });
    }
  }
} 