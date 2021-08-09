import { TSESTree } from '@typescript-eslint/typescript-estree';

function getLocalNonTypes(ast: TSESTree.Program): string[] {
  const nonTypeList: string[] = [];
  try {
    ast.body.forEach((node: TSESTree.Statement) => {
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(declaration => {
          if (declaration.type === 'VariableDeclarator') {
            if (declaration.id.type === 'Identifier') {
              nonTypeList.push(declaration.id.name);
            }
          }
        });
      } else if (node.type === 'ClassDeclaration') {
        const { id } = node;
        if (id !== null) {
          nonTypeList.push(id.name);
        }
      }
    });
  } catch (error) {
    return nonTypeList;
  }
  return nonTypeList;
}

export default getLocalNonTypes;
