import { isNil, isValidArray, isValidBoolean, isValidNumber, isValidString } from './utils';

type StringSchemaType = 'string';
type StringArraySchemaType = 'string[]';
type NumberSchemaType = 'number';
type NumberArraySchemaType = 'number[]';
type BooleanSchemaType = 'boolean';
type BooleanArraySchemaType = 'boolean[]';
type ObjectSchemaType = 'object';
type ObjectArraySchemaType = 'object[]';
type ArraySchemaType = 'array';
type SchemaType =
  | StringSchemaType
  | StringArraySchemaType
  | NumberSchemaType
  | NumberArraySchemaType
  | BooleanSchemaType
  | BooleanArraySchemaType
  | ObjectSchemaType
  | ObjectArraySchemaType
  | ArraySchemaType;

export type ParameterType<T> = T extends StringSchemaType
  ? string
  : T extends StringArraySchemaType
  ? string[]
  : T extends NumberSchemaType
  ? number
  : T extends NumberArraySchemaType
  ? number[]
  : T extends BooleanSchemaType
  ? boolean
  : T extends BooleanArraySchemaType
  ? boolean[]
  : T extends ObjectSchemaType
  ? Record<string, any>
  : T extends ObjectArraySchemaType
  ? Record<string, any>[]
  : T extends ArraySchemaType
  ? (string | number | boolean | Record<string, any>)[]
  : number;

export interface SchemaOption<T> {
  /**
   * Schema 类型 / Schema Type
   */
  type: T;
  /**
   * Schema 默认值 / The default value of Schema
   */
  defaultValue?: ParameterType<T>;
  /**
   * 用户自定义的检验方法 / A self-defined validation function
   */
  validate?: (param: ParameterType<T>) => boolean;
  /**
   * 是否为必需的，若为必需，且未设默认值时，传入空值时将通不过检验 / If set true and no default value, when pass undefined or null, the parameter will be invalid
   */
  required?: boolean;
  /**
   * 最小值，NumberSchema 和 NumberArraySchema 可用 / The low limit works on NumberSchema and NumberArraySchema
   */
  min?: T extends NumberSchemaType | NumberArraySchemaType ? number : undefined;
  /**
   * 最大值，NumberSchema 和 NumberArraySchema 可用 / The high limit works on NumberSchema and NumberArraySchema
   */
  max?: T extends NumberSchemaType | NumberArraySchemaType ? number : undefined;
  /**
   * 取值范围，StringSchema、StringArraySchema、NumberSchema 和 NumberArraySchema 可用
   * A range of validate parameter works on StringSchema, StringArraySchema, NumberSchema and NumberArraySchema
   */
  range?: T extends StringSchemaType | StringArraySchemaType
    ? string[]
    : T extends NumberSchemaType | NumberArraySchemaType
    ? number[]
    : undefined;
  /**
   * 对象字段的 Schemas 设置，ObjectSchema 可用
   * Schemas of object fields setting works on ObjectSchema
   * @example
   * ```typescript
   * // fieldSchemas 参数应为对象，且对象中属性对应的值为 Schema
   * // The fieldSchemas must be an object, and all value of that object must be a Schema
   * {
   *   fieldSchemas: {
   *     foo: Schema.string(),
   *     bar: Schema.number(),
   *   }
   * }
   * ```
   */
  fieldSchemas?: T extends ObjectSchemaType ? Record<string, Schema<SchemaType>> : undefined;
  /**
   * Schema 设置，ObjectArraySchema 可用
   * Schema setting works on ObjectArraySchema
   * @example
   * ```typescript
   * {
   *   schemas: Schema.object({
   *     schemas: {
   *       foo: Schema.string(),
   *       bar: Schema.number(),
   *     }
   *   })
   * }
   * ```
   */
  schema?: T extends ObjectArraySchemaType ? ObjectSchema : undefined;
  /**
   * Schemas 设置，ArraySchema 可用
   * Schemas setting works on ArraySchema
   * @example
   * ```typescript
   * {
   *   schemas: [
   *     Schema.string(),
   *     Schema.number(),
   *     Schema.object({
   *       schemas: {
   *         foo: Schema.string(),
   *         bar: Schema.number(),
   *       }
   *     }),
   *   ]
   * }
   * ```
   */
  schemas?: T extends ArraySchemaType ? (StringSchema | NumberSchema | BooleanSchema | ObjectSchema)[] : undefined;
}

