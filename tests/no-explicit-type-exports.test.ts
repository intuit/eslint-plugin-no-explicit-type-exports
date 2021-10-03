import { RuleTester } from 'eslint';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rule = require('../src/rules/no-explicit-type-exports');
const parser = require.resolve('@typescript-eslint/parser');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: parser,
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
});
const fileName = path.join(process.cwd(), './tests/files', 'test.ts');
ruleTester.run('no-explicit-type-exports', rule, {
  valid: [
    {
      // The rule passes when a file imports and exports 'normal' variable
      filename: fileName,
      code: "import baz, {bar, foo} from './bar'; export {baz}",
    },
    {
      // The rule passes when a file imports and exports a 'normal' variable
      // And the variable is renamed using `asType` syntax
      filename: fileName,
      code: "import baz from './bar'; export { baz as IBaz }",
    },
    {
      // The rule passes when the file does not exist and the specifier is exported
      filename: fileName,
      code: "import baz, {bar, foo} from './noFile'; export {baz}",
    },
    {
      // The rule passes when the file does not exist.
      filename: fileName,
      code: "import baz, {bar, foo} from './noFile';",
    },
    {
      // The rule passes when you import a type without exporting it.
      filename: fileName,
      code: "import {foo} from './bar';",
    },
    {
      // The rule passes when you import an interface without exporting it.
      filename: fileName,
      code: "import {bar} from './bar';",
    },
    {
      // The rule passes when export and import a type or interface on a single line
      filename: fileName,
      code: "import type { x } from './oneLine'; export type { x };",
    },
    {
      // The rule passes when export and import a type or interface on a single line
      filename: fileName,
      code: "export type { foo } from './bar';",
    },
    {
      // The rule passes when export and import a type or interface on a single line
      // And rename the export using `asType` syntax
      filename: fileName,
      code: "export type { foo as IFoo } from './bar';",
    },
    {
      // The rule passes when export and import a type or interface on a single line
      filename: fileName,
      code: "export type { foo } from './bar'; export  { baz } from './bar';",
    },
    {
      // The rule passes when export * from a file with exported types/interfaces
      filename: fileName,
      code: " export * from './bar';",
    },
    {
      // The rule passes when a file imports * from a file and exports as a single type variable
      filename: fileName,
      code: "import type * as types from './bar'; export type {types};",
    },
    {
      // The rule passes when a file imports * from a file and exports as a single variable
      filename: fileName,
      code: "import type * as types from './bar'; export {types};",
    },
    {
      // The rule passes when a file imports a type from a file and exports as a single type variable
      filename: fileName,
      code: "import {foo} from './bar'; export type {foo};",
    },
  ],
  invalid: [
    {
      // The rule fails when you export an imported interface
      filename: fileName,
      code: "import {bar} from './bar'; export {bar};",
      output: "import type { bar } from './bar';\n export type { bar };\n",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface
      filename: fileName,
      code: "import baz, {bar, foo} from './bar'; export {bar};",
      output:
        "import type { bar,foo } from './bar';\nimport { baz } from './bar'; export type { bar };\n",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type
      filename: fileName,
      code: "import baz, {bar, foo} from './bar'; export {foo};",
      output:
        "import type { bar,foo } from './bar';\nimport { baz } from './bar'; export type { foo };\n",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type (single line type)
      filename: fileName,
      code: "import {baz} from './foo'; export {baz};",
      output: "import type { baz } from './foo';\n export type { baz };\n",
      errors: [
        {
          message: "Do not export 'baz' it is an imported type or interface.",
        },
        {
          message: "Do not export 'baz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type (single line type)
      // And rename the type using `asType` syntax
      filename: fileName,
      code: "import type {baz} from './foo'; export {baz as IBaz};",
      output: "import type {baz} from './foo'; export type { baz as IBaz };\n",
      errors: [
        {
          message:
            "Do not export 'baz as IBaz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface (single line interface)
      filename: fileName,
      code: "import {foo} from './foo'; export {foo};",
      output: "import type { foo } from './foo';\n export type { foo };\n",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported default type
      filename: fileName,
      code: "import aType from './default'; export {aType};",
      output:
        "import type { aType } from './default';\n export type { aType };\n",
      errors: [
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export default a type.
      filename: fileName,
      code: "import aType from './default'; export default aType;",
      output: "import type { aType } from './default';\n export default aType;",
      errors: [
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when export and import a type or interface on a single line
      filename: fileName,
      code: "export { x } from './oneLine'",
      output: "export type { x } from './oneLine';\n",
      errors: [
        {
          message: "Do not export 'x' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails multiple times.
      filename: fileName,
      code: "import foo, {bar, baz} from './bar'; export {bar, foo};",
      output:
        "import type { foo,bar } from './bar';\nimport { baz } from './bar'; export type { bar,foo };\n",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when exporting a type in an export with multiple exports
      filename: fileName,
      code: "import {bar, foo, baz} from './bar'; export {baz, foo};",
      output:
        "import type { bar,foo } from './bar';\nimport { baz } from './bar'; export type { foo };\nexport { baz };",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when exporting a type in an export with multiple export
      filename: fileName,
      code: "import foo, {bar, baz} from './bar'; export {foo, baz};",
      output:
        "import type { foo,bar } from './bar';\nimport { baz } from './bar'; export type { foo };\nexport { baz };",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when there are extra imports in the file.
      filename: fileName,
      code: "import {aType} from './randomImports'; export {aType};",
      output:
        "import type { aType } from './randomImports';\n export type { aType };\n",
      errors: [
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when export and import a type or interface on a single line
      filename: fileName,
      code: "import type { x } from './oneLine'; export { x };",
      output: "import type { x } from './oneLine'; export type { x };\n",
      errors: [
        {
          message: "Do not export 'x' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when export and import a type or interface on a single line
      filename: fileName,
      code:
        "import type { x } from './oneLine';import {bar} from './bar'; export {bar}; export { x };",
      output:
        "import type { x } from './oneLine';import type { bar } from './bar';\n export type { bar };\n export type { x };\n",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'x' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails single line imported/exported  types
      filename: fileName,
      code: "export { foo, baz } from './bar';",
      output: "export type { foo } from './bar';\nexport { baz } from './bar';",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
  ],
});
