# Frac
A class for representing real numbers as fractions.

## Features
Reduces fractions and performs arithmetic operations (add, sub, mul, div, pow) on fractions.

## Installation
```shell
npm install meg-frac
```

## Usage
### generate fractions
```javascript
import Frac from "meg-frac";

// constructor with 2 arguments
const half = new Frac(1, 2);  // (1 / 2)

// copy a fraction
const copy = new Frac(half);  // (1 / 2) <- copy of "half"

// constructor with 1 argument
const two = new Frac(2);  // (2 / 1)

// parse a string
const quarter = new Frac("(1 / 4)");  // (1 / 4)

// numerator and denominator
quarter.n;  // 1
quarter.d;  // 4
```

### nested fractions
```javascript
import Frac from "meg-frac";

const half = new Frac(1, 2);  // (1 / 2)

// nest fractions
const one = new Frac(half, half);  // ((1 / 2) / (1 / 2)) 
const two = new Frac(1, half);     // (1 / (1 / 2))

// parse a string
const three = new Frac("(1 / (1 / 3))");  // (1 / (1 / 3))
```

### reduce a fraction
```javascript
import Frac from "meg-frac";

let half = new Frac(2, 4);  // (2 / 4)

half = half.reduce();  // (1 / 2)

let one = new Frac(half, half);  // ((1 / 2) / (1 / 2)) 

one = one.reduce();  // (1 / 1)
```

### string representation
```javascript
import Frac from "meg-frac";

const half = new Frac(1, 2);

console.log(half.toString());  // "(1 / 2)"

console.log(`1 / 2 = ${half}`);  // "1 / 2 = (1 / 2)"
```

### arithmetic operations
```javascript
import Frac from "meg-frac";

const quarter = new Frac(1, 4);

// add, sub, mul, div, pow
quarter.add(quarter);  // (1 / 2)
quarter.sub(quarter);  // (0 / 1)
quarter.mul(quarter);  // (1 / 16)
quarter.div(quarter);  // (1 / 1)
quarter.pow(3);        // (1 / 64)

// inverse
quarter.inv();  // (4 / 1)

// parameter types are the same as those of the constructor.
quarter.add(1);          // (5 / 4)
quarter.sub(1, 2);       // (-1 / 4)
quarter.mul("(1 / 2)");  // (1 / 8)
```

### get value of a fraction
```javascript
import Frac from "meg-frac";

const half = new Frac(1, 2);

// print value as number
console.log(half.valueOf());  // 0.5

// use arithmetic operators
half + half;  // 1
half * half;  // 0.25
```

### compare two fractions
```javascript
import Frac from "meg-frac";

const half = new Frac(1, 2);

// ===
half.eq(half);  // true

// !==
half.neq(half);  // false

// >
half.gt(half);  // false

// >=
half.ge(half);  // true

// <
half.lt(half);  // false

// <=
half.le(half);  // true
```

### destructive methods
Methods whose names end in $ modify objects. These methods are more efficient than the methods introduced above since they do not copy objects internally.

```javascript
const half1 = new Frac(1, 2);  // (1 / 2)
const half2 = new Frac(2, 4);  // (2 / 4)

half1.add$(half2);  // (1 / 1)

half1;  // (1 / 1)  <- replaced by the result of an operation
half2;  // (2 / 4)
```

```javascript
const frac = new Frac("(1 / (1 / 2))");  // (1 / (1 / 2))

frac.reduce$();  // (2 / 1)

frac;  // (2 / 1)  <- replaced by the result of an operation
```

Methods whose names end in $$ modify arguments.
```javascript
const half1 = new Frac(1, 2);  // (1 / 2)
const half2 = new Frac(2, 4);  // (2 / 4)

half1.add$$(half2);  // (1 / 1)

half1;  // (1 / 1)  <- replaced by the result of an operation
half2;  // (1 / 2)  <- reduced
```