/**
 * Base Schema Class
 */
export class Schema<T> {
  /**
   * @internal
   */
  protected hasDefaultValue = false;
  /**
   * @internal
   */
  protected _type: T;
  /**
   * @internal
   */
  protected _default?: ParameterType<T>;
  /**
   * @internal
   */
  protected _validate: (param: ParameterType<T>) => boolean;
  /**
   * @internal
   */
  protected _isRequired = true;

  constructor(options: SchemaOption<T>) {
    const { type, defaultValue, validate, required } = options;
    this._type = type;
    // 处理 undefined, null, false, 0, '' 之类的默认值
    if (Object.prototype.hasOwnProperty.call(options, 'defaultValue')) {
      this.hasDefaultValue = true;
      this._default = defaultValue;
    }
    if (isValidBoolean(required)) {
      this._isRequired = required as boolean;
    }
    if (validate) {
      this._validate = validate;
    } else {
      this._validate = (param: ParameterType<T>): boolean => !!param;
    }
  }

  // todo - type valid :: validate<S>(param: S): [boolean, S | undefined] {
  /**
   * 检验参数是否合法
   * validate a parameter
   * @param param - {@link ParameterType}
   * @example
   * ```typescript
   * const [ isValid, result ] = schema.validate({x: y})
   * if (isValid) {
   *   // 可使用已检验的参数结果 result 进行后续操作
   *   // do sth. with vadalited param - result
   * } else {
   *   console.error('Invalid Parameter...');
   * }
   * ```
   * @returns result - 检验后生成的结果
   */
  validate(param: ParameterType<T>): [boolean, ParameterType<T> | undefined] {
    if (isNil(param)) {
      if (this.hasDefaultValue) {
        return [true, this._default];
      }
      if (!this._isRequired) {
        return [true, undefined];
      }
    }
    const isValid = this._validate(param);
    if (isValid) {
      return [true, param];
    } else {
      return [false, undefined];
    }
  }

  /**
   * 设置默认值，当待检验的参数为 undefined 或 null 时，将使用默认值为检查结果
   * @param defaultValue - {@link ParameterType}
   */
  setDefault(defaultValue: ParameterType<T>): Schema<T> {
    this.hasDefaultValue = true;
    this._default = defaultValue;
    return this;
  }

  /**
   * 设置自定义的检验函数
   * @param validate - {@link ParameterType}
   */
  setValidate(validate: (param: ParameterType<T>) => boolean): Schema<T> {
    this._validate = validate;
    return this;
  }

  /**
   * 设置是否为必需的
   * @param required - 是否为必需的
   */
  setRequired(required: boolean): Schema<T> {
    if (isValidBoolean(required)) {
      this._isRequired = required;
    }
    return this;
  }

  /**
   * 生成一个 StringSchema 对象
   * @param options - StringSchema 所需参数
   */
  static string(options?: Omit<SchemaOption<StringSchemaType>, 'type'>): StringSchema {
    return new StringSchema({
      type: 'string',
      ...options,
    });
  }

  /**
   * 生成一个 StringArraySchema 对象
   * @param options - StringArraySchema 所需参数
   */
  static stringArray(options?: Omit<SchemaOption<StringArraySchemaType>, 'type'>): StringArraySchema {
    return new StringArraySchema({
      type: 'string[]',
      ...options,
    });
  }

  /**
   * 生成一个 NumberSchema 对象
   * @param options - NumberSchema 所需参数
   */
  static number(options?: Omit<SchemaOption<NumberSchemaType>, 'type'>): NumberSchema {
    return new NumberSchema({
      type: 'number',
      ...options,
    });
  }

