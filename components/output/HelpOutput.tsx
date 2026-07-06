import { getCommands } from "@/lib/commands";

export function HelpOutput() {
  const commands = getCommands();
  const entries = Array.from(commands.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      <div className="text-mb-accent mb-2">Available commands:</div>
      {entries.map((cmd) => (
        <div key={cmd.name} className="flex gap-2">
          <span className="text-mb-accent w-24 shrink-0">{cmd.name}</span>
          <span className="text-mb-overlay1">
            {cmd.description}
            {cmd.usage && (
              <span className="text-mb-overlay0 ml-2">
                Usage: {cmd.usage}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
