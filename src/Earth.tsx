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
    float dayMix = smoothstep(-0.5, 0.5, sunOrientation);

    // Night lights logic: mask out lights on the day side
    float nightMask = 1.0 - smoothstep(-0.1, 0.0, sunOrientation);
    vec3 finalNightColor = nightColor * 1.5 * nightMask;

    // Mix day and night
    vec3 earthColor = mix(finalNightColor, dayColor, dayMix);

    // Atmosphere Effect (Fresnel)
    float rim = 1.0 - dot(viewDir, normal);
    rim = pow(rim, 3.0);
    vec3 atmosphereColor = vec3(0.4, 0.6, 1.0);
    
    // Atmosphere intensity based on sun direction (brighter on day side)
    float intensityFactor = 0.5 + 0.5 * dayMix;
    float atmosphereIntensity = rim * 0.6 * intensityFactor;
    
    earthColor += atmosphereColor * atmosphereIntensity;

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
}: DigitalEarthProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [day, night] = useLoader(THREE.TextureLoader, [dayTexture, nightTexture]);

    const uniforms = useMemo(() => ({
        dayTexture: { value: day },
        nightTexture: { value: night },
        sunDirection: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
    }), [day, night]);

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
            // Calculate UTC hours (decimal)
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;

            // Earth rotates 15 degrees per hour.
            // We need to calculate the sun's longitude relative to the earth's rotation.
            // Offset to align textures correctly (Greenwich meridian)
            const offset = Math.PI / 2;
            const sunLong = -(utcHours - 12) * 15 * (Math.PI / 180) + offset;

            // Adjust for current earth rotation to keep sun fixed relative to the viewer/stars
            // or relative to the earth surface? 
            // In this shader, sunDirection is in World Space.
            // If the mesh rotates, the normal rotates with it.
            // So we need the sun position in World Space.

            // Actually, for a "Digital Twin" where we want to see "current time at texture coordinate",
            // we usually rotate the earth mesh to match the current time, OR we rotate the sun around it.
            // Here, we are rotating the mesh (autoRotate).
            // To simulate "real time", the relationship between texture UV and Sun Vector must match reality.

            // Simplified approach:
            // The sun stays relatively fixed in the sky (let's say +Z or whatever).
            // The earth rotates.
            // But we want to match specific UTC time.

            // Let's stick to the logic that worked in the blog post:
            // The sun angle `theta` depends on the time AND the current rotation of the mesh.
            const theta = sunLong + meshRef.current.rotation.y;

            const sunDir = new THREE.Vector3(
                Math.sin(theta),
                0.2, // Slight tilt
                Math.cos(theta)
            ).normalize();

            uniforms.sunDirection.value.copy(sunDir);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[size, 64, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};
