import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

export interface DigitalEarthProps {
    /** Radius of the earth sphere. Default: 1.8 */
    size?: number;
    /** URL for the day texture */
    dayTexture: string;
    /** URL for the night texture */
    nightTexture: string;
    /** Rotation speed (radians per frame). Default: 0.001 */
    rotationSpeed?: number;
    /** Manual sun direction [x, y, z]. If not provided, calculated from real-time UTC. */
    sunDirection?: [number, number, number];
    /** Whether to auto-rotate the earth. Default: true */
    autoRotate?: boolean;

    // Light & Brightness
    /** Intensity of city lights on the night side. Default: 1.5 */
    nightLightIntensity?: number;
    /** Range for day/night blending smoothstep. Default: [-0.5, 0.5] */
    dayNightBlendRange?: [number, number];
    /** Range for twilight transition (city lights fade). Default: [-0.1, 0.0] */
    twilightRange?: [number, number];

    // Atmosphere
    /** Overall atmosphere intensity. Default: 0.6 */
    atmosphereIntensity?: number;
    /** Atmosphere color as RGB values (0-1). Default: [0.4, 0.6, 1.0] */
    atmosphereColor?: [number, number, number];
    /** Power for Fresnel effect (higher = sharper edge glow). Default: 3.0 */
    atmospherePower?: number;
    /** Boost factor for atmosphere on the day side. Default: 0.5 */
    dayAtmosphereBoost?: number;

    // Astronomical
    /** Sun elevation angle (Y component). Default: 0.2 */
    sunElevation?: number;
    /** Time offset in hours from UTC. Default: 0 */
    timeOffset?: number;

    // Geometry
    /** Number of segments for sphere geometry (higher = smoother). Default: 64 */
    segments?: number;
}

// Vertex Shader
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

// Fragment Shader
const fragmentShader = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform vec3 sunDirection;
uniform float nightLightIntensity;
uniform vec2 dayNightBlendRange;
uniform vec2 twilightRange;
uniform float atmosphereIntensity;
uniform vec3 atmosphereColor;
uniform float atmospherePower;
uniform float dayAtmosphereBoost;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(sunDirection);

    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;

    // Sun orientation calculation
    float sunOrientation = dot(normal, sunDir);
    
    // Smooth blending between day and night
    float dayMix = smoothstep(dayNightBlendRange.x, dayNightBlendRange.y, sunOrientation);

    // Night lights logic: mask out lights on the day side
    float nightMask = 1.0 - smoothstep(twilightRange.x, twilightRange.y, sunOrientation);
    vec3 finalNightColor = nightColor * nightLightIntensity * nightMask;

    // Mix day and night
    vec3 earthColor = mix(finalNightColor, dayColor, dayMix);

    // Atmosphere Effect (Fresnel)
    float rim = 1.0 - dot(viewDir, normal);
    rim = pow(rim, atmospherePower);
    
    // Atmosphere intensity based on sun direction (brighter on day side)
    float intensityFactor = dayAtmosphereBoost + (1.0 - dayAtmosphereBoost) * dayMix;
    float finalAtmosphereIntensity = rim * atmosphereIntensity * intensityFactor;
    
    earthColor += atmosphereColor * finalAtmosphereIntensity;

    gl_FragColor = vec4(earthColor, 1.0);
}
`;

export const DigitalEarth = ({
    size = 1.8,
    dayTexture,
    nightTexture,
    rotationSpeed = 0.001,
    sunDirection,
    autoRotate = true,
    // Light & Brightness
    nightLightIntensity = 1.5,
    dayNightBlendRange = [-0.5, 0.5],
    twilightRange = [-0.1, 0.0],
    // Atmosphere
    atmosphereIntensity = 0.6,
    atmosphereColor = [0.4, 0.6, 1.0],
    atmospherePower = 3.0,
    dayAtmosphereBoost = 0.5,
    // Astronomical
    sunElevation = 0.2,
    timeOffset = 0,
    // Geometry
    segments = 64,
}: DigitalEarthProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [day, night] = useLoader(THREE.TextureLoader, [dayTexture, nightTexture]);

    const uniforms = useMemo(() => ({
        dayTexture: { value: day },
        nightTexture: { value: night },
        sunDirection: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
        nightLightIntensity: { value: nightLightIntensity },
        dayNightBlendRange: { value: new THREE.Vector2(dayNightBlendRange[0], dayNightBlendRange[1]) },
        twilightRange: { value: new THREE.Vector2(twilightRange[0], twilightRange[1]) },
        atmosphereIntensity: { value: atmosphereIntensity },
        atmosphereColor: { value: new THREE.Vector3(atmosphereColor[0], atmosphereColor[1], atmosphereColor[2]) },
        atmospherePower: { value: atmospherePower },
        dayAtmosphereBoost: { value: dayAtmosphereBoost },
    }), [day, night, nightLightIntensity, dayNightBlendRange, twilightRange, atmosphereIntensity, atmosphereColor, atmospherePower, dayAtmosphereBoost]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Auto Rotation
        if (autoRotate) {
            meshRef.current.rotation.y += rotationSpeed;
        }

        // Sun Direction Logic
        if (sunDirection) {
            // Manual override
            uniforms.sunDirection.value.set(...sunDirection).normalize();
        } else {
            // Real-time calculation
            const now = new Date();
            // Calculate UTC hours (decimal) with time offset
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + timeOffset;

            // Earth rotates 15 degrees per hour.
            // We need to calculate the sun's longitude relative to the earth's rotation.
            // Offset to align textures correctly (Greenwich meridian)
            const offset = Math.PI / 2;
            const sunLong = -(utcHours - 12) * 15 * (Math.PI / 180) + offset;

            // The sun angle `theta` depends on the time AND the current rotation of the mesh.
            const theta = sunLong + meshRef.current.rotation.y;

            const sunDir = new THREE.Vector3(
                Math.sin(theta),
                sunElevation,
                Math.cos(theta)
            ).normalize();

            uniforms.sunDirection.value.copy(sunDir);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[size, segments, segments]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};
