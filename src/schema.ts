import { isNil, isValidArray, isValidBoolean, isValidNumber, isValidString } from './utils';

type StringSchemaType = 'string';
type StringArraySchemaType = 'string[]';
type NumberSchemaType = 'number';
type NumberArraySchemaType = 'number[]';
type BooleanSchemaType = 'boolean';
type BooleanArraySchemaType = 'boolean[]';
type ObjectSchemaType = 'object';
type ObjectArraySchemaType = 'object[]';
type SchemaType =
  | StringSchemaType
  | StringArraySchemaType
  | NumberSchemaType
  | NumberArraySchemaType
  | BooleanSchemaType
  | BooleanArraySchemaType
  | ObjectSchemaType
  | ObjectArraySchemaType;

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
  : never;

export interface SchemaOption<T> {
  type: T;
  defaultValue?: ParameterType<T>;
  validate?: (param: ParameterType<T>) => boolean;
  required?: boolean;
  min?: T extends NumberSchemaType | NumberArraySchemaType ? number : undefined;
  max?: T extends NumberSchemaType | NumberArraySchemaType ? number : undefined;
  range?: T extends StringSchemaType | StringArraySchemaType
    ? string[]
    : T extends NumberSchemaType | NumberArraySchemaType
    ? number[]
    : undefined;
  schemas?: T extends ObjectSchemaType
    ? Record<string, Schema<SchemaType>>
    : T extends ObjectArraySchemaType
    ? ObjectSchema[]
    : undefined;
}

/**
 * Base Schema Class
 */
export class Schema<T> {
  protected hasDefaultValue = false;
  protected _type: T;
  protected _default?: ParameterType<T>;
  protected _validate: (param: ParameterType<T>) => boolean;
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
}

/**
 * StringSchema 类，用于检验 string 类型的参数
 */
export class StringSchema extends Schema<StringSchemaType> {
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
 */
export class NumberSchema extends Schema<NumberSchemaType> {
  private _min = Number.MIN_VALUE;
  private _max = Number.MAX_VALUE;
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
        }
        if (param < this._min) {
          return false;
        }
        if (param > this._max) {
          return false;
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
 */
export class NumberArraySchema extends Schema<NumberArraySchemaType> {
  private _min = Number.MIN_VALUE;
  private _max = Number.MAX_VALUE;
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
            break;
          }
          if (this._range && !this._range.includes(item)) {
            return false;
          }
          if (item < this._min) {
            return false;
          }
          if (item > this._max) {
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
  private _schemas: Record<string, Schema<SchemaType>>;
  private useValidate = false;
  constructor(options: SchemaOption<ObjectSchemaType>) {
    super(options);
    const { schemas, validate } = options;
    if (!isNil(schemas) && schemas) {
      this._schemas = schemas;
    } else {
      this._schemas = {};
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
   * 对每个 filed 配置一个 Schema
   * @param schemas - filed 对的 Schema 的集合
   * @example
   * ```typescript
   * schema.setSchemas({
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
  setSchemas(schemas: Record<string, Schema<SchemaType>>): ObjectSchema {
    this._schemas = schemas;
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
      for (const key in this._schemas) {
        const subSchema = this._schemas[key];
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
    Object.assign(this._schemas, (os as any)._schemas);
    return this;
  }
}

/**
 * ObjectArraySchema 类，用于检验 Record<string, any>[] 即 object[] 类型的参数
 */
export class ObjectArraySchema extends Schema<ObjectArraySchemaType> {
  private _schemas: ObjectSchema[];
  private useValidate = false;
  constructor(options: SchemaOption<ObjectArraySchemaType>) {
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

  setValidate(validate: (param: Record<string, any>[]) => boolean): ObjectArraySchema {
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
  setSchemas(schemas: ObjectSchema[]): ObjectArraySchema {
    this._schemas = schemas;
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
        let flag = false;
        for (const schema of this._schemas) {
          const [_isValid, _result] = schema.validate(item);
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
// pure array
// Date
