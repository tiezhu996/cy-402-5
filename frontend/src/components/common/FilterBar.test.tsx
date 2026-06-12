import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";
import type { CaseQuery } from "../../api/case";
import type { User } from "../../types";

const mockUsers: User[] = [
  { id: "user-1", name: "张三", email: "zhangsan@example.com", primaryRole: "lawyer" },
  { id: "user-2", name: "李四", email: "lisi@example.com", primaryRole: "lawyer" }
];

function getSelectByPlaceholder(placeholder: string) {
  return screen
    .getAllByRole("combobox")
    .find(
      (el) =>
        el.closest(".ant-select")?.querySelector(".ant-select-selection-placeholder")
          ?.textContent === placeholder
    ) as HTMLElement;
}

describe("FilterBar 组件渲染测试", () => {
  it("先选案件类型再选日期范围，onChange 收到完整的组合查询条件", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(query: CaseQuery) => void>();

    render(<FilterBar users={mockUsers} onChange={onChange} />);

    const typeSelect = getSelectByPlaceholder("案件类型");
    await user.click(typeSelect);
    await user.click(screen.getByText("民事"));

    expect(onChange).toHaveBeenLastCalledWith({ type: "civil" });

    const dateInputs = screen.getAllByRole("textbox");
    const startInput = dateInputs.find(
      (el) => el.getAttribute("placeholder") === "Start date"
    ) as HTMLInputElement;
    const endInput = dateInputs.find(
      (el) => el.getAttribute("placeholder") === "End date"
    ) as HTMLInputElement;

    await user.click(startInput);
    await user.clear(startInput);
    await user.keyboard("2026-06-01");
    await user.keyboard("{Tab}");
    await user.clear(endInput);
    await user.keyboard("2026-06-30");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({
        type: "civil",
        startDate: "2026-06-01",
        endDate: "2026-06-30"
      });
    });
  });

  it("依次选择状态、律师、日期，所有条件都正确叠加", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(query: CaseQuery) => void>();

    render(<FilterBar users={mockUsers} onChange={onChange} />);

    const statusSelect = getSelectByPlaceholder("案件状态");
    await user.click(statusSelect);
    await user.click(screen.getByText("调查"));
    expect(onChange).toHaveBeenLastCalledWith({ status: "investigating" });

    const lawyerSelect = getSelectByPlaceholder("主办/协办律师");
    await user.click(lawyerSelect);
    await user.click(screen.getByText("张三"));
    expect(onChange).toHaveBeenLastCalledWith({
      status: "investigating",
      lawyerId: "user-1"
    });

    const dateInputs = screen.getAllByRole("textbox");
    const startInput = dateInputs.find(
      (el) => el.getAttribute("placeholder") === "Start date"
    ) as HTMLInputElement;
    const endInput = dateInputs.find(
      (el) => el.getAttribute("placeholder") === "End date"
    ) as HTMLInputElement;

    await user.click(startInput);
    await user.clear(startInput);
    await user.keyboard("2026-01-01");
    await user.keyboard("{Tab}");
    await user.clear(endInput);
    await user.keyboard("2026-12-31");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({
        status: "investigating",
        lawyerId: "user-1",
        startDate: "2026-01-01",
        endDate: "2026-12-31"
      });
    });
  });

  it("点击重置按钮，onChange 收到空查询对象", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(query: CaseQuery) => void>();

    render(<FilterBar users={mockUsers} onChange={onChange} />);

    const typeSelect = getSelectByPlaceholder("案件类型");
    await user.click(typeSelect);
    await user.click(screen.getByText("刑事"));

    const resetButton = screen.getByRole("button", { name: "重 置" });
    await user.click(resetButton);

    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("选择类型后，Select 组件显示正确的选中值", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(query: CaseQuery) => void>();

    render(<FilterBar users={mockUsers} onChange={onChange} />);

    const typeSelect = getSelectByPlaceholder("案件类型");
    const selectWrapper = typeSelect.closest(".ant-select") as HTMLElement;

    expect(
      within(selectWrapper).queryByText("民事", { selector: ".ant-select-selection-item" })
    ).not.toBeInTheDocument();

    await user.click(typeSelect);
    await user.click(screen.getByText("民事"));

    expect(
      within(selectWrapper).getByText("民事", { selector: ".ant-select-selection-item" })
    ).toBeInTheDocument();
  });
});
