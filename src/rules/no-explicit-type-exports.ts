import { TSESTree } from '@typescript-eslint/experimental-utils';

import parseFileForExports from './getTypeExports';
import getExports from './getExports';
import getTypeDeclarations from './getTypeDeclarations';
import getVariableDeclarations from './getVariableDeclarations';
import { exportFixer, importFixer } from '../fix';
import {
  RuleFix,
  RuleFixer,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import getClassDeclarations from './getClassDeclarations';

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

function isExport(
  exported: TSESTree.ExportSpecifier | TSESTree.ImportClause,
): exported is TSESTree.ExportSpecifier {
  return (exported as TSESTree.ExportSpecifier).exported !== undefined;
}

function findIn(needle: string, haystack: string[] | Set<string>): boolean {
  return [...haystack]
    .map(h => h.indexOf(needle) !== -1 || needle.indexOf(h) !== -1)
    .includes(true);
}

interface LintContext {
  getSourceCode: () => { ast: TSESTree.Program };
  report: (arg0: {
    node: TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration;
    message: string;
    fix:
    | ((fixer: RuleFixer) => RuleFix | undefined)
    | ((fixer: RuleFixer) => RuleFix | undefined);
  }) => void;
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

      const typeDeclarations = getTypeDeclarations(ast);
      const variableDeclarations = getVariableDeclarations(ast);
      const classDeclarations = getClassDeclarations(ast);

      if (typeof sourceName === 'string') {
        const typedExports = parseFileForExports(sourceName, context);
        const typedImports: string[] = [];
        const regularImports: string[] = [];

        if (typedExports) {
          node.specifiers.forEach(
            (specifier: TSESTree.ExportSpecifier | TSESTree.ImportClause) => {
              const { name } = specifier.local;
              let aliasName = name;
              if ('imported' in specifier) {
                if (specifier.imported.name !== name) {
                  aliasName = `${specifier.imported.name} as ${name}`;
                }
              } else if ('exported' in specifier) {
                if (specifier.exported.name !== name) {
                  aliasName = `${name} as ${specifier.exported.name}`;
                }
              }
              const isTyped = findIn(aliasName, typedExports);
              if (!isTyped) {
                regularImports.push(aliasName);
              } else {
                typedImports.push(aliasName);
                AllTypedImports.push(aliasName);
              }
            },
          );

          getExports(ast).forEach(exp => {
            const isTyped = findIn(exp, typedImports);
            const isVariable = variableDeclarations.has(exp.split(' as ')[0]);
            const isClass = classDeclarations.has(exp.split(' as ')[0]);
            if (isTyped && !isTypeStatement(node) && !isVariable && !isClass) {
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
            let aliasName = name;
            if (isExport(specifier)) {
              if (specifier.exported.name !== name) {
                aliasName = `${name} as ${specifier.exported.name}`;
              }
            }
            const isTyped =
              findIn(name, AllTypedImports) || typeDeclarations.has(name);
            const isVariable = variableDeclarations.has(name);
            const isClass = classDeclarations.has(name);
            if (isTyped && !isVariable && !isClass) {
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
