import {TraceMap, originalPositionFor} from '@jridgewell/trace-mapping';

/**
 * Applies a sourcemap to Stylelint result.
 *
 * @param {Object} lintResult - Result of StyleLint.
 * @param {Object} sourceMap - Sourcemap object.
 * @return {Object} Rewritten Stylelint result.
 */
export default async function applySourcemap(lintResult, sourceMap) {
  const sourceMapConsumer = new TraceMap(sourceMap);

  lintResult.results = lintResult.results.reduce((memo, result) => {
    if (result.warnings.length) {
      result.warnings.forEach(warning => {
        const origPos = originalPositionFor(sourceMapConsumer, warning);
        const sameSourceResultIndex = memo.findIndex(r => r.source === origPos.source);

        warning.line = origPos.line;
        warning.column = origPos.column;

        if (sameSourceResultIndex === -1) {
          memo.push(Object.assign({}, result, {
            source: origPos.source,
            warnings: [warning]
          }));
        } else {
          memo[sameSourceResultIndex].warnings.push(warning);
        }
      });
    } else {
      memo.push(result);
    }

    return memo;
  }, []);

  return lintResult;
}
