# React Digital Earth

A realistic, real-time digital twin Earth component for React Three Fiber.
It uses custom shaders to simulate day/night transitions, city lights, and atmospheric scattering based on real-time UTC data.

## Features

- 🌍 **Real-time Day/Night Cycle**: Automatically calculates the sun's position based on UTC time.
- 🌃 **City Lights**: Night side shows city lights that smoothly fade in during twilight.
- ☁️ **Atmosphere**: Fresnel-based atmospheric scattering effect.
- ⚡ **High Performance**: All visual effects are calculated in a single fragment shader pass.

## Installation

### From GitHub (Recommended for now)
Since this package is not yet published to npm, you can install it directly from GitHub:

```bash
npm install github:kairemix/react-digital-earth three @react-three/fiber @react-three/drei
```

### Local Development
To test locally, you can use `npm link` or install from the local path:

```bash
npm install ../path/to/react-digital-earth
```

### From npm (Future)
Once published, you will be able to install it via:

```bash
npm install react-digital-earth three @react-three/fiber @react-three/drei
```

## Usage

You need to provide your own Earth textures (Day and Night). NASA's Visible Earth collection is a great source.

- [Blue Marble (Day)](https://visibleearth.nasa.gov/images/73630/march-blue-marble-next-generation-w-topography-and-bathymetry)
- [Black Marble (Night)](https://earthobservatory.nasa.gov/features/NightLights)

```tsx
import { Canvas } from '@react-three/fiber';
import { DigitalEarth } from 'react-digital-earth';

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.1} />
      <DigitalEarth 
        dayTexture="/path/to/earth_day.jpg"
        nightTexture="/path/to/earth_night.jpg"
      />
    </Canvas>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dayTexture` | `string` | **Required** | URL to the day-side texture image. |
| `nightTexture` | `string` | **Required** | URL to the night-side texture image. |
| `size` | `number` | `1.8` | Radius of the sphere. |
| `rotationSpeed` | `number` | `0.001` | Auto-rotation speed in radians per frame. |
| `autoRotate` | `boolean` | `true` | Whether the earth should rotate automatically. |
| `sunDirection` | `[x, y, z]` | `undefined` | Manually override sun direction vector. If omitted, uses real-time calculation. |

## License

MIT

## Last Updated
2025-12-08
