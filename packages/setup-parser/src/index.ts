// Export types
export * from './types';

// Export parser
export * from './parser';

// Export car mappings
export * from './car-mappings/ferrari-488-gt3';
export * from './car-mappings/porsche-911-gt3r';

// Re-export specific instances for convenience
import { SetupParser } from './parser';
import { ferrari488GT3Mapping } from './car-mappings/ferrari-488-gt3';
import { porsche911GT3RMapping } from './car-mappings/porsche-911-gt3r';

/**
 * Create a default parser with all available car mappings
 */
export function createDefaultParser(): SetupParser {
  const parser = new SetupParser([
    ferrari488GT3Mapping,
    porsche911GT3RMapping,
    // Add more car mappings here as they are implemented
  ]);
  
  return parser;
}

/**
 * Parse a .sto file from a file path using the default parser
 * @param filePath Path to the .sto file
 * @returns Parsed setup data
 */
export function parseSetupFile(filePath: string) {
  const parser = createDefaultParser();
  return parser.parseFile(filePath);
}

/**
 * Parse a .sto file content from a string using the default parser
 * @param content Content of the .sto file
 * @returns Parsed setup data
 */
export function parseSetupString(content: string) {
  const parser = createDefaultParser();
  return parser.parseString(content);
}

/**
 * Convert a structured setup back to a .sto file format using the default parser
 * @param setup Structured setup data
 * @returns .sto file content as a string
 */
export function convertToSto(setup: import('./types').ParsedSetup) {
  const parser = createDefaultParser();
  return parser.convertToSto(setup);
}

/**
 * Save a structured setup to a .sto file using the default parser
 * @param setup Structured setup data
 * @param filePath Path to save the .sto file
 */
export function saveSetupToFile(setup: import('./types').ParsedSetup, filePath: string) {
  const parser = createDefaultParser();
  parser.saveToFile(setup, filePath);
}
