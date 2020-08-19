/**
 * @fileoverview (t ? c : false) to (t &amp;&amp; c)
 * @author milahu@gmail.com
 * @license CC-0
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/ternary-to-binary-conditional");
var RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("ternary-to-binary-conditional", rule, {

  valid: [
    {
      code: "t ? c : true",
    },
    {
      code: "/* abstract */ t ? c : []",
    },
    {
      code: "/* bool */ t ? c : null",
    },
  ],

  invalid: [
    {
      code: "/* default */ t ? c : false; t ? c : []; t ? c : null",
      output: "/* default */ t && c; t ? c : []; t ? c : null",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testVariant: "strict" }],
      code: "/* strict */ t ? c : false; t ? c : []; t ? c : null",
      output: "/* strict */ t && c; t ? c : []; t ? c : null",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testVariant: "abstract" }],
      code: "/* abstract */ t ? c : false; t ? c : []; t ? c : null",
      output: "/* abstract */ t && c; t && c; t ? c : null",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testVariant: "bool" }],
      code: "/* bool */ t ? c : false; t ? c : []; t ? c : null",
      output: "/* bool */ t && c; t ? c : []; t && c",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testVariant: "bool-or-abstract" }],
      code: "/* bool-or-abstract */ t ? c : false; t ? c : []; t ? c : null",
      output: "/* bool-or-abstract */ t && c; t && c; t && c",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
        {messageId: "alternativeConditionIsFalse"},
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testVariant: "coffeescript" }],
      code: "/* coffeescript */ t ? c : void 0; t ? c : undefined",
      output: "/* coffeescript */ t && c; t ? c : undefined",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
    {
      options: [{ testExpression: "expr === 'foo'" }],
      code: "/* expr === 'foo' */ t ? c : 'foo'",
      output: "/* expr === 'foo' */ t && c",
      errors: [
        {messageId: "alternativeConditionIsFalse"},
      ]
    },
  ]
});