  /**
   * 生成一个 NumberArraySchema 对象
   * @param options - NumberArraySchema 所需参数
   */
  static numberArray(options?: Omit<SchemaOption<NumberArraySchemaType>, 'type'>): NumberArraySchema {
    return new NumberArraySchema({
      type: 'number[]',
      ...options,
    });
  }

  /**
   * 生成一个 BooleanSchema 对象
   * @param options - BooleanSchema 所需参数
   */
  static boolean(options?: Omit<SchemaOption<BooleanSchemaType>, 'type'>): BooleanSchema {
    return new BooleanSchema({
      type: 'boolean',
      ...options,
    });
  }

  /**
   * 生成一个 BooleanArraySchema 对象
   * @param options - BooleanArraySchema 所需参数
   */
  static booleanArray(options?: Omit<SchemaOption<BooleanArraySchemaType>, 'type'>): BooleanArraySchema {
    return new BooleanArraySchema({
      type: 'boolean[]',
      ...options,
    });
  }

  /**
   * 生成一个 ObjectSchema 对象
   * @param options - ObjectSchema 所需参数
   */
  static object(options?: Omit<SchemaOption<ObjectSchemaType>, 'type'>): ObjectSchema {
    return new ObjectSchema({
      type: 'object',
      ...options,
    });
  }

  /**
   * 生成一个 objectArray 对象
   * @param options - objectArray 所需参数
   */
  static objectArray(options?: Omit<SchemaOption<ObjectArraySchemaType>, 'type'>): ObjectArraySchema {
    return new ObjectArraySchema({
      type: 'object[]',
      ...options,
    });
  }

  static array(options?: Omit<SchemaOption<ArraySchemaType>, 'type'>): ArraySchema {
    return new ArraySchema({
      type: 'array',
      ...options,
    });
  }
}

/**
 * StringSchema 类，用于检验 string 类型的参数
 */
export class StringSchema extends Schema<StringSchemaType> {
  /**
   * @internal
   */
  private _range?: string[];

  constructor(options: SchemaOption<StringSchemaType>) {
    super(options);
    const { range, validate } = options;
    if (!isNil(range) && range) {
      this._range = range;
    }

    if (!validate) {
      this._validate = (param: string): boolean => {
        if (!isValidString(param)) {
          return false;
        }
        if (this._range && !this._range.includes(param)) {
          return false;
        }
        return true;
      };
    }
  }

  /**
   * 设置可选的字符串，除此之外的字符串参数将认定为非法的
   * @param range - 可选字符串
   * @example
   * ```typescript
   * schema.setRange(['a', 'b']);
   * ```
   */
  setRange(range: string[]): StringSchema {
    this._range = range;
    return this;
  }
}

/**
 * StringArraySchema 类，用于检验 string[] 类型的参数
 */
export class StringArraySchema extends Schema<StringArraySchemaType> {
  /**
   * @internal
   */
  private _range?: string[];

  constructor(options: SchemaOption<StringArraySchemaType>) {
    super(options);
    const { range, validate } = options;
    if (!isNil(range) && range) {
      this._range = range;
    }

    if (!validate) {
      this._validate = (param: string[]): boolean => {
        if (!isValidArray(param)) {
          return false;
        }
        for (const item of param) {
          if (!isValidString(item)) {
            return false;
          }
          if (this._range && !this._range.includes(item)) {
            return false;
          }
        }
        return true;
      };
    }
  }

  /**
   * 设置可选的字符串，除此之外的字符串参数将认定为非法的
   * @param range - 可选字符串
   * @example
   * ```typescript
   * schema.setRange(['a', 'b']);
   * ```
   */
  setRange(range: string[]): StringArraySchema {
    this._range = range;
    return this;
  }
}

/**
 * NumberSchema 类，用于检验 number 类型的参数
 * 默认要求不小于 0 的数为合法值
 */
export class NumberSchema extends Schema<NumberSchemaType> {
  /**
   * @internal
   */
  private _min = 0;
  /**
   * @internal
   */
  private _max = Number.MAX_VALUE;
  /**
   * @internal
   */
  private _range?: number[];

