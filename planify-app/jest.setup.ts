// Jest setup file for Planify tests
import '@testing-library/jest-dom';

// Polyfill Web APIs for Jest environment
import 'whatwg-fetch';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers/cookies for server components
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn().mockReturnValue([]),
  }),
  headers: () => new Headers(),
}));

// Global test timeout
jest.setTimeout(10000);
