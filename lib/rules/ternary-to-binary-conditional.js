/**
 * @fileoverview (t ? c : false) to (t &amp;&amp; c)
 * @author milahu@gmail.com
 * @license CC-0
 */
"use strict";

const astUtils = require("eslint/lib/rules/utils/ast-utils");
const OR_PRECEDENCE = astUtils.getPrecedence({ type: "LogicalExpression", operator: "||" });

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

  meta: {

    docs: {
        description: "transform (t ? c : expr) to (t && c) if eval(testExpression) is true",
        category: "Stylistic Issues",
        recommended: false
    },

    fixable: "code",

    messages: {
      alternativeConditionIsFalse: "Alternative condition is false according to rule config.",
    },

    schema: [
      {
        type: "object",
        properties: {
          testVariant: {
            type: "string",
            default: "strict"
          },
          testExpression: {
            type: "string",
            default: ""
          },
        },
        additionalProperties: false
      }
    ]
  },

  create: function(context) {

    const options = context.options[0] || {};

    let testVariant = options.testVariant || "strict";
    let testExpression = options.testExpression || "";

    function evalTestExpression(testExpression, exprSrc) {
      // testExpression samples:
      // "expr === false || expr === 0"
      // "exprSrc === 'void 0'"
      const expr = eval(exprSrc);
      return eval('Boolean(' + testExpression + ')');
    }

    // validate the testExpression
    if (testExpression !== "") {
      try {
        evalTestExpression(testExpression, "true");
      } catch (e) {
        console.log('error. could not eval testExpression with expr = true. fallback to testVariant = '+testVariant);
        testExpression = "";
      }
    }

    // key: testVariant
    // val: testExpression
    const testExpressionPresets = {
      "strict": "expr === false",
      "abstract": "expr == false",
      "bool": "!expr",
      "bool-or-abstract": "!expr || expr == false",
      "react": "expr === false || expr === null || expr === undefined",
      "coffeescript": "exprSrc === 'void 0'",
    }

    // use preset testExpression
    if (testExpression === "") {
      if (testVariant in testExpressionPresets) {
        testExpression = testExpressionPresets[testVariant];
      } else {
        console.log('error: testVariant is invalid, fallback to "strict"')
        testVariant = "strict";
        testExpression = testExpressionPresets[testVariant];
      }
    }

    const sourceCode = context.getSourceCode();

    /**
     * Tests if a given node always evaluates to false
     * according to option.testVariant or option.testExpression
     * @param {ASTNode} node An expression node
     * @returns {boolean} True if the node will always evaluate to false
     */
    function isFalseExpression(node) {
      const exprSrc = astUtils.getParenthesisedText(sourceCode, node);

      try {
        return evalTestExpression(testExpression, exprSrc);
      } catch (e) {
        // eval fails on variable expression
        // variable expression is not false
        return false;
      }
    }

    return {
      ConditionalExpression(node) {
        if (isFalseExpression(node.alternate)) {
          context.report({
            node,
            messageId: "alternativeConditionIsFalse",
            fix: fixer => {
              // copy paste from eslint/lib/rules/no-unneeded-ternary.js
              // not sure if this is needed, but it works
              const shouldParenthesizeConsequent =
                (
                  astUtils.getPrecedence(node.consequent) < OR_PRECEDENCE ||
                  astUtils.isCoalesceExpression(node.consequent)
                ) &&
                !astUtils.isParenthesised(sourceCode, node.consequent);
              const consequentText = shouldParenthesizeConsequent
                ? `(${sourceCode.getText(node.consequent)})`
                : astUtils.getParenthesisedText(sourceCode, node.consequent);
              const testText = astUtils.getParenthesisedText(sourceCode, node.test);

              return fixer.replaceText(node, `${testText} && ${consequentText}`);
            }
          });
        }
      }
    };
  }
};
