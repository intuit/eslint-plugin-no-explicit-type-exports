import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { TSESTree } from '@typescript-eslint/typescript-estree';

export const exportFix = (
  node: TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration,
  typedExports: string[],
  regularExports: string[],
  fixer: RuleFixer,
) => {
  try {
    const source = (node as TSESTree.ImportDeclaration).source
      ? 'from ' + (node as TSESTree.ImportDeclaration).source.raw
      : '';

    let exportTypes = '';
    let exportRegulars = '';
    if (typedExports.length) {
      exportTypes = 'export type { ';
      exportTypes += typedExports.join(',');
      exportTypes += ' } ';
      exportTypes += source + ';';
    }
    if (regularExports.length) {
      exportRegulars = 'export { ';
      exportRegulars += regularExports.join(',');
      exportRegulars += ' } ';
      exportRegulars += source + ';';
    }

    return fixer.replaceText(node, exportTypes + exportRegulars);
  } catch {
    return;
  }
};

export const importFixer = (
  node: TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration,
  typedImports: string[],
  regularImports: string[],
  fixer: RuleFixer,
) => {
  try {
    const source = 'from ' + (node as TSESTree.ImportDeclaration).source.raw;
    let importTypes = '';
    let importRegulars = '';
    if (typedImports.length) {
      importTypes = 'import type { ';
      importTypes += typedImports.join(',');
      importTypes += ' } ';
      importTypes += source + ';';
    }
    if (regularImports.length) {
      importRegulars = 'import { ';
      importRegulars += regularImports.join(',');
      importRegulars += ' } ';
      importRegulars += source + ';';
    }

    return fixer.replaceText(node, importTypes + importRegulars);
  } catch {
    return;
  }
};
