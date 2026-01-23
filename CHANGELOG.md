# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-23

### Added
- **Customizable lighting parameters**: `nightLightIntensity`, `dayNightBlendRange`, `twilightRange`
- **Customizable atmosphere parameters**: `atmosphereIntensity`, `atmosphereColor`, `atmospherePower`, `dayAtmosphereBoost`
- **Astronomical parameters**: `sunElevation`, `timeOffset` for timezone support
- **Geometry parameter**: `segments` for controlling sphere detail
- Comprehensive unit tests with Jest
- Test coverage reporting
- `.gitignore` file for proper Git management

### Changed
- Version bumped to 1.1.0
- Enhanced README with detailed props documentation and usage examples
- Improved shader to use configurable uniforms instead of hardcoded values

### Fixed
- None

## [1.0.0] - 2025-12-08

### Added
- Initial release
- Real-time day/night cycle based on UTC time
- City lights with twilight transition
- Atmospheric scattering effect
- Auto-rotation functionality
- Basic customization options (`size`, `rotationSpeed`, `autoRotate`, `sunDirection`)
- Required props: `dayTexture`, `nightTexture`
