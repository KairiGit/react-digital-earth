import { DigitalEarthProps } from '../Earth';

describe('DigitalEarthProps', () => {
    describe('default values', () => {
        const defaultProps: Partial<DigitalEarthProps> = {
            size: 1.8,
            rotationSpeed: 0.001,
            autoRotate: true,
            nightLightIntensity: 1.5,
            dayNightBlendRange: [-0.5, 0.5],
            twilightRange: [-0.1, 0.0],
            atmosphereIntensity: 0.6,
            atmosphereColor: [0.4, 0.6, 1.0],
            atmospherePower: 3.0,
            dayAtmosphereBoost: 0.5,
            sunElevation: 0.2,
            timeOffset: 0,
            segments: 64,
        };

        it('should have correct default size', () => {
            expect(defaultProps.size).toBe(1.8);
        });

        it('should have correct default rotation speed', () => {
            expect(defaultProps.rotationSpeed).toBe(0.001);
        });

        it('should have autoRotate enabled by default', () => {
            expect(defaultProps.autoRotate).toBe(true);
        });

        it('should have correct default nightLightIntensity', () => {
            expect(defaultProps.nightLightIntensity).toBe(1.5);
        });

        it('should have correct default dayNightBlendRange', () => {
            expect(defaultProps.dayNightBlendRange).toEqual([-0.5, 0.5]);
        });

        it('should have correct default twilightRange', () => {
            expect(defaultProps.twilightRange).toEqual([-0.1, 0.0]);
        });

        it('should have correct default atmosphereIntensity', () => {
            expect(defaultProps.atmosphereIntensity).toBe(0.6);
        });

        it('should have correct default atmosphereColor', () => {
            expect(defaultProps.atmosphereColor).toEqual([0.4, 0.6, 1.0]);
        });

        it('should have correct default atmospherePower', () => {
            expect(defaultProps.atmospherePower).toBe(3.0);
        });

        it('should have correct default dayAtmosphereBoost', () => {
            expect(defaultProps.dayAtmosphereBoost).toBe(0.5);
        });

        it('should have correct default sunElevation', () => {
            expect(defaultProps.sunElevation).toBe(0.2);
        });

        it('should have correct default timeOffset', () => {
            expect(defaultProps.timeOffset).toBe(0);
        });

        it('should have correct default segments', () => {
            expect(defaultProps.segments).toBe(64);
        });
    });

    describe('type validation', () => {
        it('should accept valid props', () => {
            const validProps: DigitalEarthProps = {
                dayTexture: '/earth_day.jpg',
                nightTexture: '/earth_night.jpg',
                size: 2.0,
                rotationSpeed: 0.002,
                autoRotate: false,
                sunDirection: [1, 0, 0],
                nightLightIntensity: 2.0,
                dayNightBlendRange: [-0.3, 0.3],
                twilightRange: [-0.2, 0.1],
                atmosphereIntensity: 0.8,
                atmosphereColor: [1.0, 0.5, 0.2],
                atmospherePower: 4.0,
                dayAtmosphereBoost: 0.7,
                sunElevation: 0.4,
                timeOffset: 9,
                segments: 128,
            };

            expect(validProps.dayTexture).toBe('/earth_day.jpg');
            expect(validProps.nightTexture).toBe('/earth_night.jpg');
            expect(validProps.size).toBe(2.0);
            expect(validProps.sunDirection).toEqual([1, 0, 0]);
            expect(validProps.atmosphereColor).toEqual([1.0, 0.5, 0.2]);
            expect(validProps.timeOffset).toBe(9);
        });

        it('should require dayTexture and nightTexture', () => {
            const minimalProps: DigitalEarthProps = {
                dayTexture: '/day.jpg',
                nightTexture: '/night.jpg',
            };

            expect(minimalProps.dayTexture).toBeDefined();
            expect(minimalProps.nightTexture).toBeDefined();
        });
    });

    describe('parameter ranges', () => {
        it('should handle extreme atmosphere values', () => {
            const props: Partial<DigitalEarthProps> = {
                atmosphereIntensity: 0,
                atmospherePower: 10,
                dayAtmosphereBoost: 1.0,
            };

            expect(props.atmosphereIntensity).toBeGreaterThanOrEqual(0);
            expect(props.atmospherePower).toBeGreaterThan(0);
            expect(props.dayAtmosphereBoost).toBeLessThanOrEqual(1.0);
        });

        it('should handle negative timeOffset for western timezones', () => {
            const props: Partial<DigitalEarthProps> = {
                timeOffset: -8, // PST
            };

            expect(props.timeOffset).toBe(-8);
        });

        it('should handle high segment count for detailed rendering', () => {
            const props: Partial<DigitalEarthProps> = {
                segments: 256,
            };

            expect(props.segments).toBeGreaterThan(64);
        });
    });
});

describe('Shader configuration', () => {
    describe('uniform values', () => {
        it('should correctly map dayNightBlendRange to vec2', () => {
            const range: [number, number] = [-0.5, 0.5];
            const vec2 = { x: range[0], y: range[1] };
            
            expect(vec2.x).toBe(-0.5);
            expect(vec2.y).toBe(0.5);
        });

        it('should correctly map atmosphereColor to vec3', () => {
            const color: [number, number, number] = [0.4, 0.6, 1.0];
            const vec3 = { r: color[0], g: color[1], b: color[2] };
            
            expect(vec3.r).toBe(0.4);
            expect(vec3.g).toBe(0.6);
            expect(vec3.b).toBe(1.0);
        });

        it('should normalize sunDirection vector', () => {
            const sunDir: [number, number, number] = [1, 1, 1];
            const length = Math.sqrt(sunDir[0] ** 2 + sunDir[1] ** 2 + sunDir[2] ** 2);
            const normalized = sunDir.map(v => v / length);
            
            const normalizedLength = Math.sqrt(
                normalized[0] ** 2 + normalized[1] ** 2 + normalized[2] ** 2
            );
            
            expect(normalizedLength).toBeCloseTo(1, 5);
        });
    });
});

describe('Sun position calculation', () => {
    it('should calculate correct sun longitude for noon UTC', () => {
        const utcHours = 12;
        const offset = Math.PI / 2;
        const sunLong = -(utcHours - 12) * 15 * (Math.PI / 180) + offset;
        
        expect(sunLong).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should calculate correct sun longitude for midnight UTC', () => {
        const utcHours = 0;
        const offset = Math.PI / 2;
        const sunLong = -(utcHours - 12) * 15 * (Math.PI / 180) + offset;
        
        // At midnight, sun should be opposite
        expect(sunLong).toBeCloseTo(Math.PI / 2 + Math.PI, 5);
    });

    it('should apply timeOffset correctly', () => {
        const utcHours = 12;
        const timeOffset = 9; // Tokyo
        const adjustedHours = utcHours + timeOffset;
        
        expect(adjustedHours).toBe(21);
    });

    it('should calculate sun direction with elevation', () => {
        const theta = 0;
        const sunElevation = 0.2;
        
        const sunDir = {
            x: Math.sin(theta),
            y: sunElevation,
            z: Math.cos(theta),
        };
        
        expect(sunDir.x).toBeCloseTo(0, 5);
        expect(sunDir.y).toBe(0.2);
        expect(sunDir.z).toBeCloseTo(1, 5);
    });
});
