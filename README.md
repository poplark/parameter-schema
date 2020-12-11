# parameter-schema

因为调用 API 时，由于传的参数嵌套过于复杂，并受 Zod and raml-typesystem 启发，故创建了本库。
本库用于检验函数参数的合法性，支持对 string, number, boolean, object 以及他们相应的数组参数进行检验。

## 使用方法

### 导入

ESModule 方式
```typescript
import { Schema } from 'parameter-schema';
```

### 调用示例

#### string 类型的参数

```typescript
const schema = Schema.string(); // 做最简单检验，检验是不是一个字符串
/**
 * 可以设置一个默认值，检验 null 或 undefined 值时，将使用默认值作为输出结果
 * schema.setDefault('test');
 */
/**
 * 可以设置一个字符串的可选范围
 * schema.setRange(['test', 'foo', 'bar']):
 */
/**
 * 也可以设置自定义的检验函数
 * schema.setValidate((param: unknown): boolean => {
 *   return /(test|foo|bar)/i.test();
 * });
 */
const [ isValid, result ] = schema.validate('test');
console.log(isValid, result); // 输出 true "test"
```

#### string 数组类型的参数

```typescript
const schema = Schema.stringArray(); // 做最简单检验，检验是不是一个字符串数组
const [ isValid, result ] = schema.validate(['test']);
console.log(isValid, result); // 输出 true ["test"]
```

#### number 类型的参数

```typescript
const schema = Schema.number(); // 做最简单的检验，检验是不是一个数字
/**
 * 设置一个最小值及最大值
 * schema.setMix(0).setMax(2);
 */
/**
 * 可以设置一个可选数的范围
 * schema.setRange([0, 1, 2]):
 */
/**
 * 也可以设置自定义的验证函数
 * schema.setValidate((param: unknown): boolean => {
 *   return [0, 1, 2].includes(param);
 * });
 */
const [ isValid, result ] = schema.validate(0);
console.log(isValid, result); // 输出 true 0
```
#### number 数组类型的参数

```typescript
const schema = Schema.numberArray(); // 做最简单检验，检验是不是一个数字数组
const [ isValid, result ] = schema.validate([1, 2, 3]);
console.log(isValid, result); // 输出 true [1, 2, 3]
```

### boolean 类型的参数

```typescript
const schema = Schema.boolean();
const [ isValid, result ] = schema.validate(true);
console.log(isValid, result); // 输出 true true
```

#### boolean 数组类型的参数

```typescript
const schema = Schema.booleanArray(); // 做最简单检验，检验是不是一个布尔数组
const [ isValid, result ] = schema.validate([1, 2, 3]);
console.log(isValid, result); // 输出 true [1, 2, 3]
```

### object 类型的参数

```typescript
const schema = Schema.object().setSchemas({
  foo: Schema.string(),
  bar: Schema.number(),
  test: Schema.boolean().setDefault(true),
});
const [ isValid, result ] = schema.validate({ foo: 'foo', bar: 1 });
console.log(isValid, result); // 输出 true {foo: "foo", bar: 1, test: true}
```

#### object 数组类型的参数

```typescript
const schema = Schema.objectArray().setSchemas([
  Schema.object().setSchemas({
    foo: Schema.string(),
    bar: Schema.number(),
  }),
]);
const [ isValid, result ] = schema.validate([{ foo: 'foo', bar: 1, test: true }]);
console.log(isValid, result); // 输出 true {foo: "foo", bar: 1}
```

## API

更多 API 说明，请查看 [Docs](https://poplark.github.io/parameter-schema/)
