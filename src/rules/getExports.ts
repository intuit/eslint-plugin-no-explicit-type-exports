import { TSESTree } from '@typescript-eslint/typescript-estree';

interface ExportStatementAndName {
  exp: string;
  node: TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration;
}

/**
 * A function that takes in an AST and returns a list of
 * the exported variables from ExportNamedDeclaration and
 * ExportDefaultDeclaration.
 */
function getExports(ast: TSESTree.Program): Set<ExportStatementAndName> {
  const exported = new Set<ExportStatementAndName>();

  try {
    ast.body.forEach((node: TSESTree.Statement) => {
      if (node.type === 'ExportNamedDeclaration') {
        node.specifiers.forEach(specifier => {
          exported.add({
            node,
            exp: specifier.local.name,
          });
        });
      } else if (
        node.type === 'ExportDefaultDeclaration' &&
        node.declaration.type === 'Identifier'
      ) {
        exported.add({
          node,
          exp: node.declaration.name,
        });
      }
    });
  } catch (error) {
    return exported;
  }

  return exported;
}

export default getExports;
