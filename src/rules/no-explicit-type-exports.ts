import { TSESTree } from '@typescript-eslint/experimental-utils';

import parseFileForExports from './getTypeExports';
import getExports from './getExports';
import getTypeDeclarations from './getTypeDeclarations';
import { exportFixer, importFixer } from '../fix';
import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import LintContext from './types';
import getLocalNonTypes from './getLocalNonTypes';

function errorMessage(name: string): string {
  return `Do not export '${name}' it is an imported type or interface.`;
}

function isTypeStatement(
  node: TSESTree.ExportNamedDeclaration | TSESTree.ImportDeclaration,
): boolean {
  return (
    (node as TSESTree.ExportNamedDeclaration).exportKind === 'type' ||
    (node as TSESTree.ImportDeclaration).importKind === 'type'
  );
}

function findIn(needle: string, haystack: string[] | Set<string>): boolean {
  return [...haystack]
    .map(h => h.indexOf(needle) !== -1 || needle.indexOf(h) !== -1)
    .includes(true);
}

export = {
  name: 'no-explicit-type-exports',
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create: function (
    context: LintContext,
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
      const AllTypes = getTypeDeclarations(ast);
      const localNonTypes = getLocalNonTypes(ast);

      if (typeof sourceName === 'string') {
        const typedExports = parseFileForExports(sourceName, context);
        const typedImports: string[] = [];
        const regularImports: string[] = [];

        if (typedExports) {
          node.specifiers.forEach(
            (specifier: TSESTree.ExportSpecifier | TSESTree.ImportClause) => {
              const { name } = specifier.local;
              let aliasName = name;
              if (specifier.type === 'ImportSpecifier') {
                if (specifier.imported.name !== name) {
                  aliasName = `${specifier.imported.name} as ${name}`;
                }
              } else if (specifier.type === 'ExportSpecifier') {
                if (specifier.exported.name !== name) {
                  aliasName = `${name} as ${specifier.exported.name}`;
                }
              }
              if (!localNonTypes.includes(name)) {
                if (!findIn(aliasName, typedExports)) {
                  regularImports.push(aliasName);
                } else {
                  typedImports.push(aliasName);
                  AllTypedImports.push(name);
                }
              }
            },
          );

          getExports(ast).forEach(exp => {
            const name = exp.split(' as ')[0];
            const isExport = type === 'ExportNamedDeclaration';
            const typedImport =
              findIn(name, typedImports) && !isTypeStatement(node);

            if (typedImport && !localNonTypes.includes(name)) {
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
            let aliasName = name;
            if (specifier.type === 'ExportSpecifier') {
              if (specifier.exported.name !== name) {
                aliasName = `${name} as ${specifier.exported.name}`;
              }
            }
            const isTyped =
              AllTypedImports.includes(name) || AllTypes.has(name);
            if (!localNonTypes.includes(name) && isTyped) {
              typedExports.push(aliasName);
            } else {
              regularExports.push(aliasName);
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
