import Frac from "./Frac.js";

/**
 * An interface for representing irreducible fractions.
 */
export default interface IrreducibleFrac extends Frac {
    n: number;  // numerator
    d: number;  // denominator
}
