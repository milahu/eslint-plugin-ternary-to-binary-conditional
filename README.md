# eslint-plugin-ternary-to-binary-conditional

transform `(t ? c : expr)` to `(t && c)`  
if `expr` is a variant of false

the "false variant" is defined in the rule config

note: this is a lossy transform.  
if it works for your code depends on  
how the return value of `r=(t ? c : expr)` is tested

for example, when r is tested with a 'bool test' like  
`if (r) {c} else {a}` or `(r && c)` or `(r ? c : a)`  
then you can use the testVariant 'bool'  
and the transform is lossless for your code

## Installation

First install [ESLint](http://eslint.org):

```
$ npm i -D eslint
```

Second install `eslint-plugin-ternary-to-binary-conditional`:

```
$ git clone --depth=1 https://github.com/milahu/eslint-plugin-ternary-to-binary-conditional
$ npm i -D eslint-plugin-ternary-to-binary-conditional
```

if you prefer `pnpm`, it needs the absolute path:
```
$ pnpm i -D $(readlink -f eslint-plugin-ternary-to-binary-conditional)
```

## Use

If you have no `.eslintrc.js` config file,  
run `eslint --init` to create a new one

Add plugin and rule to your `.eslintrc.js`:

```js
module.exports = {
  // ...
  "plugins": [
    "ternary-to-binary-conditional",
  ],
  "rules": {
    "ternary-to-binary-conditional/ternary-to-binary-conditional": [
      "error", {
        testVariant: "strict",
        //testExpression: "exprSrc === 'void 0'",
      }
    ],
  },
};
```

## Config

There are (at least) three types of false in javascript:

1. strict false: `expr === false`
2. abstract false: `expr == false`
3. bool false: `Boolean(expr) === false`

Sample "false expressions" are

1. strict: `[ false ]`
2. abstract: `[ false, "", 0, -0, +0, [0], [], [[]], {[]}, {[[]]}, .... ]`
3. bool: `[ false, "", 0, -0, +0, NaN, void 0, undefined, null, {}, {{}}, .... ]`

bool false is used in

* `if (expr) {cond}` (if branch)
* `if (expr) {cond} else {alt}` (if else branch)
* `(expr && cond)` (binary conditional expression)
* `(expr ? cond : alt)` (ternary conditional expression)

The option `testVariant` or `testExpression` decides,  
how `expr` is tested in the ternary conditional `(t ? c : expr)`

Values for `testVariant` are defined in `testExpressionPresets`  
in the file `lib/rules/ternary-to-binary-conditional.js`

Each testVariant sets a testExpression:

* strict: `expr === false`
* abstract: `expr == false`
* bool: `!expr`
* bool-or-abstract: `!expr || expr == false`
* react: `expr === false || expr === null || expr === undefined`
* coffeescript: `exprSrc === 'void 0'`

If you need a custom test expression,  
you can set `testExpression` to something like

* `expr === null || expr === undefined`
* `exprSrc === 'void 0'`
* `(()=>{return exprSrc === 'false';})()`

testExpression can test `expr` or `exprSrc`

if `testExpression` is set, `testVariant` is ignored

## Background

the coffeescript compiler `coffee -c`  
translates binary conditionals like `res = if test then cond`  
to ternary conditionals like `res = test ? cond : void 0`  

for example,  
when transforming React CJSX (coffee-JSX) to JSX code:

```cjsx
# cjsx
f = () ->
  <Component arg={if test then "cond"} />
```

```jsx
// jsx
f = () => (
  <Component arg={test ? "cond" : void 0} />
);
```

but the expected result is
```jsx
// jsx
f = () => (
  <Component arg={test && "cond"} />
);
```

such ternary conditionals are unnecessary in some situations  
more precise:  
when `res` is tested with a 'bool test'

this plugin was made to remove such unneeded ternary conditionals  
and transform them to `res = test && cond`

## Related

the rule `ternary-to-binary-conditional` is similar  
to the eslint rule [no-unneeded-ternary](https://eslint.org/docs/2.0.0/rules/no-unneeded-ternary) ([source](https://github.com/eslint/eslint/blob/master/lib/rules/no-unneeded-ternary.js))

## License

[license](LICENSE) is CC-0 aka "creative commons zero"
