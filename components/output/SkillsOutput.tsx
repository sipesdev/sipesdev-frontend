import { SKILLS } from "@/lib/constants";

function formatLabel(key: string): string {
  return key.replace(/_/g, " ");
}

export function SkillsOutput() {
  const labelWidth = Math.max(
    ...Object.keys(SKILLS).map((k) => formatLabel(k).length)
  );

  return (
    <div>
      <div className="text-ctp-mauve mb-2">Skills</div>
      {Object.entries(SKILLS).map(([category, items]) => (
        <div key={category} className="flex gap-4">
          <span
            className="text-ctp-peach shrink-0"
            style={{ width: `${labelWidth}ch` }}
          >
            {formatLabel(category)}
          </span>
          <span className="text-ctp-text">
            {items.map((item, i) => (
              <span key={item}>
                {item}
                {i < items.length - 1 && (
                  <span className="text-ctp-overlay0"> | </span>
                )}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
