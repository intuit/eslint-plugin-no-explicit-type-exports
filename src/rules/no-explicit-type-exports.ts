import { TSESTree } from '@typescript-eslint/experimental-utils';

import parseFileForExports from './getTypeExports';
import getExports from './getExports';
import { exportFix, importFixer } from '../fix';
import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

function errorMessage(name: string): string {
  return `Do not export '${name}' it is an imported type or interface.`;
}

export = {
  name: 'no-explicit-type-exports',
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create: function(
    context: any,
  ): {
    ImportDeclaration: (node: TSESTree.ImportDeclaration) => void;
    ExportNamedDeclaration: (node: TSESTree.ExportNamedDeclaration) => void;
  } {
    const AllTypedImports: string[] = [];

    const getTypeImports = (type: string) => (
      node: TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration,
    ): void => {
      const typedImports: string[] = [];
      const regularImports: string[] = [];
      const { ast } = context.getSourceCode();
      const { source } = node;
      const sourceName = source && 'value' in source ? source.value : undefined;
      if (typeof sourceName === 'string') {
        const typedExports = parseFileForExports(sourceName, context);

        if (typedExports) {
          node.specifiers.forEach(
            (specifier: TSESTree.ExportSpecifier | TSESTree.ImportClause) => {
              const { name } = specifier.local;
              if (!typedExports.has(name)) {
                regularImports.push(name);
              } else {
                typedImports.push(name);
                AllTypedImports.push(name);
              }
            },
          );

          getExports(ast).forEach(exp => {
            if (type === 'ExportNamedDeclaration') {
              context.report({
                node,
                message: errorMessage(exp),
                fix: (fixer: RuleFixer) =>
                  exportFix(node, typedImports, regularImports, fixer),
              });
            } else if (typedImports.includes(exp)) {
              context.report({
                node,
                message: errorMessage(exp),
                fix: (fixer: RuleFixer) =>
                  importFixer(node, typedImports, regularImports, fixer),
              });
            }
          });
        }
      } else if (type === 'ExportNamedDeclaration') {
        const typedExports: string[] = [];
        const regularExports: string[] = [];
        node.specifiers.forEach(
          (specifier: TSESTree.ExportSpecifier | TSESTree.ImportClause) => {
            const { name } = specifier.local;
            if (AllTypedImports.includes(name)) {
              typedExports.push(name);
            } else {
              regularExports.push(name);
            }
          },
        );

        if (typedExports.length) {
          context.report({
            node,
            message: errorMessage(typedExports[0]),
            fix: (fixer: RuleFixer) => {
              exportFix(node, typedExports, regularExports, fixer);
            },
          });
        }
      }
    };

    return {
      ImportDeclaration: getTypeImports('ImportDeclaration'),
      ExportNamedDeclaration: getTypeImports('ExportNamedDeclaration'),
    };
  },
};
