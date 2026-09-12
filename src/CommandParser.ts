export interface CommandObject {
  command: string
  arg?: string
}

export interface ParseResult {
  success: boolean
  result: CommandObject[]
  error: string | null
}

type ArgRule = 'required' | 'optional' | 'none'

const COMMAND_ARG_RULES: Record<string, ArgRule> = {
  cat: 'required',
  ls: 'optional',
  cd: 'required',
  help: 'none',
  clear: 'none',
  tree: 'optional'
}

/**
 * Parses a raw terminal input line into an ordered list of commands.
 * Commands are separated by `&`; each command is split into its name
 * and the remainder of the segment as a single arg string (or omitted
 * when there is no arg).
 *
 * Fails (success: false, result: []) when any segment is empty — e.g.
 * blank input, or leading/trailing/repeated `&` separators — when a
 * segment's command name isn't one of the supported commands — or when
 * a command's arg doesn't match its syntax (cat/cd require an arg,
 * help/clear take none, ls/tree take an optional one).
 */
export function parseCommand(input: string): ParseResult {
  const segments = input.split('&').map((segment) => segment.trim())

  if (segments.some((segment) => segment === '')) {
    return { success: false, result: [], error: 'Wrong command syntax' }
  }

  const result: CommandObject[] = []
  for (const segment of segments) {
    const spaceIndex = segment.indexOf(' ')
    const command = spaceIndex === -1 ? segment : segment.slice(0, spaceIndex)
    const arg = spaceIndex === -1 ? undefined : segment.slice(spaceIndex + 1).trim() || undefined

    const argRule = COMMAND_ARG_RULES[command]
    if (!argRule) {
      return { success: false, result: [], error: `Unknown command: ${command}` }
    }

    if (argRule === 'required' && !arg) {
      return { success: false, result: [], error: 'Wrong command syntax' }
    }

    if (argRule === 'none' && arg) {
      return { success: false, result: [], error: 'Wrong command syntax' }
    }

    result.push(arg ? { command, arg } : { command })
  }

  return { success: true, result, error: null }
}
