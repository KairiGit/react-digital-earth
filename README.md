# React Digital Earth

A realistic, real-time digital twin Earth component for React Three Fiber.
It uses custom shaders to simulate day/night transitions, city lights, and atmospheric scattering based on real-time UTC data.

## Features

- 🌍 **Real-time Day/Night Cycle**: Automatically calculates the sun's position based on UTC time.
- 🌃 **City Lights**: Night side shows city lights that smoothly fade in during twilight.
- ☁️ **Atmosphere**: Fresnel-based atmospheric scattering effect.
- ⚡ **High Performance**: All visual effects are calculated in a single fragment shader pass.
- 🎨 **Highly Customizable**: Fine-tune lighting, atmosphere, and visual parameters to your needs.

## Installation

### From GitHub (Recommended for now)
Since this package is not yet published to npm, you can install it directly from GitHub:

```bash
npm install github:KairiGit/react-digital-earth three @react-three/fiber @react-three/drei
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

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `dayTexture` | `string` | URL to the day-side texture image. |
| `nightTexture` | `string` | URL to the night-side texture image. |

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `1.8` | Radius of the sphere. |
| `rotationSpeed` | `number` | `0.001` | Auto-rotation speed in radians per frame. |
| `autoRotate` | `boolean` | `true` | Whether the earth should rotate automatically. |
| `sunDirection` | `[x, y, z]` | `undefined` | Manually override sun direction vector. If omitted, uses real-time calculation. |

### Light & Brightness Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nightLightIntensity` | `number` | `1.5` | Intensity of city lights on the night side. Higher values make city lights brighter. |
| `dayNightBlendRange` | `[number, number]` | `[-0.5, 0.5]` | Range for day/night blending smoothstep. Affects how gradually day transitions to night. |
| `twilightRange` | `[number, number]` | `[-0.1, 0.0]` | Range for twilight transition where city lights fade in. |

### Atmosphere Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `atmosphereIntensity` | `number` | `0.6` | Overall intensity of the atmospheric glow effect. |
| `atmosphereColor` | `[r, g, b]` | `[0.4, 0.6, 1.0]` | RGB color of the atmosphere (values 0-1). |
| `atmospherePower` | `number` | `3.0` | Power for the Fresnel effect. Higher values create a sharper edge glow. |
| `dayAtmosphereBoost` | `number` | `0.5` | Boost factor for atmosphere brightness on the day side. |

### Astronomical Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sunElevation` | `number` | `0.2` | Sun elevation angle (Y component of sun direction). Simulates seasonal tilt. |
| `timeOffset` | `number` | `0` | Time offset in hours from UTC. Useful for showing different time zones. |

### Geometry Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `segments` | `number` | `64` | Number of segments for sphere geometry. Higher values create a smoother sphere but use more resources. |

## Examples

### Custom Atmosphere (Mars-like)

```tsx
<DigitalEarth
  dayTexture="/mars_day.jpg"
  nightTexture="/mars_night.jpg"
  atmosphereColor={[1.0, 0.4, 0.2]}
  atmosphereIntensity={0.4}
  atmospherePower={2.0}
/>
```

### Bright City Lights

```tsx
<DigitalEarth
  dayTexture="/earth_day.jpg"
  nightTexture="/earth_night.jpg"
  nightLightIntensity={2.5}
  twilightRange={[-0.2, 0.1]}
/>
```

### Fixed Time Zone (Tokyo, UTC+9)

```tsx
<DigitalEarth
  dayTexture="/earth_day.jpg"
  nightTexture="/earth_night.jpg"
  timeOffset={9}
  autoRotate={false}
/>
```

### High-Quality Rendering

```tsx
<DigitalEarth
  dayTexture="/earth_day_8k.jpg"
  nightTexture="/earth_night_8k.jpg"
  segments={128}
/>
```

## Development

### Setup

```bash
git clone https://github.com/KairiGit/react-digital-earth.git
cd react-digital-earth
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Last Updated
2026-01-23
