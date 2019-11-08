# eslint-plugin-no-explicit-type-exports 

This plugin guards against attempting to export types that may not exist after type extraction. This usually occurs when you have a file that exports an imported type.

## Example Usage

Imagine a you have a typescript package that includes `foo.ts` and `index.ts`:

```js
// foo.ts
    export type barType = string;
    
// index.ts
    export {barType} from './foo.ts' 

```

When `foo.ts` is built into JavaScript, the types are removed and added to a type declaration file. However, the export statement in `index.ts` will not be removed. When another developer tries to use this package in a JavaScript project they can encounter errors that the export doesn't actually exist.

```bash    
 ./node_modules/some_repo/index.js
 attempted import error: 'barType' is not exported from './foo'.
```

## Installation

```yarn add --dev eslint-plugin-no-explicit-type-exports ```

## Usage
In your `.eslintrc` add  `eslint-plugin-no-explicit-type-exports` to the plugin section.

```json
{
  "plugins": ["eslint-plugin-no-explicit-type-exports"]
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
import {aType, randomNumber, anInterface} from './foo';
```

```js
import {aType, randomNumber, anInterface} from './foo';

export randomNumber;
```

```js
// exporting * is valid. Since types and interfaces are already stript out
import {aType, randomNumber, anInterface} from './foo';

export * from './foo'; ;
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
export {aType} from './baz';
```

```js
export { x } from './oneLine'
```


## Further Reading
This plugin uses the `eslints-plugin-import` resolver to resolve the files that I would be accessing to check if the specifier was a type or an interface. 
https://github.com/benmosher/eslint-plugin-import

It also uses the @typescript-eslint/parse to parse files to check for types. 

https://github.com/typescript-eslint/typescript-eslint

## Contributing

Contributions are welcome! If you encounter problems or have a feature suggestion we'd love to hear about it. Open an issue in the GitHub issue tracker and we will do our best to provide support. Thank you!
