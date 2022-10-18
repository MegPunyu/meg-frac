import Frac from "./Frac.js";

enum Token {
    WHITESPACE,  // " "
    NUMBER,      // 0123456789
    LPAREN,      // (
    RPAREN,      // )
    DIV,         // /
}

/**
 * A helper class for parsing strings and generating Frac objects.
 */
export default class Parser {

    /**
     * Given string.
     */
    private readonly str: string;

    private readonly fracConstructor: (n: number | Frac, d: number | Frac) => Frac;

    /**
     * Current position.
     */
    public current: number;

    /**
     * Constructor.
     */
    public constructor(str: string, fracConstructor: (n: number | Frac, d: number | Frac) => Frac) {
        this.current = 0;
        this.str = str;
        this.fracConstructor = fracConstructor;
    }

    /**
     * Returns SyntaxError with message.
     */
    public errorMessage(message: string): SyntaxError {
        return new SyntaxError(message + "\n" + this.str + "\n" + " ".repeat(this.current) + "^");
    }

    /**
     * Returns a character at the current position.
     */
    public getChar(offset = 0): string {
        return this.str[this.current + offset];
    }

    /**
     * Returns the token of the character at the current position.
     */
    public getToken(): Token {
        const char = this.getChar();
        switch (char) {
            case "(": return Token.LPAREN;
            case ")": return Token.RPAREN;
            case "/": return Token.DIV;
            default: {
                if (!char || /\s/gi.test(char)) {
                    return Token.WHITESPACE;
                } else {
                    return Token.NUMBER;
                }
            }
        }
    }

    /**
     * Parses a number.
     */
    public getNumber(): number {
        let result = "";
        while (this.current < this.str.length && this.getToken() === Token.NUMBER) {
            result += this.getChar();
            ++this.current;
        }
        return +result;
    }

    /**
     * Skip whitespaces.
     */
    public eatWhitespace(): void {
        while (this.current < this.str.length && this.getToken() === Token.WHITESPACE) {
            ++this.current;
        }
    }

    /**
     * Parses a string.
     */
    public parse(): Frac {

        let numerator: number | Frac;
        let denominator: number | Frac;

        this.eatWhitespace();

        // "("
        if (this.getToken() !== Token.LPAREN) {
            throw this.errorMessage("missing \"(\"\n");
        }

        // increment the current position
        ++this.current;
        this.eatWhitespace();

        // example: "(1"
        if (this.getToken() === Token.NUMBER) {
            numerator = this.getNumber();
        }

        // example: "(("
        else if (this.getToken() === Token.LPAREN) {
            numerator = this.parse();
        }

        // example: "()"
        else {
            throw this.errorMessage("expected a number or a fraction in the numerator");
        }

        // the current position has already been incremented
        this.eatWhitespace();

        // example: "(1/"
        if (this.getToken() === Token.DIV) {
            ++this.current;
        }

        // example: "(1)"
        else {
            throw this.errorMessage("expedted \"/\"");
        }

        this.eatWhitespace();

        // example: "(1/2"
        if (this.getToken() === Token.NUMBER) {
            denominator = this.getNumber();
        }

        // example: "(1/("
        else if (this.getToken() === Token.LPAREN) {
            denominator = this.parse();
        }

        // example: "(1//"
        else {
            throw this.errorMessage("expected a number or a fraction in the denominator");
        }

        this.eatWhitespace();

        // example: "(1/2)"
        if (this.getToken() === Token.RPAREN) {
            ++this.current;
        }

        // example: "(1/2/"
        else {
            throw this.errorMessage("missing \")\"");
        }

        this.eatWhitespace();

        return this.fracConstructor(numerator, denominator);
    }
}
