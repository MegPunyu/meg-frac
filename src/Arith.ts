/**
 * A helper class for reducing fractions.
 */
export default class Arith {
    /**
     * Returns the gratest common divisor of two numbers.
     * 
     * @param a a number
     * @param b a number
     */
    public static gcd(a: number, b: number): number {
        return b && (a %= b) ? this.gcd(b, a) : a || b;
    }

    /**
     * Returns the least common multiple of two numbers.
     * 
     * @param a a number
     * @param b a number
     */
    public static lcm(a: number, b: number): number {
        return b / this.gcd(a, b) * a;
    }

    public static ratio(a: number, b: number): number[] {
        const gcd = this.gcd(a, b);
        return [a / gcd, b / gcd];
    }
}
