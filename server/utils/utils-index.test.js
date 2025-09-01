import { jest } from '@jest/globals';

// Import all exports from utils/index.js
import {
  randomImageName,
  CombineGenresIdNames,
  CombineQualitiesIdNames,
  generateEmailVerificationLink,
  generatePasswordResetLink,
  signAccessToken,
  signRefreshToken,
  signEmailVerificationToken,
  signPasswordResetToken
} from './index.js';

describe('Utils Index - All Exports', () => {
  describe('Function Exports', () => {
    test('should export randomImageName function', () => {
      expect(typeof randomImageName).toBe('function');
    });

    test('should export CombineGenresIdNames function', () => {
      expect(typeof CombineGenresIdNames).toBe('function');
    });

    test('should export CombineQualitiesIdNames function', () => {
      expect(typeof CombineQualitiesIdNames).toBe('function');
    });

    test('should export generateEmailVerificationLink function', () => {
      expect(typeof generateEmailVerificationLink).toBe('function');
    });

    test('should export generatePasswordResetLink function', () => {
      expect(typeof generatePasswordResetLink).toBe('function');
    });

    test('should export signAccessToken function', () => {
      expect(typeof signAccessToken).toBe('function');
    });

    test('should export signRefreshToken function', () => {
      expect(typeof signRefreshToken).toBe('function');
    });

    test('should export signEmailVerificationToken function', () => {
      expect(typeof signEmailVerificationToken).toBe('function');
    });

    test('should export signPasswordResetToken function', () => {
      expect(typeof signPasswordResetToken).toBe('function');
    });
  });

  describe('Function Execution Tests', () => {
    test('randomImageName should return a string', () => {
      const result = randomImageName();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('CombineGenresIdNames should handle empty array', () => {
      const result = CombineGenresIdNames([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    test('CombineGenresIdNames should handle array with genres', () => {
      const mockData = [
        { movie_id: 1, genre_id: 1, genre_name: 'Action' },
        { movie_id: 1, genre_id: 2, genre_name: 'Comedy' }
      ];
      const result = CombineGenresIdNames(mockData);
      expect(Array.isArray(result)).toBe(true);
    });

    test('CombineQualitiesIdNames should handle empty array', () => {
      const result = CombineQualitiesIdNames([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    test('CombineQualitiesIdNames should handle array with qualities', () => {
      const mockData = [
        { screening_id: 1, quality_id: 1, quality_name: '4K' },
        { screening_id: 1, quality_id: 2, quality_name: '3D' }
      ];
      const result = CombineQualitiesIdNames(mockData);
      expect(Array.isArray(result)).toBe(true);
    });

    test('generateEmailVerificationLink should return object with link and token', () => {
      const result = generateEmailVerificationLink(123);
      expect(result).toHaveProperty('link');
      expect(result).toHaveProperty('token');
      expect(typeof result.link).toBe('string');
      expect(typeof result.token).toBe('string');
    });

    test('generatePasswordResetLink should return object with link and token', () => {
      const result = generatePasswordResetLink(123);
      expect(result).toHaveProperty('link');
      expect(result).toHaveProperty('token');
      expect(typeof result.link).toBe('string');
      expect(typeof result.token).toBe('string');
    });

    test('signAccessToken should return a string token', () => {
      const result = signAccessToken(123, 1, 'user');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // JWT tokens have 3 parts separated by dots
      expect(result.split('.').length).toBe(3);
    });

    test('signRefreshToken should return a string token', () => {
      const result = signRefreshToken(123, 1);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // JWT tokens have 3 parts separated by dots
      expect(result.split('.').length).toBe(3);
    });

    test('signEmailVerificationToken should return a string token', () => {
      const result = signEmailVerificationToken(123);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // JWT tokens have 3 parts separated by dots
      expect(result.split('.').length).toBe(3);
    });

    test('signPasswordResetToken should return a string token', () => {
      const result = signPasswordResetToken(123);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // JWT tokens have 3 parts separated by dots
      expect(result.split('.').length).toBe(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('CombineGenresIdNames should handle null input gracefully', () => {
      const result = CombineGenresIdNames(null);
      expect(result).toBeDefined();
    });

    test('CombineQualitiesIdNames should handle undefined input gracefully', () => {
      const result = CombineQualitiesIdNames(undefined);
      expect(result).toBeDefined();
    });

    test('JWT functions should handle different user IDs', () => {
      const token1 = signAccessToken(1, 1, 'user');
      const token2 = signAccessToken(999, 2, 'admin');
      
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
    });

    test('generateEmailVerificationLink should handle different user IDs', () => {
      const result1 = generateEmailVerificationLink(1);
      const result2 = generateEmailVerificationLink(999);
      
      expect(result1.token).not.toBe(result2.token);
      expect(result1.link).not.toBe(result2.link);
    });

    test('generatePasswordResetLink should handle different user IDs', () => {
      const result1 = generatePasswordResetLink(1);
      const result2 = generatePasswordResetLink(999);
      
      expect(result1.token).not.toBe(result2.token);
      expect(result1.link).not.toBe(result2.link);
    });
  });
});