  constructor(options: SchemaOption<NumberSchemaType>) {
    super(options);
    const { min, max, range, validate } = options;
    if (!isNil(min)) {
      this._min = min as number;
    }
    if (!isNil(max)) {
      this._max = max as number;
    }
    if (!isNil(range)) {
      this._range = range as number[];
    }
    if (!validate) {
      this._validate = (param: number): boolean => {
        if (!isValidNumber(param)) {
          return false;
        }
        if (this._range) {
          if (!this._range.includes(param)) {
            return false;
          }
        } else {
          if (param < this._min) {
            return false;
          }
          if (param > this._max) {
            return false;
          }
        }
        return true;
      };
    }
  }

  /**
   * 设置最小数，小于此数的参数将认定为非法的
   * @param min - 最小数
   * @example
   * ```typescript
   * schema.setMin(0);
   * ```
   */
  setMin(min: number): NumberSchema {
    this._min = min;
    return this;
  }
  /**
   * 设置最大数，大于此数的参数将认定为非法的
   * @param max - 最大数
   * @example
   * ```typescript
   * schema.setMax(0);
   * ```
   */
  setMax(max: number): NumberSchema {
    this._max = max;
    return this;
  }
  /**
   * 设置可选的数，除此之外的参数将认定为非法的
   * @param range - 可选的数
   * @example
   * ```typescript
   * schema.setRange([0, 1, 2]);
   * ```
   */
  setRange(range: number[]): NumberSchema {
    this._range = range;
    return this;
  }
}

/**
 * NumberArraySchema 类，用于检验 number[] 类型的参数
 * 默认要求不小于 0 的数组成的数组为合法值
 */
export class NumberArraySchema extends Schema<NumberArraySchemaType> {
  /**
   * @internal
   */
  private _min = 0;
  /**
   * @internal
   */
  private _max = Number.MAX_VALUE;
  /**
   * @internal
   */
  private _range?: number[];

  constructor(options: SchemaOption<NumberArraySchemaType>) {
    super(options);
    const { min, max, range, validate } = options;
    if (!isNil(min)) {
      this._min = min as number;
    }
    if (!isNil(max)) {
      this._max = max as number;
    }
    if (!isNil(range)) {
      this._range = range as number[];
    }
    if (!validate) {
      this._validate = (param: number[]): boolean => {
        if (!isValidArray(param)) {
          return false;
        }
        for (const item of param) {
          if (!isValidNumber(item)) {
            return false;
          }
          if (this._range) {
            if (!this._range.includes(item)) {
              return false;
            }
          } else {
            if (item < this._min) {
              return false;
            }
            if (item > this._max) {
              return false;
            }
          }
        }
        return true;
      };
    }
  }

  /**
   * 设置最小数，小于此数的参数将认定为非法的
   * @param min - 最小数
   * @example
   * ```typescript
   * schema.setMin(0);
   * ```
   */
  setMin(min: number): NumberArraySchema {
    this._min = min;
    return this;
  }
  /**
   * 设置最大数，大于此数的参数将认定为非法的
   * @param max - 最大数
   * @example
   * ```typescript
   * schema.setMax(0);
   * ```
   */
  setMax(max: number): NumberArraySchema {
    this._max = max;
    return this;
  }
  /**
   * 设置可选的数，除此之外的参数将认定为非法的
   * @param range - 可选的数
   * @example
   * ```typescript
   * schema.setRange([0, 1, 2]);
   * ```
   */
  setRange(range: number[]): NumberArraySchema {
    this._range = range;
    return this;
  }
}

/**
 * BooleanSchema 类，用于检验 boolean 类型的参数
 */
export class BooleanSchema extends Schema<BooleanSchemaType> {
  constructor(options: SchemaOption<BooleanSchemaType>) {
    super(options);
    const { validate } = options;
    if (!validate) {
      this._validate = (param: boolean): boolean => {
        return isValidBoolean(param);
      };
    }
  }
}

/**
 * BooleanArraySchema 类，用于检验 boolean[] 类型的参数
 */
