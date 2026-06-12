import { describe, it, expect } from "vitest";

type CaseQuery = {
  type?: string;
  status?: string;
  lawyerId?: string;
  startDate?: string;
  endDate?: string;
};

class FilterState {
  private state: CaseQuery = {};
  private history: CaseQuery[] = [];

  update(partial: Partial<CaseQuery>): CaseQuery {
    const next = { ...this.state, ...partial };
    this.state = next;
    this.history.push(next);
    return next;
  }

  reset(): CaseQuery {
    this.state = {};
    this.history.push({});
    return {};
  }

  get current(): CaseQuery {
    return { ...this.state };
  }

  get lastSubmitted(): CaseQuery | undefined {
    return this.history[this.history.length - 1]
      ? { ...this.history[this.history.length - 1] }
      : undefined;
  }
}

describe("筛选栏状态管理 - 条件叠加测试", () => {
  it("先选类型再选日期，类型条件不丢失", () => {
    const filter = new FilterState();

    filter.update({ type: "civil" });
    expect(filter.lastSubmitted).toEqual({ type: "civil" });

    filter.update({ startDate: "2026-06-01", endDate: "2026-06-30" });
    expect(filter.lastSubmitted).toEqual({
      type: "civil",
      startDate: "2026-06-01",
      endDate: "2026-06-30"
    });
  });

  it("先选状态再选律师，状态条件不丢失", () => {
    const filter = new FilterState();

    filter.update({ status: "active" });
    expect(filter.lastSubmitted).toEqual({ status: "active" });

    filter.update({ lawyerId: "lawyer-123" });
    expect(filter.lastSubmitted).toEqual({
      status: "active",
      lawyerId: "lawyer-123"
    });
  });

  it("所有条件依次叠加，界面显示与查询条件一致", () => {
    const filter = new FilterState();

    filter.update({ type: "criminal" });
    filter.update({ status: "active" });
    filter.update({ lawyerId: "lawyer-456" });
    filter.update({ startDate: "2026-01-01", endDate: "2026-12-31" });

    expect(filter.current).toEqual({
      type: "criminal",
      status: "active",
      lawyerId: "lawyer-456",
      startDate: "2026-01-01",
      endDate: "2026-12-31"
    });
    expect(filter.lastSubmitted).toEqual(filter.current);
  });

  it("清除单个条件时，其他条件保留", () => {
    const filter = new FilterState();

    filter.update({ type: "civil", status: "active", lawyerId: "lawyer-1" });
    filter.update({ type: undefined });

    expect(filter.current).toEqual({
      type: undefined,
      status: "active",
      lawyerId: "lawyer-1"
    });
  });

  it("重置后所有条件清空", () => {
    const filter = new FilterState();

    filter.update({ type: "civil", status: "active" });
    filter.reset();

    expect(filter.current).toEqual({});
    expect(filter.lastSubmitted).toEqual({});
  });

  it("修复前的 bug 验证：每次 onChange 都用新对象会丢失之前的条件", () => {
    let query: CaseQuery = {};
    const submitted: CaseQuery[] = [];

    function onChangeBad(partial: Partial<CaseQuery>) {
      query = { ...partial };
      submitted.push({ ...query });
    }

    onChangeBad({ type: "civil" });
    expect(submitted[0]).toEqual({ type: "civil" });

    onChangeBad({ startDate: "2026-06-01", endDate: "2026-06-30" });
    expect(submitted[1]).toEqual({
      startDate: "2026-06-01",
      endDate: "2026-06-30"
    });
    expect(submitted[1].type).toBeUndefined();
  });
});
