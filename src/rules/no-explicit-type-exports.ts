import { TSESTree } from '@typescript-eslint/experimental-utils';

import parseFileForExports from './getTypeExports';
import getExports from './getExports';
import { exportFixer, importFixer } from '../fix';
import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

function errorMessage(name: string): string {
  return `Do not export '${name}' it is an imported type or interface.`;
}

function isTypeStatement(
  node:
    | TSESTree.ExportNamedDeclaration
    | TSESTree.ImportDeclaration
    | TSESTree.ExportDefaultDeclaration,
): boolean {
  return (
    ((node as TSESTree.ExportNamedDeclaration).exportKind === 'type' ||
      (node as TSESTree.ImportDeclaration).importKind === 'type') &&
    node.type !== 'ExportDefaultDeclaration'
  );
}

function isExport(
  exported: TSESTree.ExportSpecifier | TSESTree.ImportClause,
): exported is TSESTree.ExportSpecifier {
  return (exported as TSESTree.ExportSpecifier).exported !== undefined;
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
      const { ast } = context.getSourceCode();
      const { source } = node;

      const sourceName = source && 'value' in source ? source.value : undefined;

      if (typeof sourceName === 'string') {
        const typedExports = parseFileForExports(sourceName, context);
        const typedImports: string[] = [];
        const regularImports: string[] = [];

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

          getExports(ast).forEach(({ exp, node: expNode }) => {
            if (
              typedImports.includes(exp) &&
              !isTypeStatement(node) &&
              !isTypeStatement(expNode)
            ) {
              const isExport = type === 'ExportNamedDeclaration';
              context.report({
                node,
                message: errorMessage(exp),
                fix: (fixer: RuleFixer) =>
                  isExport
                    ? exportFixer(
                        node as TSESTree.ExportNamedDeclaration,
                        typedImports,
                        regularImports,
                        fixer,
                      )
                    : importFixer(
                        node as TSESTree.ImportDeclaration,
                        typedImports,
                        regularImports,
                        fixer,
                      ),
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
            let exportedName = name;
            if (isExport(specifier)) {
              exportedName = specifier.exported.name;
            }
            if (
              AllTypedImports.includes(name) ||
              AllTypedImports.includes(`${name} as ${exportedName}`)
            ) {
              if (name === exportedName) {
                typedExports.push(name);
              } else {
                typedExports.push(`${name} as ${exportedName}`);
              }
            } else {
              regularExports.push(name);
            }
          },
        );
        if (typedExports.length && !isTypeStatement(node)) {
          context.report({
            node,
            message: errorMessage(typedExports[0]),
            fix: (fixer: RuleFixer) =>
              exportFixer(
                node as TSESTree.ExportNamedDeclaration,
                typedExports,
                regularExports,
                fixer,
              ),
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