export class BooleanArraySchema extends Schema<BooleanArraySchemaType> {
  constructor(options: SchemaOption<BooleanArraySchemaType>) {
    super(options);
    const { validate } = options;
    if (!validate) {
      this._validate = (param: boolean[]): boolean => {
        if (!isValidArray(param)) {
          return false;
        }
        for (const item of param) {
          if (!isValidBoolean(item)) {
            return false;
          }
        }
        return true;
      };
    }
  }
}

/**
 * ObjectSchema 类，用于检验 Record<string, any> 即 object 类型的参数
 */
export class ObjectSchema extends Schema<ObjectSchemaType> {
  /**
   * @internal
   */
  private _schema: Record<string, Schema<SchemaType>>;
  /**
   * @internal
   */
  private useValidate = false;
  constructor(options: SchemaOption<ObjectSchemaType>) {
    super(options);
    const { fieldSchemas, validate } = options;
    if (!isNil(fieldSchemas) && fieldSchemas) {
      this._schema = fieldSchemas;
    } else {
      this._schema = {};
    }
    if (validate) {
      this.useValidate = true;
    }
  }

  setValidate(validate: (param: Record<string, any>) => boolean): ObjectSchema {
    this.useValidate = true;
    this._validate = validate;
    return this;
  }

  /**
   * 对每个 field 配置一个 Schema
   * @param schema - field 对的 Schema 的集合
   * @example
   * ```typescript
   * schema.setFieldSchemas({
   *   a: Schema.number(),
   *   b: Schema.string().setDefault(''),
   *   c: Schema.boolean(),
   *   d: Schema.object().setSchemas({
   *     da: Schema.numberArray().setDefault([1]),
   *     db: Schema.stringArray(),
   *     dc: Schema.booleanArray(),
   *   }),
   * });
   * ```
   */
  setFieldSchemas(fieldSchemas: Record<string, Schema<SchemaType>>): ObjectSchema {
    this._schema = fieldSchemas;
    return this;
  }

  validate(param: Record<string, any>): [boolean, Record<string, any> | undefined] {
    if (isNil(param)) {
      if (this.hasDefaultValue) {
        return [true, this._default];
      }
      if (!this._isRequired) {
        return [true, undefined];
      }
    }
    param = param || Object.create(null);
    const result = Object.create(null);
    let isValid = false;
    if (this.useValidate) {
      isValid = this._validate(param);
      if (isValid) {
        for (const key in param) {
          result[key] = param[key];
        }
      }
    } else {
      isValid = true;
      for (const key in this._schema) {
        const subSchema = this._schema[key];
        const [_isValid, _result] = subSchema.validate(param[key]);
        if (_isValid) {
          result[key] = _result;
        } else {
          isValid = false;
          break;
        }
      }
    }
    if (isValid) {
      return [true, result];
    } else {
      return [false, undefined];
    }
  }

  /**
   * 合并其他 ObjectSchema 中设置的 schemas
   * @param os - 其他 ObjectSchema
   * @example
   * ```typescript
   * const aSchema = Schema.object({
   *   a: Schema.string();
   * });
   * const abSchema = Schema.object({
   *   b: Schema.string();
   * }).merge(aSchema);
   * ```
   */
  merge(os: ObjectSchema): ObjectSchema {
    Object.assign(this._schema, (os as any)._schema);
    return this;
  }
}

/**
 * ObjectArraySchema 类，用于检验 Record<string, any>[] 即 object[] 类型的参数
 */
export class ObjectArraySchema extends Schema<ObjectArraySchemaType> {
  /**
   * @internal
   */
  private _schema: ObjectSchema;
  /**
   * @internal
   */
  private useValidate = false;
  constructor(options: SchemaOption<ObjectArraySchemaType>) {
    super(options);
    const { schema, validate } = options;
    if (!isNil(schema) && schema) {
      this._schema = schema;
    } else {
      this._schema = new ObjectSchema({ type: 'object' });
    }
    if (validate) {
      this.useValidate = true;
    }
  }

  setValidate(validate: (param: Record<string, any>[]) => boolean): ObjectArraySchema {
    this.useValidate = true;
    this._validate = validate;
    return this;
  }

