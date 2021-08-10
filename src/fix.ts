import {
  RuleFix,
  RuleFixer,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { TSESTree } from '@typescript-eslint/typescript-estree';

const generateTypeFix = (
  type: 'import' | 'export',
  variables: string[],
  source: string,
): string => {
  const spacedSource = source ? ` ${source}` : '';
  return `${type} type { ${variables.join(',')} }${spacedSource};\n`;
};

const generateNonTypeFix = (
  type: 'import' | 'export',
  variables: string[],
  source: string,
): string => {
  const spacedSource = source ? ` ${source}` : '';
  return `${type} { ${variables.join(',')} }${spacedSource};`;
};

export const exportFixer = (
  node: TSESTree.ExportNamedDeclaration,
  typedExports: string[],
  regularExports: string[],
  fixer: RuleFixer,
): RuleFix | undefined => {
  try {
    const source =
      node.source && (node.source as any).raw
        ? 'from ' + (node.source as any).raw
        : '';

    const exportTypes = typedExports.length
      ? generateTypeFix('export', typedExports, source)
      : '';
    const exportRegulars = regularExports.length
      ? generateNonTypeFix('export', regularExports, source)
      : '';

    return fixer.replaceText(node, exportTypes + exportRegulars);
  } catch {
    return;
  }
};

export const importFixer = (
  node: TSESTree.ImportDeclaration,
  typedImports: string[],
  regularImports: string[],
  fixer: RuleFixer,
): RuleFix | undefined => {
  try {
    const source = 'from ' + node.source.raw;
    const importTypes = typedImports.length
      ? generateTypeFix('import', typedImports, source)
      : '';
    const importRegulars = regularImports.length
      ? generateNonTypeFix('import', regularImports, source)
      : '';
    return fixer.replaceText(node, importTypes + importRegulars);
  } catch {
    return;
  }
};
