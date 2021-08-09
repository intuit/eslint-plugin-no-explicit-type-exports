import fs from 'fs';
import resolve from 'eslint-module-utils/resolve';
import { hashObject } from 'eslint-module-utils/hash';
import { parse } from '@typescript-eslint/parser';
import { TSESTree } from '@typescript-eslint/typescript-estree';
import LintContext from './types';
import getLocalNonTypes from './getLocalNonTypes';

const fileCache = new Map<string, Set<string>>();

/**
 * A function that takes in an AST and returns a list of
 * the variable and constant definitions.
 */
function parseTSTreeForNonTypes(cacheKey: string, content: string): void {
  // const nonTypeList: string[] = [];
  try {
    if (fileCache && fileCache.get(cacheKey)) {
      const ast = parse(content, { sourceType: 'module' });
      const cache = fileCache.get(cacheKey);
      if (!cache) {
        return;
      }
      const nonTypeList = getLocalNonTypes(ast);

      ast.body.forEach((node: TSESTree.Statement) => {
        if (node.type === 'VariableDeclaration') {
          node.declarations.forEach(declaration => {
            if (declaration.type === 'VariableDeclarator') {
              if (declaration.id.type === 'Identifier') {
                cache.add(declaration.id.name);
              }
            }
          });
        } else if (node.type === 'ClassDeclaration') {
          const { id } = node;
          if (id !== null) {
            cache.add(id.name);
          }
        }
      });
      cache.forEach(nonType => {
        if (!nonTypeList.includes(nonType)) {
          cache.delete(nonType);
        }
      });
    }
  } catch (error) {
    return;
  }
}

/**
 * This functions checks the cache for the files non typed declarations
 * (classes and constants). If the file has not been parsed yet it will open
 * the file and get the declarations.
 */
function parseFileForNonTypes(
  source: string,
  context: LintContext,
): Set<string> | undefined {
  const path = resolve(source, context);

  if (!path) {
    return;
  }

  try {
    const content = fs.readFileSync(path, { encoding: 'utf8' });
    const cacheKey = hashObject(content).digest('hex');
    const cachedNonTypes = fileCache.get(cacheKey);

    if (cachedNonTypes) {
      return cachedNonTypes;
    }

    if (!content || !fileCache) {
      return;
    }

    fileCache.set(cacheKey, new Set());
    parseTSTreeForNonTypes(cacheKey, content);

    return fileCache.get(cacheKey);
  } catch (error) {
    return;
  }
}

export default parseFileForNonTypes;
