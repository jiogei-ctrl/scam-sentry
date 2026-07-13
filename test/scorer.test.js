import test from "node:test";
import assert from "node:assert/strict";
import { analyzePage } from "../src/shared/scorer.js";

test("flags deceptive brand domains and password prompts", () => {
  const result = analyzePage({ url: "https://paypa1-secure-login.example.com", hasPasswordField: true, text: "Verify now" });
  assert.equal(result.level, "high");
  assert.ok(result.signals.some((signal) => signal.id === "lookalike-paypal"));
  assert.ok(result.signals.some((signal) => signal.id === "password-form"));
});

test("does not flag a legitimate brand domain as a lookalike", () => {
  const result = analyzePage({ url: "https://www.paypal.com/signin", hasPasswordField: true });
  assert.equal(result.signals.some((signal) => signal.id === "lookalike-paypal"), false);
  assert.equal(result.level, "low");
});

test("adds independent warnings without claiming certainty", () => {
  const result = analyzePage({ url: "http://192.0.2.20", text: "Guaranteed profit. Act now. Pay with USDT." });
  assert.ok(result.score >= 55);
  assert.equal(result.level, "high");
});
