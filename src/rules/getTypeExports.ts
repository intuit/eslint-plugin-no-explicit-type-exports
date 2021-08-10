import fs from 'fs';
import resolve from 'eslint-module-utils/resolve';
import { parse } from '@typescript-eslint/parser';
import { TSESTree } from '@typescript-eslint/typescript-estree';

const fileCache = new Map<string, Set<string>>();

enum typeDeclarationTypes {
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
}

/**
 * Checks if a node is an interface or a type.
 */
function isType(
  node: TSESTree.Statement,
): node is TSESTree.TSInterfaceDeclaration {
  return Object.keys(typeDeclarationTypes).includes(node.type);
}

/**
 * Given a file's contents this functions creates an AST and finds
 * all of the exported Types/Interfaces. The exported interfaces and types will
 * be stored in a cache.
 */
function parseTSTreeForExportedTypes(cacheKey: string, content: string): void {
  const typeList: string[] = [];

  try {
    if (fileCache && fileCache.get(cacheKey)) {
      const ast = parse(content, { sourceType: 'module' });
      const cache = fileCache.get(cacheKey);

      if (!cache) {
        return;
      }

      ast.body.forEach((node: TSESTree.Statement) => {
        if (node.type === 'ExportNamedDeclaration') {
          const { declaration, specifiers } = node;

          specifiers.forEach(specifier => {
            if (specifier.local.name === specifier.exported.name) {
              cache.add(specifier.local.name);
            } else {
              cache.add(
                `${specifier.local.name} as ${specifier.exported.name}`,
              );
            }
          });

          if (declaration && isType(declaration)) {
            cache.add(declaration.id.name);
            typeList.push(declaration.id.name);
          }
        } else if (
          node.type === 'ExportDefaultDeclaration' &&
          node.declaration.type === 'Identifier'
        ) {
          cache.add((node.declaration as TSESTree.Identifier).name);
        }

        if (isType(node)) {
          typeList.push(node.id.name);
        }
      });

      cache.forEach(exp => {
        if (!typeList.includes(exp.split(' as ')[0])) {
          cache.delete(exp);
        }
      });
    }
  } catch (error) {
    return;
  }
}

/**
 * This functions checks the cache for the files typed exports. If the
 * file has not been parsed yet it will open the file and get the exported
 * types and interfaces.
 */
function parseFileForTypedExports(
  source: string,
  context: any,
): Set<string> | undefined {
  const path = resolve(source, context);

  if (!path) {
    return;
  }

  try {
    const content = fs.readFileSync(path, { encoding: 'utf8' });
    const cacheKey = path;
    const cachedExports = fileCache.get(cacheKey);

    if (cachedExports) {
      return cachedExports;
    }

    if (!content || !fileCache) {
      return;
    }

    fileCache.set(cacheKey, new Set());
    parseTSTreeForExportedTypes(cacheKey, content);

    return fileCache.get(cacheKey);
  } catch (error) {
    return;
  }
}

export default parseFileForTypedExports;
