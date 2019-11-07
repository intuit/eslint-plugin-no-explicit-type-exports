import { TSESTree } from '@typescript-eslint/experimental-utils';

import parseFileForExports from './getTypeExports';
import getExports from './getExports';

function errorMessage(name: string): string {
  return `Do not export '${name}' it is an imported type or interface.`;
}

export = {
  name: 'no-explicit-type-exports',
  create: function(
    context: any,
  ): {
    ImportDeclaration: (node: TSESTree.ImportDeclaration) => void;
    ExportNamedDeclaration: (node: TSESTree.ExportNamedDeclaration) => void;
  } {
    const getTypeImports = (type: string) => (
      node: TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration,
    ): void => {
      const typedImports: string[] = [];
      const { ast } = context.getSourceCode();
      const { source } = node;
      const sourceName = source && 'value' in source ? source.value : undefined;

      if (typeof sourceName !== 'string') {
        return;
      }

      const typedExports = parseFileForExports(sourceName, context);

      if (!typedExports) {
        return;
      }

      node.specifiers.forEach(
        (specifier: TSESTree.ExportSpecifier | TSESTree.ImportClause) => {
          const { name } = specifier.local;

          if (!typedExports.has(name)) {
            return;
          }

          if (type === 'ExportNamedDeclaration') {
            context.report(node, errorMessage(name));
            return;
          }

          typedImports.push(name);
        },
      );

      getExports(ast).forEach(exp => {
        if (typedImports.includes(exp)) {
          context.report(node, errorMessage(exp));
        }
      });
    };

    return {
      ImportDeclaration: getTypeImports('ImportDeclaration'),
      ExportNamedDeclaration: getTypeImports('ExportNamedDeclaration'),
    };
  },
};
