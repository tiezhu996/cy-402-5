import { describe, it, expect } from "vitest";

describe("日期范围查询边界测试", () => {
  function buildEndDateLT(endDate: string): Date {
    const d = new Date(endDate);
    d.setDate(d.getDate() + 1);
    return d;
  }

  it("截止日期 endDate 加一天后，与直接构造的后一天日期相等", () => {
    const ltFromEndDate = buildEndDateLT("2026-06-12");
    const nextDay = new Date("2026-06-13");
    expect(ltFromEndDate.getTime()).toBe(nextDay.getTime());
  });

  it("截止日期当天的时间点应该小于 endDate+1 天（即被包含）", () => {
    const lt = buildEndDateLT("2026-06-12");
    const caseDate = new Date("2026-06-12");
    expect(caseDate < lt).toBe(true);
  });

  it("截止日期后一天的时间点应该大于等于 endDate+1 天（即不被包含）", () => {
    const lt = buildEndDateLT("2026-06-12");
    const caseDate = new Date("2026-06-13");
    expect(caseDate < lt).toBe(false);
  });

  it("起始日期当天的时间点应该大于等于 startDate（即被包含）", () => {
    const gte = new Date("2026-06-01");
    const caseDate = new Date("2026-06-01");
    expect(caseDate >= gte).toBe(true);
  });

  it("起始日期前一天的时间点应该小于 startDate（即不被包含）", () => {
    const gte = new Date("2026-06-01");
    const caseDate = new Date("2026-05-31");
    expect(caseDate >= gte).toBe(false);
  });

  it("完整日期范围：起始当天包含，截止当天包含，范围外排除", () => {
    const gte = new Date("2026-06-01");
    const lt = buildEndDateLT("2026-06-12");

    const caseStart = new Date("2026-06-01");
    const caseMiddle = new Date("2026-06-06");
    const caseEnd = new Date("2026-06-12");
    const caseBefore = new Date("2026-05-31");
    const caseAfter = new Date("2026-06-13");

    function inRange(d: Date) {
      return d >= gte && d < lt;
    }

    expect(inRange(caseStart)).toBe(true);
    expect(inRange(caseMiddle)).toBe(true);
    expect(inRange(caseEnd)).toBe(true);
    expect(inRange(caseBefore)).toBe(false);
    expect(inRange(caseAfter)).toBe(false);
  });
});
