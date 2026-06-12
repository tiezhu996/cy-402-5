import { Button, DatePicker, Select, Space } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import type { CaseQuery } from "../../api/case";
import type { User } from "../../types";
import { CaseStatusLabels, CaseTypeLabels } from "../../types/enums";

type Range = [Dayjs | null, Dayjs | null] | null;

export function FilterBar({
  users,
  onChange
}: {
  users: User[];
  onChange: (query: CaseQuery) => void;
}) {
  const [query, setQuery] = useState<CaseQuery>({});

  function updateQuery(partial: Partial<CaseQuery>) {
    const next = { ...query, ...partial };
    setQuery(next);
    onChange(next);
  }

  function handleReset() {
    setQuery({});
    onChange({});
  }

  return (
    <div className="toolbar-band">
      <Space wrap>
        <Select
          allowClear
          placeholder="案件类型"
          style={{ width: 140 }}
          value={query.type}
          options={Object.entries(CaseTypeLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => updateQuery({ type: value })}
        />
        <Select
          allowClear
          placeholder="案件状态"
          style={{ width: 140 }}
          value={query.status}
          options={Object.entries(CaseStatusLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => updateQuery({ status: value })}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="主办/协办律师"
          style={{ width: 180 }}
          value={query.lawyerId}
          options={users.map((user) => ({ value: user.id, label: user.name }))}
          onChange={(value) => updateQuery({ lawyerId: value })}
        />
        <DatePicker.RangePicker
          value={
            query.startDate && query.endDate
              ? [dayjs(query.startDate), dayjs(query.endDate)]
              : null
          }
          onChange={(range: Range) => {
            updateQuery({
              startDate: range?.[0]?.format("YYYY-MM-DD"),
              endDate: range?.[1]?.format("YYYY-MM-DD")
            });
          }}
        />
        <Button onClick={handleReset}>重置</Button>
      </Space>
    </div>
  );
}