  /**
   * 对每个 filed 配置一个 Schema
   * @param schema - filed 对的 Schema 的集合
   * @example
   * ```typescript
   * schema.setSchema(Schema.object().setSchemas({
   *   a: Schema.number().setDefault(1),
   *   b: Schema.string(),
   *   c: Schema.booleanArray(),
   * }));
   * ```
   */
  setSchema(schema: ObjectSchema): ObjectArraySchema {
    this._schema = schema;
    return this;
  }

  validate(param: Record<string, any>[]): [boolean, Record<string, any>[] | undefined] {
    if (isNil(param)) {
      if (this.hasDefaultValue) {
        return [true, this._default];
      }
      if (!this._isRequired) {
        return [true, undefined];
      }
    }
    if (!isValidArray(param)) {
      return [false, undefined];
    }
    param = param || [];
    let result: Record<string, any>[] = [];
    let isValid = false;
    if (this.useValidate) {
      isValid = this._validate(param);
      if (isValid) {
        result = result.concat(param);
      }
    } else {
      isValid = true;
      for (const item of param) {
        const [_isValid, _result] = this._schema.validate(item);
        if (_isValid) {
          if (!isNil(_result)) {
            result.push(_result as Record<string, any>);
          }
        } else {
          isValid = false;
          break;
        }
      }
    }
    if (isValid) {
      return [true, result];
    } else {
      return [false, undefined];
    }
  }
}

export class ArraySchema extends Schema<ArraySchemaType> {
  /**
   * @internal
   */
  private _schemas: (StringSchema | NumberSchema | BooleanSchema | ObjectSchema)[];
  /**
   * @internal
   */
  private useValidate = false;
  constructor(options: SchemaOption<ArraySchemaType>) {
    super(options);
    const { schemas, validate } = options;
    if (!isNil(schemas) && schemas) {
      // todo - check is schema
      this._schemas = schemas;
    } else {
      this._schemas = [];
    }
    if (validate) {
      this.useValidate = true;
    }
  }

  setValidate(validate: (param: (string | number | boolean | Record<string, any>)[]) => boolean): ArraySchema {
    this.useValidate = true;
    this._validate = validate;
    return this;
  }

  /**
   * 可设置多个 Schemas 用于检验参数类型为 object 数组中的每项是否能通过 Schemas 中任意一个的检验，只有 object 数组每项都通过检查，才认定参数为合法的
   * @param schemas - ObjectSchema 的集合
   * @example
   * ```typescript
   * schema.setSchemas([
   *   Schema.object({ a: Schema.string() }),
   *   Schema.object({ b: Schema.nubmer() }),
   * ]);
   * ```
   */
  setSchemas(schemas: (StringSchema | NumberSchema | BooleanSchema | ObjectSchema)[]): ArraySchema {
    this._schemas = schemas;
    return this;
  }

  validate(
    param: (string | number | boolean | Record<string, any>)[],
  ): [boolean, (string | number | boolean | Record<string, any>)[] | undefined] {
    if (isNil(param)) {
      if (this.hasDefaultValue) {
        return [true, this._default];
      }
      if (!this._isRequired) {
        return [true, undefined];
      }
    }
    if (!isValidArray(param)) {
      return [false, undefined];
    }
    param = param || [];
    let result: ParameterType<ArraySchemaType> = [];
    let isValid = false;
    if (this.useValidate) {
      isValid = this._validate(param);
      if (isValid) {
        result = result.concat(param);
      }
    } else {
      isValid = true;
      for (const item of param) {
        let flag = false;
        for (const schema of this._schemas) {
          const [_isValid, _result] = (schema.validate as (
            param: Record<string, any>,
          ) => [boolean, Record<string, any> | undefined])(item as Record<string, any>);
          if (_isValid && _result) {
            flag = true;
            result.push(_result);
            break;
          }
        }
        if (!flag) {
          isValid = false;
          break;
        }
      }
    }
    if (isValid) {
      return [true, result];
    } else {
      return [false, undefined];
    }
  }
}

// todos
// Date
