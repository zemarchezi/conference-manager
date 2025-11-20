// test setup file
// Global mocking for CSS and DOM

// Mocking CSS modules
jest.mock('style-loader', () => ({ inject: jest.fn() }));

// Global mocking for jsdom
global.fetch = jest.fn();