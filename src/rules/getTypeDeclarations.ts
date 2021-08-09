import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * A function that takes in an AST and returns a list of
 * the locally defined TSTypeAliasDeclaration and TSInterfaceDeclaration.
 */
function getTypeDeclarations(ast: TSESTree.Program): Set<string> {
  const types = new Set<string>();

  try {
    ast.body.forEach((node: TSESTree.Statement) => {
      if (
        node.type === 'TSTypeAliasDeclaration' ||
        node.type == 'TSInterfaceDeclaration'
      ) {
        types.add(node.id.name);
      }
    });
  } catch (error) {
    return types;
  }

  return types;
}

export default getTypeDeclarations;
