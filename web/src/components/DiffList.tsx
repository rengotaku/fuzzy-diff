import type { DiffItem } from "verify-ai";

const DIFF_LABELS: Record<DiffItem["type"], string> = {
  added: "追加",
  removed: "欠落",
  changed: "変更",
};

const typeClasses: Record<DiffItem["type"], string> = {
  added: "bg-diff-added-bg text-diff-added-text border-l-4 border-diff-added-text",
  removed:
    "bg-diff-removed-bg text-diff-removed-text border-l-4 border-diff-removed-text",
  changed:
    "bg-diff-changed-bg text-diff-changed-text border-l-4 border-diff-changed-text",
};

interface DiffListProps {
  diffs: readonly DiffItem[];
}

export function DiffList({ diffs }: DiffListProps) {
  if (diffs.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-600">差分なし</p>
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 space-y-2">
      {diffs.map((diff, index) => (
        <li
          key={index}
          data-diff-type={diff.type}
          className={`p-3 rounded-md ${typeClasses[diff.type]}`}
        >
          <span className="text-xs font-bold block">{DIFF_LABELS[diff.type]}</span>
          <span className="text-sm font-mono block mb-1">{diff.path}</span>
          {diff.type === "changed" ? (
            <>
              <div data-value-type="source" className="text-sm">
                {diff.sourceValue}
              </div>
              <div data-value-type="target" className="text-sm">
                {diff.targetValue}
              </div>
            </>
          ) : (
            <div className="text-sm">
              {diff.type === "added" ? diff.targetValue : diff.sourceValue}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
