import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * A function that takes in an AST and returns a list of
 * the exported variables from ExportNamedDeclaration and
 * ExportDefaultDeclaration.
 */
function getVariableDeclarations(ast: TSESTree.Program): Set<string> {
  const variables = new Set<string>();

  try {
    ast.body.forEach((node: TSESTree.Statement) => {
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(declaration => {
          if (declaration.type === 'VariableDeclarator') {
            if (declaration.id.type === 'Identifier') {
              variables.add(declaration.id.name);
            }
          }
        });
      }
    });
  } catch (error) {
    return variables;
  }

  return variables;
}

export default getVariableDeclarations;
