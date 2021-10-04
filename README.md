<div align="center">
  <img width="200" height="200"
    src="./Esl.svg">
  <h1>eslint-plugin-no-explicit-type-exports</h1>
  <p>
This plugin guards against attempting to export types that may not exist after type extraction. This usually occurs when you have a file that exports an imported type.</p>
</div>

<div align="center"><a href="#contributors"><img src="https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square" alt="All Contributors" /></a></div>

<br />

## Example Usage

Imagine a you have a typescript package that includes `foo.ts` and `index.ts`:

```js
// foo.ts
export type barType = string;

// index.ts
export { barType } from './foo.ts';
```

When `foo.ts` is built into JavaScript, the types are removed and added to a type declaration file. However, the export statement in `index.ts` will not be removed. When another developer tries to use this package in a JavaScript project they can encounter errors that the export doesn't actually exist.

```bash
 ./node_modules/some_repo/index.js
 attempted import error: 'barType' is not exported from './foo'.
```

## Installation

`yarn add --dev eslint-plugin-no-explicit-type-exports`

## Usage

In your `.eslintrc` add `eslint-plugin-no-explicit-type-exports` to the plugin section.

```json
{
  "plugins": ["eslint-plugin-no-explicit-type-exports"],
  "rules": {
    "no-explicit-type-exports/no-explicit-type-exports": 2
  }
}
```

Note: you will need to use the `@typescript-eslint/parser` and add an import/resolver to your eslint settings.
More information about import/resolver can be found in the `eslints-plugin-import` documentation.
Links to both `@typescript-eslint` and `eslints-plugin-import` can be found at the bottom of this README.

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
    "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
```

## Rule Details

given:

```js
// foo.ts
export type aType = string;

export randomNumber = 5;

export interface anInterface {
    bar: string;
}

// bar.ts
interface anInterface {
    a: string;
    b: number;
}

type aType = string;

const randomNumber = 5;

export {aType, anInterface};
export default randomNumber;

// baz.ts
type aType = string;

export default aType;

// oneLine.ts
export type x = keyof typeof String;
```

Valid:

```js
import { aType, randomNumber, anInterface } from './foo';
```

```js
import {aType, randomNumber, anInterface} from './foo';

export randomNumber;
```

```js
// exporting * is valid. Since types and interfaces are already stript out
import { aType, randomNumber, anInterface } from './foo';

export * from './foo';
```

```js
import {aType} from './foo';

export type {aType};
```

Invalid:

```js
import {aType, randomNumber, anInterface} from './foo';

export anInterface;
```

```js
import {aType, randomNumber, anInterface} from './foo';

export aType;
```

```js
export { aType } from './baz';
```

```js
export { x } from './oneLine';
```

### Fixable

The `--fix` option will add the 'type' operator to all types and interfaces that are imported then exported from a file.

This:

```js
import { SomeThing } from './some-module.js';
export { SomeThing };
```

Will be fixed to:

```js
import type { SomeThing } from './some-module.js';
export type { SomeThing };
```

## Further Reading

This plugin uses the `eslints-plugin-import` resolver to resolve the files that I would be accessing to check if the specifier was a type or an interface.
https://github.com/benmosher/eslint-plugin-import

It also uses the @typescript-eslint/parse to parse files to check for types.

https://github.com/typescript-eslint/typescript-eslint

## Contributing

Contributions are welcome! If you encounter problems or have a feature suggestion we'd love to hear about it. Open an issue in the GitHub issue tracker and we will do our best to provide support. Thank you!

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/kendallgassner"><img src="https://avatars3.githubusercontent.com/u/15275462?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kendall Gassner</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=kendallgassner" title="Code">💻</a> <a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=kendallgassner" title="Documentation">📖</a> <a href="#ideas-kendallgassner" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-kendallgassner" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/hipstersmoothie"><img src="https://avatars3.githubusercontent.com/u/1192452?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=hipstersmoothie" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Rashmi-K-A"><img src="https://avatars2.githubusercontent.com/u/39820442?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rashmi K A</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=Rashmi-K-A" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/rajatdiptabiswas"><img src="https://avatars.githubusercontent.com/rajatdiptabiswas?s=100" width="100px;" alt=""/><br /><sub><b>Rajat Biswas</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=rajatdiptabiswas" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/alexogeny"><img src="https://avatars.githubusercontent.com/u/6896115?v=4?s=100" width="100px;" alt=""/><br /><sub><b>alexogeny</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=alexogeny" title="Tests">⚠️</a> <a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=alexogeny" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/DianaTdr"><img src="https://avatars.githubusercontent.com/u/35532678?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Diana Toader</b></sub></a><br /><a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=DianaTdr" title="Documentation">📖</a> <a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=DianaTdr" title="Tests">⚠️</a> <a href="https://github.com/intuit/eslint-plugin-no-explicit-type-exports/commits?author=DianaTdr" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
