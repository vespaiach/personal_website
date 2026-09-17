import { getAvailablePaths, isDirectory } from "../lib/path.ts";
import { Command, type CommandContext, type CommandResult } from "./Command.ts";

interface TreeNode {
  children: Map<string, TreeNode>;
}

function buildTree(target: string, paths: Record<string, boolean>): TreeNode {
  const prefix = target === "/" ? "/" : `${target}/`;
  const root: TreeNode = { children: new Map() };

  for (const path of Object.keys(paths)) {
    if (path === target || !path.startsWith(prefix)) continue;

    let node = root;
    for (const segment of path.slice(prefix.length).split("/")) {
      let child = node.children.get(segment);
      if (!child) {
        child = { children: new Map() };
        node.children.set(segment, child);
      }
      node = child;
    }
  }

  return root;
}

function renderChildren(node: TreeNode, prefix: string, lines: string[]): void {
  const entries = [...node.children.entries()].sort(([a], [b]) => a.localeCompare(b));
  entries.forEach(([name, child], index) => {
    const isLast = index === entries.length - 1;
    lines.push(`${prefix}${isLast ? "└── " : "├── "}${name}`);
    renderChildren(child, `${prefix}${isLast ? "    " : "│   "}`, lines);
  });
}

export class TreeCommand extends Command {
  readonly name = "tree";
  readonly syntax = "tree [directory_path]";
  readonly description = "Print a directory's contents as a tree.";
  protected readonly argRule = "optional" as const;

  async execute(arg: string | undefined, { cwd }: CommandContext): Promise<CommandResult> {
    const target = arg ? this.resolvePath(arg, cwd) : cwd;
    const paths = getAvailablePaths();
    if (!isDirectory(target, paths)) {
      return { kind: "error", message: `tree: ${arg ?? cwd}: No such directory` };
    }

    const lines = [target];
    renderChildren(buildTree(target, paths), "", lines);
    return { kind: "text", text: lines.join("\n") };
  }
}