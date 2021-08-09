import { TSESTree } from '@typescript-eslint/typescript-estree';
import {
  RuleFix,
  RuleFixer,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

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

export default LintContext;
