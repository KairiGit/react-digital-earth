// Jest setup file
import '@testing-library/jest-dom';

// Mock WebGL context for Three.js
class WebGLRenderingContext {}

Object.defineProperty(window, 'WebGLRenderingContext', {
    writable: true,
    value: WebGLRenderingContext,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
    return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
    clearTimeout(id);
});
