import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * A function that takes in an AST and returns a list of
 * the classes defined in it
 */
function getClassDeclarations(ast: TSESTree.Program): Set<string> {
  const classes = new Set<string>();

  try {
    ast.body.forEach((node: TSESTree.Statement) => {
      if (node.type === 'ClassDeclaration') {
        const { id } = node;
        if (id !== null) {
          classes.add(id.name);
        }
      }
    });
  } catch (error) {
    return classes;
  }

  return classes;
}

export default getClassDeclarations;
