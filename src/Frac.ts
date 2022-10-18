import type IrreducibleFrac from "./IrreducibleFrac.js";
import Arith from "./Arith.js";
import Parser from "./Parser.js";

/**
 * A class for representing real numbers as fractions.
 */
export default class Frac {

    /**
     * Parses a string and returns Frac instance.
     * 
     * @param str a string to parse
     * @throws {SyntaxError} if invalid string is passed
     */
    public static parse(str: string): Frac {
        const parser = new Parser(str, this.#from);
        const frac = parser.parse();
        if (parser.current !== str.length) {
            throw parser.errorMessage("unexpected end of input");
        }
        return frac;
    }

    /**
     * Checks the type of argument passed to the constructor. If the type is invalid, throws TypeError.
     */
    static #validateArgs(e: unknown, isNumerator: boolean, deepCopy = true): undefined | number | Frac {
        if (e === void 0) {
            return e;

        } else if (typeof e === "number") {
            let num: number = e;
            if (Number.isFinite(num)) {
                num = Math.floor(num);
            }

            if (!isNumerator && num === 0) {
                throw new TypeError("cannot divide by zero");
            }

            if (Number.isSafeInteger(num)) {
                return num;

            } else {
                throw new TypeError(`${isNumerator ? "numerator" : "denominator"} overflowed`);
            }
        } else if (typeof e === "string") {
            return this.parse(e);

        } else if (e instanceof Frac) {
            return deepCopy ? new this(e.n, e.d) : e;

        }

        throw new TypeError(`${isNumerator ? "numerator" : "denominator"} must be a finite number or a string or an instances of Frac`);
    }

    /**
     * Unsafe constructor (for internal use only). It does not deepcopy objects.
     */
    static #from(numerator: number | Frac, denominator?: number | Frac): Frac {

