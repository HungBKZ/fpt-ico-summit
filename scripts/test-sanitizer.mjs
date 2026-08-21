import { sanitizeHtml } from "../src/lib/utils/sanitizer.ts";

const testCases = [
  { input: "<script>alert(1)</script>", expected: "" },
  { input: "<img src=x onerror=alert(1)>", expected: "" },
  { input: '<a href="javascript:alert(1)">click</a>', expected: "click" },
  { input: '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>', expected: "click" },
  { input: '<div style="background:url(javascript:alert(1))">x</div>', expected: "x" },
  { input: "<svg onload=alert(1)></svg>", expected: "" },
  { input: '<p onclick="alert(1)">hello</p>', expected: "<p>hello</p>" },
  { input: '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)">click</a>', expected: "click" },
  { input: "<strong>Important</strong>", expected: "<strong>Important</strong>" },
  { input: "<ul><li>Benefit A</li></ul>", expected: "<ul><li>Benefit A</li></ul>" },
  { input: '<a href="https://example.edu">Official page</a>', expected: '<a href="https://example.edu" target="_blank" rel="noopener noreferrer">Official page</a>' },
];

let passed = 0;
let failed = 0;

console.log("Running HTML Sanitizer Security Test Suite...\n");

testCases.forEach(({ input, expected }, idx) => {
  const result = sanitizeHtml(input);
  if (result === expected) {
    console.log(`✓ Test ${idx + 1} PASSED: ${JSON.stringify(input)} -> ${JSON.stringify(result)}`);
    passed++;
  } else {
    console.error(`✕ Test ${idx + 1} FAILED: ${JSON.stringify(input)}\n  Expected: ${JSON.stringify(expected)}\n  Got:      ${JSON.stringify(result)}`);
    failed++;
  }
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
