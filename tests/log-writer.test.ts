import { describe, expect, it } from "vitest";
import { appendLedgerEntry, formatLedgerEntry } from "../src/log-writer";

describe("formatLedgerEntry", () => {
  it("formats a minimal work ledger entry", () => {
    expect(formatLedgerEntry({
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Completed",
      taskText: "[[Project Note]] Draft proposal",
    })).toBe("- 09:00-09:25 | Work | 25m | Completed | [[Project Note]] Draft proposal");
  });
});

describe("appendLedgerEntry", () => {
  it("creates a date heading in an empty log", () => {
    const result = appendLedgerEntry("", {
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Completed",
      taskText: "Draft proposal",
    });

    expect(result).toBe("## 2026-05-02\n\n- 09:00-09:25 | Work | 25m | Completed | Draft proposal\n");
  });

  it("appends under an existing date heading without rewriting old entries", () => {
    const source = "## 2026-05-02\n\n- 08:00-08:25 | Work | 25m | Completed | First\n";
    const result = appendLedgerEntry(source, {
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Reset",
      taskText: "Second",
    });

    expect(result).toBe("## 2026-05-02\n\n- 08:00-08:25 | Work | 25m | Completed | First\n- 09:00-09:25 | Work | 25m | Reset | Second\n");
  });
});