        if (denominator !== void 0) {
            const frac = new Frac();
            [frac.n, frac.d] = [numerator, denominator];
            return frac;

        } else if (typeof numerator === "number") {
            const frac = new Frac();
            [frac.n, frac.d] = [numerator, 1];
            return frac;

        } else {
            return numerator;
        }
    }

    /**
     * Numerator.
     */
    #n: number | Frac = 0;

    /**
     * Denominator.
     */
    #d: number | Frac = 1;

    /** 
     * Getter for the numerator.
     */
    public get n(): number | Frac {
        return this.#n;
    }

    /**
     * Setter for the numerator.
     */
    public set n(value: number | Frac) {
        this.#n = Frac.#validateArgs(value, true, false) ?? 0;
    }

    /** 
     * Getter for the denominator.
     */
    public get d(): number | Frac {
        return this.#d;
    }

    /**
     * Setter for the denominator.
     */
    public set d(value: number | Frac) {
        this.#d = Frac.#validateArgs(value, false, false) ?? 1;
    }

    /**
     * Constructor. If param "denominator" is not provided, the constructor copies the value of param "numerator". If the type of param "numerator" is string, the constructor parses the value.
     * 
     * @param numerator a number or an instance of Frac to be used as the numerator
     * @param denominator a number or an instance of Frac to be used as the denominator
     * 
     * @example
     * const half = new Frac(1, 2);        // (1 / 2)
     * const copy = new Frac(half);        // (1 / 2)
     * const one  = new Frac(half, half);  // ((1 / 2) / (1 / 2)) 
     * 
     * const quarter = new Frac("(1 / 4)");
     */
    public constructor(numerator?: string | number | Frac, denominator?: number | Frac) {
        const n = Frac.#validateArgs(numerator, true);
        const d = Frac.#validateArgs(denominator, false);

        if (n === void 0) {
            [this.#n, this.#d] = [0, 1];

        } else if (d) {
            [this.#n, this.#d] = [n, d];

        } else if (typeof n === "number") {
            [this.#n, this.#d] = [n, 1];

        } else {
            return n;
        }
    }

    /**
     * Returns the inverse of the fraction.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const inv  = half.inv();      // (2 / 1)
     */
    public inv(): Frac {
        return new Frac(this).inv$();
    }

    /**
     * Returns the inverse of the fraction (destructive).
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const inv  = half.inv$();     // (2 / 1)
     * 
     * half;  // (2 / 1)
     */
    public inv$(): typeof this {
        [this.#n, this.#d] = [this.#d, this.#n];
        return this;
    }

    /**
     * Returns the sum of two fractions. The parameter types are the same as those of the constructor. 
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const one  = half.add(half);  // (1 / 1)
     */
    public add(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return new Frac(this).add$$(new Frac(...other));
    }

    /**
     * Returns the sum of two fractions (destructive / argument value will not be changed).
     * 
     * @example
     * const half1 = new Frac(1, 2);  // (1 / 2)
     * const half2 = new Frac(2, 4);  // (2 / 4)
     * 
     * half1.add$(half2);  // (1 / 1)
     * 
     * half1;  // (1 / 1)
     * half2;  // (2 / 4)
     */
    public add$(other: Frac): IrreducibleFrac {
        return this.add$$(new Frac(other));
    }

    /**
     * Returns the sum of two fractions (destructive / argument value will be reduced).
     * 
     * @example
     * const half1 = new Frac(1, 2);  // (1 / 2)
     * const half2 = new Frac(2, 4);  // (2 / 4)
     * 
     * half1.add$$(half2);  // (1 / 1)
     * 
     * half1;  // (1 / 1)
     * half2;  // (1 / 2)
     */
    public add$$(other: Frac): IrreducibleFrac {
        const [l, r] = [this.reduce$(), other.reduce$()];
        const d = Arith.lcm(l.d, r.d);

        this.n = d / l.d * l.n + d / r.d * r.n;
        this.d = d;
        return this.reduce$();
    }

    /**
     * Returns the subtraction of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const zero = half.sub(half);  // (0 / 1)
     */
    public sub(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return new Frac(this).sub$$(new Frac(...other));
    }

    /**
      * Returns the subtraction of two fractions (destructive / argument value will not be changed).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.sub$(half2);  // (0 / 1)
      * 
      * half1;  // (0 / 1)
      * half2;  // (2 / 4)
      */
    public sub$(other: Frac): IrreducibleFrac {
        return this.sub$$(new Frac(other));
    }

    /**
      * Returns the subtraction of two fractions (destructive / argument value will be reduced).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.sub$$(half2);  // (0 / 1)
      * 
      * half1;  // (0 / 1)
      * half2;  // (1 / 2)
      */
    public sub$$(other: Frac): IrreducibleFrac {
        const r = other.reduce$();
        return this.add$$(Frac.#from(-r.n, r.d));
    }

    /**
     * Returns the production of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half    = new Frac(1, 2);  // (1 / 2)
     * const quarter = half.mul(half);  // (1 / 4)
     */
    public mul(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return new Frac(this).mul$$(new Frac(...other));
    }

    /**
      * Returns the production of two fractions (destructive / argument value will be reduced).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.mul$$(half2);  // (1 / 4)
      * 
      * half1;  // (1 / 4)
      * half2;  // (1 / 2)
      */
    public mul$$(other: Frac): IrreducibleFrac {
        return this.mul$(other.reduce$());
    }

    /**
      * Returns the production of two fractions (destructive / argument value will not be changed).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.mul$(half2);  // (1 / 4)
      * 
      * half1;  // (1 / 4)
      * half2;  // (2 / 4)
      */
    public mul$(other: Frac): IrreducibleFrac {

        let n = other.#n;
        let d = other.#d;

        if (typeof this.#n === "number" && typeof d === "number") {
            [this.#n, d] = Arith.ratio(this.#n, d);
        }

        if (typeof this.#d === "number" && typeof n === "number") {
            [this.#d, n] = Arith.ratio(this.#d, n);
        }

        if (typeof this.#n === "number" && typeof n === "number") {
            this.n = this.#n * n;
        } else {
            this.#n = Frac.#from(this.#n).mul$$(Frac.#from(n));
        }

        if (typeof this.#d === "number" && typeof d === "number") {
            this.d = this.#d * d;
        } else {
            this.#d = Frac.#from(this.#d).mul$$(Frac.#from(d));
        }

        return this.reduce$();
    }

    /**
     * Returns the quotient of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const one  = half.div(half);  // (1 / 1)
     */
    public div(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return new Frac(this).div$$(new Frac(...other));
    }

    /**
      * Returns the quotient of two fractions (destructive / argument value will not be changed).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.div$(half2);  // (1 / 1)
      * 
      * half1;  // (1 / 1)
      * half2;  // (2 / 4)
      */
    public div$(other: Frac): IrreducibleFrac {
        return this.div$$(new Frac(other));
    }

    /**
      * Returns the quotient of two fractions (destructive / argument value will be reduced).
      * 
      * @example
      * const half1 = new Frac(1, 2);  // (1 / 2)
      * const half2 = new Frac(2, 4);  // (2 / 4)
      * 
      * half1.div$$(half2);  // (1 / 1)
      * 
      * half1;  // (1 / 1)
      * half2;  // (1 / 2)
      */
    public div$$(other: Frac): IrreducibleFrac {
        const result = this.mul$$(other.inv$());
        other.inv$().reduce$();
        return result;
    }

    /**
     * Returns the fraction taken to a specified power.
     * 
     * @param power the exponent value
     * 
     * @example
     * const half    = new Frac(1, 2);  // (1 / 2)
     * const quarter = half.pow(2);     // (1 / 4)
     */
    public pow(power: number): IrreducibleFrac {
        return new Frac(this).pow$(power);
    }

    /**
      * Returns the fraction taken to a specified power (destructive).
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.pow$(2);  // (1 / 4)
      * 
      * half;  // (1 / 4)
      */
    public pow$(power: number): IrreducibleFrac {
        if (power < 0) {
            power = Math.abs(power);
            this.inv$();
        }

        const frac = this.reduce$();

        frac.n **= power.valueOf();
        frac.d **= power.valueOf();

        return frac;
    }

    /**
     * Returns the reduced fraction.
     * 
     * @example
     * const half = new Frac(2, 4);  // (2 / 4)
     * 
     * half.reduce();  // (1 / 2)
     */
    public reduce(): IrreducibleFrac {
        return new Frac(this).reduce$();
    }

    /**
     * Returns the reduced fraction (destructive).
     * 
     * @example
     * const half = new Frac(2, 4);  // (2 / 4)
     * 
     * half.reduce$();  // (1 / 2)
     * 
     * half;  // (1 / 2)
     */
    public reduce$(): IrreducibleFrac {
        if (typeof this.#n === "number" && typeof this.#d === "number") {

            const s = Arith.gcd(this.#n, this.#d);
            const sign = Math.sign(this.#d);


            this.n = this.#n / Math.abs(s) * sign;
            this.d = Math.abs(this.#d / s);

        } else {
            const frac = Frac.#from(this.#n).div$$(Frac.#from(this.#d));
            [this.#n, this.#d] = [frac.#n, frac.#d];
        }

        return this as IrreducibleFrac;
    }

    /**
      * Compare the value of two fractions with a callback function.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.compare((a, b) => a === b, half);  // true
      * half.compare((a, b) => a < b, 1, 3);    // false
      */
    public compare(compareFn: (a: number, b: number) => boolean, ...other: ConstructorParameters<typeof Frac>) {
        const l = this.valueOf();
        const r = new Frac(...other).valueOf();

        return compareFn(l, r);
    }

    /**
     * Returns whether the value of the object is equal to the value of the given fraction. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * 
     * half.eq(half);  // true
     * half.eq(1, 3);  // false
     */
    public eq(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a === b, ...other);
    }

    /**
      * Returns whether the value of the object is not equal to the value of the given fraction. The parameter types are the same as those of the constructor.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.neq(half);  // false
      * half.neq(1, 3);  // true
      */
    public neq(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a !== b, ...other);
    }

    /**
      * Returns whether the value of the object is greater than the value of the given fraction. The parameter types are the same as those of the constructor.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.gt(half);  // false
      * half.gt(1, 3);  // true
      */
    public gt(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a > b, ...other);
    }

    /**
      * Returns whether the value of the object is less than the value of the given fraction. The parameter types are the same as those of the constructor.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.lt(half);  // false
      * half.lt(1, 3);  // false
      */
    public lt(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a < b, ...other);
    }

    /**
      * Returns whether the value of the object is greater than or equal to the value of the given fraction. The parameter types are the same as those of the constructor.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.ge(half);  // true
      * half.ge(1, 3);  // true
      */
    public ge(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a >= b, ...other);
    }

    /**
      * Returns whether the value of the object is less than or equal to the value of the given fraction. The parameter types are the same as those of the constructor.
      * 
      * @example
      * const half = new Frac(1, 2);  // (1 / 2)
      * 
      * half.ge(half);  // true
      * half.ge(1, 3);  // false
      */
    public le(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a <= b, ...other);
    }

    /**
     * Returns a string representation of the fraction.
     * 
     * @param spaces number of whitespaces
     * @param indent indent size of the first line
     * @param indentLevel indent level
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * 
     * half.toString();  // "(1 / 2)"
     * 
     * const nest = new Frac(half, half);  // ((1 / 2) / (1 / 2))
     * 
     * nest.toString();  // "((1 / 2) / (1 / 2))"
     */
    public toString(spaces = 1, indent = 0, indentLevel = 0): string {
        const newLine = indentLevel > 0 ? "\n" : "";
        const whiteSpace = " ".repeat(spaces);
        return `(${newLine}${" ".repeat(indent + indentLevel)}${typeof this.n === "number" ? this.n : this.n.toString(spaces, indent + indentLevel, indentLevel)}${whiteSpace}/${whiteSpace}${typeof this.d === "number" ? this.d : this.d.toString(spaces, indent + indentLevel, indentLevel)}${newLine}${" ".repeat(indent)})`;
    }

    /**
     * Returns the value of the fraction as a number. This method will be called when an arithmetic operator is applied to the Frac instances.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * 
     * half.valueOf();  // 0.5
     * 
     * half + half;     // 1
     */
    public valueOf(): number {
        const x = this.reduce();

        return x.n / x.d;
    }
}
