/**
 * Helper to parse and normalize roll numbers.
 * Supports:
 * - Comma separated: "21BCE1001, 21BCE1002"
 * - Newline separated: "21BCE1001\n21BCE1002"
 * - Space separated
 * - Semicolon separated
 * - Numeric ranges like "101-130" or "CS101-CS120"
 * - Array of objects or strings
 */

function parseRollNumbers(input) {
  if (!input) return [];

  const rollsSet = new Set();

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        const cleaned = item.trim().toUpperCase();
        if (cleaned) rollsSet.add(cleaned);
      } else if (item && typeof item === 'object' && item.rollNumber) {
        const cleaned = String(item.rollNumber).trim().toUpperCase();
        if (cleaned) rollsSet.add(cleaned);
      }
    }
    return Array.from(rollsSet).map(roll => ({ rollNumber: roll, studentName: '' }));
  }

  if (typeof input !== 'string') return [];

  // Split by common delimiters (commas, newlines, semicolons, tabs)
  const tokens = input
    .split(/[\n,;\t]+/)
    .map(t => t.trim())
    .filter(Boolean);

  for (const token of tokens) {
    // Check if token is a range, e.g. "101-120" or "CS101-CS120" or "21BCE1001-21BCE1030"
    const rangeMatch = token.match(/^([A-Za-z0-9_-]*?)(\d+)\s*[-~to]+\s*([A-Za-z0-9_-]*?)(\d+)$/i);

    if (rangeMatch) {
      const prefix1 = rangeMatch[1];
      const startNum = parseInt(rangeMatch[2], 10);
      const prefix2 = rangeMatch[3];
      const endNum = parseInt(rangeMatch[4], 10);
      const prefix = prefix1 || prefix2 || '';

      if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum && (endNum - startNum) <= 500) {
        const padLength = Math.max(rangeMatch[2].length, rangeMatch[4].length);
        for (let i = startNum; i <= endNum; i++) {
          const numStr = String(i).padStart(padLength, '0');
          rollsSet.add((prefix + numStr).toUpperCase());
        }
        continue;
      }
    }

    // Otherwise standard token
    rollsSet.add(token.toUpperCase());
  }

  // Sort natural/alphanumeric
  const sorted = Array.from(rollsSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  return sorted.map(roll => ({ rollNumber: roll, studentName: '' }));
}

module.exports = { parseRollNumbers };
