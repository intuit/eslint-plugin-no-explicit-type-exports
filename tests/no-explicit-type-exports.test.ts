import { RuleTester } from 'eslint';
var path = require('path');
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
  ],
  invalid: [
    {
      // The rule fails when you export an imported interface
      filename: fileName,
      code: "import baz, {bar, foo} from './bar'; export {bar}",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type
      filename: fileName,
      code: "import baz, {bar, foo} from './bar'; export {foo}",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type (single line type)
      filename: fileName,
      code: "import {baz} from './foo'; export {baz}",
      errors: [
        {
          message: "Do not export 'baz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface (single line interface)
      filename: fileName,
      code: "import {foo} from './foo'; export {foo}",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported default type
      filename: fileName,
      code: "import aType from './default'; export {aType}",
      errors: [
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export default a type.
      filename: fileName,
      code: "import aType from './default'; export default aType",
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
      errors: [
        {
          message: "Do not export 'x' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails multiple times.
      filename: fileName,
      code: "import foo, {bar, foo, baz} from './bar'; export {bar, foo};",
      errors: [
        {
          message: "Do not export 'bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when exporting a type in an export with multiple exports
      filename: fileName,
      code: "import foo, {bar, foo, baz} from './bar'; export {baz, foo};",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when exporting a type in an export with multiple export
      filename: fileName,
      code: "import foo, {bar, foo, baz} from './bar'; export {foo, baz};",
      errors: [
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when there are extra imports in the file.
      filename: fileName,
      code: "import {aType} from './randomImports'; export {aType}",
      errors: [
        {
          message: "Do not export 'aType' it is an imported type or interface.",
        },
      ],
    },
  ],
});
