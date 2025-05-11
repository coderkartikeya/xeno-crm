import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable, useDraggable, SortableContext, arrayMove } from '@dnd-kit/core';

const fields = [
  { label: 'Spend', value: 'spend' },
  { label: 'Visits', value: 'visits' },
  { label: 'Age', value: 'age' },
];
const operators = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
];

function RuleRow({ rule, onChange, onRemove, id }) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded mb-2 bg-white dark:bg-gray-900">
      <select value={rule.field} onChange={e => onChange({ ...rule, field: e.target.value })} className="border rounded p-1">
        {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <select value={rule.operator} onChange={e => onChange({ ...rule, operator: e.target.value })} className="border rounded p-1">
        {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input type="number" value={rule.value} onChange={e => onChange({ ...rule, value: e.target.value })} className="border rounded p-1 w-20" />
      <button onClick={onRemove} className="text-red-500 ml-2">✕</button>
    </div>
  );
}

function Group({ group, onChange, onRemove, isRoot = false }) {
  const handleRuleChange = (idx, newRule) => {
    const newRules = group.rules.slice();
    newRules[idx] = newRule;
    onChange({ ...group, rules: newRules });
  };
  const handleRemoveRule = idx => {
    const newRules = group.rules.slice();
    newRules.splice(idx, 1);
    onChange({ ...group, rules: newRules });
  };
  const handleAddRule = () => {
    onChange({ ...group, rules: [...group.rules, { field: 'spend', operator: '>', value: 0 }] });
  };
  const handleAddGroup = () => {
    onChange({ ...group, rules: [...group.rules, { logic: 'AND', rules: [] }] });
  };
  const handleLogicChange = e => {
    onChange({ ...group, logic: e.target.value });
  };
  return (
    <div className="border-2 border-blue-400 rounded p-3 mb-2 bg-blue-50 dark:bg-blue-950">
      <div className="flex items-center gap-2 mb-2">
        <select value={group.logic} onChange={handleLogicChange} className="border rounded p-1 font-bold">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        {!isRoot && <button onClick={onRemove} className="text-red-500">Remove Group</button>}
      </div>
      <div className="ml-4">
        {group.rules.map((rule, idx) =>
          rule.rules ? (
            <Group
              key={idx}
              group={rule}
              onChange={newGroup => handleRuleChange(idx, newGroup)}
              onRemove={() => handleRemoveRule(idx)}
            />
          ) : (
            <RuleRow
              key={idx}
              rule={rule}
              onChange={newRule => handleRuleChange(idx, newRule)}
              onRemove={() => handleRemoveRule(idx)}
            />
          )
        )}
        <div className="flex gap-2 mt-2">
          <button onClick={handleAddRule} className="bg-green-500 text-white px-2 py-1 rounded">+ Rule</button>
          <button onClick={handleAddGroup} className="bg-blue-500 text-white px-2 py-1 rounded">+ Group</button>
        </div>
      </div>
    </div>
  );
}

export default function SegmentBuilder({ value, onChange }) {
  const [rules, setRules] = useState(value || { logic: 'AND', rules: [] });
  const handleChange = newRules => {
    setRules(newRules);
    onChange && onChange(newRules);
  };
  return (
    <div>
      <Group group={rules} onChange={handleChange} isRoot />
    </div>
  );
} 