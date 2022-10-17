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
    private static parse(str: string): Frac {
        const parser = new Parser(str);
        const frac = parser.parse();
        if (parser.current !== str.length) {
            throw parser.errorMessage("unexpected end of input");
        }
        return frac;
    }

    /**
     * Checks the type of argument passed to the constructor. If the type is invalid, throws TypeError.
     */
    private static formatArgumentValue(e: unknown, isNumerator: boolean): number | Frac | undefined {
        if (typeof e === "number") {
            if (Number.isSafeInteger(e)) {
                return Math.floor(e);

            } else {
                throw new TypeError(`${isNumerator ? "numerator" : "denominator"} overflowed`);
            }
        } else if (e instanceof Frac) {
            return new Frac(e.n, e.d);

        } else if (e === void 0) {
            return e;
        }
        throw new TypeError(`${isNumerator ? "numerator" : "denominator"} must be a finite number or an instances of Frac`);
    }

    /**
     * Calles itself recursively until an unnested and reduced fraction is obtained.
     */
    private static reduce(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {

        const frac = new Frac(...other);
        let val: IrreducibleFrac;

        if (typeof frac.n === "number" && typeof frac.d === "number") {
            val = frac as IrreducibleFrac;  // when numerator and denominator are both numbers

        } else {
            val = this.reduce(new Frac(frac.n).div(frac.d));
        }

        const s = Arith.gcd(val.n, val.d);
        const d = Math.round(val.d / s);
        const n = Math.round(val.n / s) * Math.sign(d);

        return new Frac(n, Math.abs(d)) as IrreducibleFrac;
    }

    /**
     * Numerator.
     */
    #n: number | Frac;

    /**
     * Denominator.
     */
    #d: number | Frac;

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
        this.#n = new Frac(value, 1).n;
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
        this.#d = new Frac(1, value).d;
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
    public constructor(numerator: string | number | Frac, denominator?: number | Frac) {
        if (typeof numerator === "string") {
            const frac = Frac.parse(numerator);
            this.#n = frac.n;
            this.#d = frac.d;
            return;
        }

        const n = Frac.formatArgumentValue(numerator, true);
        const d = Frac.formatArgumentValue(denominator, false);

        if (n === void 0) {
            throw new TypeError("numerator not specified");

        } else if (d === 0) {
            throw new TypeError("cannot divide by zero");

        } else if (d) {
            [this.#n, this.#d] = [n, d];

        } else if (typeof n === "number") {
            [this.#n, this.#d] = [n, 1];

        } else {
            [this.#n, this.#d] = [n.n, n.d];
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
        return new Frac(this).#inv();
    }

    #inv(): Frac {
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
        const [l, r] = [this.reduce(), new Frac(...other).reduce()];
        const d = Arith.lcm(l.d, r.d);

        return new Frac(Math.round(d / l.d * l.n + d / r.d * r.n), d).reduce();
    }

    /**
     * Returns the subtraction of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const zero = half.sub(half);  // (0 / 1)
     */
    public sub(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return this.add(new Frac(...other).mul(-1));
    }

    /**
     * Returns the production of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half    = new Frac(1, 2);  // (1 / 2)
     * const quarter = half.mul(half);  // (1 / 4)
     */
    public mul(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {

        // this function will be called recursively until an unnested fraction is obtained.
        const recursiveMul = (l: Frac | number, r: Frac | number): Frac | number => {

            if (typeof r === "number") {
                if (typeof l === "number") {
                    return r * l;  // recursiveMul(number, number) => number

                } else {
                    return recursiveMul(r, l);  // recursiveMul(Frac, number) => recursiveMul(number, Frac)
                }
            } else {
                if (typeof l === "number") {
                    let a = l;
                    let d = r.d;
                    if (typeof d === "number") {
                        const gcd = Arith.gcd(a, d);
                        a /= gcd;
                        d /= gcd;
                    }
                    return new Frac(recursiveMul(a, r.n), recursiveMul(1, d));  // recursiveMul(number, Frac) => new Frac(recursiveMul(number, Frac | number), recursiveMul(number, Frac | number),)

                } else {
                    let a = l.n;
                    let b = r.n;
                    let c = l.d;
                    let d = r.d;

                    if (typeof a === "number" && typeof d === "number") {
                        const gcd = Arith.gcd(a, d);
                        a /= gcd;
                        d /= gcd;
                    }

                    if (typeof b === "number" && typeof c === "number") {
                        const gcd = Arith.gcd(b, c);
                        b /= gcd;
                        c /= gcd;
                    }
                    return new Frac(recursiveMul(a, b), recursiveMul(c, d));  // recursiveMul(Frac, Frac) => new Frac(recursiveMul(Frac | number, Frac | number), recursiveMul(Frac | number, Frac | number))
                }
            }
        };

        const multipliedFrac = recursiveMul(this.reduce(), new Frac(...other).reduce()) as Frac;  // recursiveMul() returns a Frac (e.g. (2 / 4) )

        return multipliedFrac.reduce();  // reduce the result (e.g. (2 / 4) => (1 / 2) )
    }

    /**
     * Returns the quotient of two fractions. The parameter types are the same as those of the constructor.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * const one  = half.div(half);  // (1 / 1)
     */
    public div(...other: ConstructorParameters<typeof Frac>): IrreducibleFrac {
        return this.mul(new Frac(...other).#inv());
    }

    #div(other: Frac) {
        return this.mul(other.#inv());
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
        const x = this.reduce();

        return new Frac(x.n ** power, x.d ** power) as IrreducibleFrac;
    }

    public compare(compareFn: (a: number, b: number) => boolean, ...other: ConstructorParameters<typeof Frac>) {
        const l = this.valueOf();
        const r = new Frac(...other).valueOf();

        return compareFn(l, r);
    }

    /**
     * Returns whether the value of the given fraction is equal to the value of this.
     * 
     * @example
     * const half = new Frac(1, 2);  // (1 / 2)
     * 
     * half.equals(half);  // true
     * half.equals(1, 3);  // false
     */
    public eq(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a === b, ...other);
    }

    public neq(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a !== b, ...other);
    }

    public gt(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a > b, ...other);
    }

    public lt(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a < b, ...other);
    }

    public ge(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a >= b, ...other);
    }

    public le(...other: ConstructorParameters<typeof Frac>): boolean {
        return this.compare((a, b) => a <= b, ...other);
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
        return Frac.reduce(this);
    }


    /**
     * Returns a string representation of the fraction.
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
    public toString(): string {
        return `(${this.n.toString()} / ${this.d.toString()})`;
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
