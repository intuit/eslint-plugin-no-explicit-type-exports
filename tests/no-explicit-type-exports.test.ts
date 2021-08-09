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
      code: "export type { foo } from './bar'; export { baz } from './bar';",
    },
    {
      // The rule passes when export * from a file with exported types/interfaces
      filename: fileName,
      code: "export * from './bar';",
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
      // The rule passes when an interface is defined and is exported as a type
      filename: fileName,
      code: 'interface Pop { prop: string };export type {Pop};',
    },
    {
      // The rule passes when a type is defined and is exported as a type
      filename: fileName,
      code: 'type Pop = string;export type {Pop};',
    },
    {
      // The rule passes when a type is used for a function and the function is exported
      filename: fileName,
      code:
        'type Pop = string;const usePop = (popThing: Pop) => {console.log(popThing)};export {usePop};',
    },
    {
      // The rule passes when you define a function constant inline
      filename: fileName,
      code: 'const useBar=()=>{return true}; export {useBar};',
    },
    {
      // The rule passes when you define a class inline
      filename: fileName,
      code: 'class useBar {private prop: string}; export {useBar};',
    },
    {
      // The rule passes when you inline define a function and import and export at type
      filename: fileName,
      code:
        "import type {Bar} from './bar';const useBar=()=>{return true};export type {Bar};export{useBar};",
    },
    {
      // The rule passes when you inline define a class and import and export at type
      filename: fileName,
      code:
        "import type {Bar} from './bar';class useBar {private prop: string};export type {Bar};export{useBar};",
    },
  ],
  invalid: [
    {
      // The rule fails when you export an imported interface
      filename: fileName,
      code: "import {Bar} from './bar'; export {Bar};",
      output: "import type { Bar } from './bar';\n export type { Bar };\n",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface
      filename: fileName,
      code: "import baz, {Bar, foo} from './bar'; export {Bar};",
      output:
        "import type { Bar,foo } from './bar';\nimport { baz } from './bar'; export type { Bar };\n",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type
      filename: fileName,
      code: "import baz, {Bar, foo} from './bar'; export {foo};",
      output:
        "import type { Bar,foo } from './bar';\nimport { baz } from './bar'; export type { foo };\n",
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
      code: "import {Foo} from './foo'; export {Foo};",
      output: "import type { Foo } from './foo';\n export type { Foo };\n",
      errors: [
        {
          message: "Do not export 'Foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Foo' it is an imported type or interface.",
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
      code: "import foo, {Bar, baz} from './bar'; export {Bar, foo};",
      output:
        "import type { foo,Bar } from './bar';\nimport { baz } from './bar'; export type { Bar,foo };\n",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when exporting a type in an export with multiple exports
      filename: fileName,
      code: "import {Bar, foo, baz} from './bar'; export {baz, foo};",
      output:
        "import type { Bar,foo } from './bar';\nimport { baz } from './bar'; export type { foo };\nexport { baz };",
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
      code: "import foo, {Bar, baz} from './bar'; export {foo, baz};",
      output:
        "import type { foo,Bar } from './bar';\nimport { baz } from './bar'; export type { foo };\nexport { baz };",
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
        "import type { x } from './oneLine';import {Bar} from './bar'; export {Bar}; export { x };",
      output:
        "import type { x } from './oneLine';import type { Bar } from './bar';\n export type { Bar };\n export type { x };\n",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'x' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when export and import a type or interface on a single line
      filename: fileName,
      code: "import { x } from './oneLine'; export type { x };",
      output: "import type { x } from './oneLine';\n export type { x };",
      errors: [
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
    {
      // The rule fails when an interface is defined and is not exported as a type
      filename: fileName,
      code: 'interface Pop { prop: string };export {Pop};',
      output: 'interface Pop { prop: string };export type { Pop };\n',
      errors: [
        {
          message: "Do not export 'Pop' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when a type is defined and is not exported as a type
      filename: fileName,
      code: 'type Pop = string;export {Pop};',
      output: 'type Pop = string;export type { Pop };\n',
      errors: [
        {
          message: "Do not export 'Pop' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported type (single line type)
      // And rename the imported type using `asType` syntax
      filename: fileName,
      code: "import {baz as IBaz} from './foo'; export {IBaz};",
      output:
        "import type { baz as IBaz } from './foo';\n export type { IBaz };\n",
      errors: [
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export multiple imported types
      // And rename the imported types using `asType` syntax
      filename: fileName,
      code:
        "import {baz as IBaz, Foo as IFoo} from './foo'; export {IBaz, IFoo};",
      output:
        "import type { baz as IBaz,Foo as IFoo } from './foo';\n export type { IBaz,IFoo };\n",
      errors: [
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IFoo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export multiple imported types
      // And rename the imported types using `asType` syntax
      // And also use an imported function
      filename: fileName,
      code:
        "import {useBaz, baz as IBaz, Foo as IFoo} from './foo'; export {IBaz, IFoo};",
      output:
        "import type { baz as IBaz,Foo as IFoo } from './foo';\nimport { useBaz } from './foo'; export type { IBaz,IFoo };\n",
      errors: [
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IFoo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IBaz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export multiple imported types
      // And rename an imported and export types using `asType` syntax
      // And also export a imported renamed function constant
      filename: fileName,
      code:
        "import {useBaz, baz, Foo as IFoo} from './foo'; export {baz, IFoo, useBaz};",
      output:
        "import type { baz,Foo as IFoo } from './foo';\nimport { useBaz } from './foo'; export type { baz,IFoo };\nexport { useBaz };",
      errors: [
        {
          message: "Do not export 'baz' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IFoo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'baz' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export multiple imported types
      // And rename an imported and export types using `asType` syntax to a similar name as an existing import
      filename: fileName,
      code: "import {Foo, baz as foo} from './foo'; export {Foo, foo};",
      output:
        "import type { Foo,baz as foo } from './foo';\n export type { Foo,foo };\n",
      errors: [
        {
          message: "Do not export 'Foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'foo' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Foo' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface
      // And rename the imported interface using `asType` syntax
      filename: fileName,
      code: "import {Bar as IBar} from './bar'; export {IBar};",
      output:
        "import type { Bar as IBar } from './bar';\n export type { IBar };\n",
      errors: [
        {
          message: "Do not export 'IBar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IBar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface
      // And export a similarly named const
      filename: fileName,
      code:
        "import {Bar} from './bar';const useBar=()=>{return true}; export {Bar, useBar};",
      output:
        "import type { Bar } from './bar';\nconst useBar=()=>{return true}; export type { Bar };\nexport { useBar };",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export an imported interface
      // And export a similarly named class
      filename: fileName,
      code:
        "import {Bar} from './bar';class useBar {private prop: string}; export {Bar, useBar};",
      output:
        "import type { Bar } from './bar';\nclass useBar {private prop: string}; export type { Bar };\nexport { useBar };",
      errors: [
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'Bar' it is an imported type or interface.",
        },
      ],
    },
    {
      // The rule fails when you export a renamed imported interface
      // And export a similarly named const
      filename: fileName,
      code:
        "import {Bar as IBar} from './bar';const useBar=()=>{return true}; export {IBar, useBar};",
      output:
        "import type { Bar as IBar } from './bar';\nconst useBar=()=>{return true}; export type { IBar };\nexport { useBar };",
      errors: [
        {
          message: "Do not export 'IBar' it is an imported type or interface.",
        },
        {
          message: "Do not export 'IBar' it is an imported type or interface.",
        },
      ],
    },
  ],
});
