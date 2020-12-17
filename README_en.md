# parameter-schema

English / [中文](README.md)

This lib is aim to validate the parameter of function, such as string, number, boolean, object and array parameters.

Inspired by Zod and raml-typesystem, so it is a little bit of a similar with them.

## Usage

### Import

ESModule
```typescript
import { Schema } from 'parameter-schema';
```

CommonJS
```typescript
const { Schema } = require('parameter-schema');
```

### Examples

#### The string parameter

```typescript
const schema = Schema.string(); // The simplest way, just validate the parameter is a string or not.
/**
 * Set a default value. When pass `null` or `undefined`, the default value will be the output
 * schema.setDefault('test');
 */
/**
 * Set a range for validation
 * schema.setRange(['test', 'foo', 'bar']):
 */
/**
 * Set a self-defined validate function
 * schema.setValidate((param: unknown): boolean => {
 *   return /(test|foo|bar)/i.test();
 * });
 */
const [ isValid, result ] = schema.validate('test');
console.log(isValid, result); // output: true "test"
```

#### The string array parameter

```typescript
const schema = Schema.stringArray(); // The simplest way, just validate the parameter is an array, and all items in the array are string or not.
const [ isValid, result ] = schema.validate(['test']);
console.log(isValid, result); // output: true ["test"]
```

#### The number parameter

```typescript
const schema = Schema.number(); // The simplest way, just validate the parameter is a number and not less then 0.
/**
 * Set the low limit and hight limit
 * schema.setMin(0).setMax(2);
 */
/**
 * Set a range for validation
 * schema.setRange([0, 1, 2]):
 */
/**
 * Set a self-defined validate function
 * schema.setValidate((param: unknown): boolean => {
 *   return [0, 1, 2].includes(param);
 * });
 */
const [ isValid, result ] = schema.validate(0);
console.log(isValid, result); // output: true 0
```
#### The number array parameter

```typescript
const schema = Schema.numberArray(); // The simplest way, just validate the parameter is an array with all items are numbers and not less then 0
const [ isValid, result ] = schema.validate([1, 2, 3]);
console.log(isValid, result); // outptu: true [1, 2, 3]
```

#### The boolean parameter

```typescript
const schema = Schema.boolean(); // The simplest way, just validate the parameter is a boolean or not
const [ isValid, result ] = schema.validate(true);
console.log(isValid, result); // output: true true
```

#### The boolean array parameter

```typescript
const schema = Schema.booleanArray(); // The simplest way, just validate the parameter is an array with all items are booleans
const [ isValid, result ] = schema.validate([1, 2, 3]);
console.log(isValid, result); // output: true [1, 2, 3]
```

#### The object parameter

```typescript
const schema = Schema.object().setFieldSchemas({
  foo: Schema.string(),
  bar: Schema.number(),
  test: Schema.boolean().setDefault(true),
}); // Validate the parameter is an object, and all properties of it can be validated by the Schema settings
const [ isValid, result ] = schema.validate({ foo: 'foo', bar: 1 });
console.log(isValid, result); // output: true {foo: "foo", bar: 1, test: true}
```

```typescript
// Field without schema setting will be ignore in the output, such as:
const [ isValid, result ] = schema.validate({ foo: 'foo', bar: 1, baz: false });
console.log(isValid, result); // output: true {foo: "foo", bar: 1, test: true}
```

#### The object array parameter

```typescript
const schema = Schema.objectArray().setSchema(
  Schema.object().setSchemas({
    foo: Schema.string(),
    bar: Schema.number(),
  }),
); // Validate the parameter is an array, and all items of that array are object, and all objects of that array can be validated by the ObjectSchema in settings
const [ isValid, result ] = schema.validate([{ foo: 'foo', bar: 1, test: true }]);
console.log(isValid, result); // output: true {foo: "foo", bar: 1}
```

#### The array parameter

```typescript
const schema = Schema.array().setSchemas([
  Schema.number().setRange([1, 2, 3]),
  Schema.object().setFieldSchemas({
    foo: Schema.string(),
    bar: Schema.number(),
  }),
]); // Validate the parameter is an array, and all items of that array can be validated by one of Schemas in settings
const [ isValid, result ] = schema.validate([{ foo: 'foo', bar: 1, test: true }]);
console.log(isValid, result); // output: true {foo: "foo", bar: 1}
```

```typescript
// More
const [ isValid, result ] = schema.validate([1, {foo: 'foo', bar: 1, test: true}, 2]);
console.log(isValid, result); // output: true [1, {foo: "foo", bar: 1}, 2]
```

## API

To see more API，please check the [Docs](https://poplark.github.io/parameter-schema/)
