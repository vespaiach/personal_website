import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { parseCommand } from './CommandParser.js'

test('parses a single command with an arg', () => {
  assert.deepEqual(parseCommand('cat abc.md'), {
    success: true,
    result: [{ command: 'cat', arg: 'abc.md' }],
    error: null
  })
})

test('parses a single command without an arg', () => {
  assert.deepEqual(parseCommand('ls'), {
    success: true,
    result: [{ command: 'ls' }],
    error: null
  })
})

test('splits chained commands on &', () => {
  assert.deepEqual(parseCommand('cd ../posts & ls'), {
    success: true,
    result: [
      { command: 'cd', arg: '../posts' },
      { command: 'ls' }
    ],
    error: null
  })
})

test('keeps absolute-path and relative-path args distinct', () => {
  assert.deepEqual(parseCommand('cd /topics & ls ../'), {
    success: true,
    result: [
      { command: 'cd', arg: '/topics' },
      { command: 'ls', arg: '../' }
    ],
    error: null
  })
})

test('collapses extra whitespace around commands and separators', () => {
  assert.deepEqual(parseCommand('  cd   ../posts   &   ls  '), {
    success: true,
    result: [
      { command: 'cd', arg: '../posts' },
      { command: 'ls' }
    ],
    error: null
  })
})

test('keeps multi-word args intact as a single arg string', () => {
  assert.deepEqual(parseCommand('cat notes on things.md'), {
    success: true,
    result: [{ command: 'cat', arg: 'notes on things.md' }],
    error: null
  })
})

test('accepts every supported command with no arg (excluding cat/cd, which require one)', () => {
  for (const command of ['ls', 'help', 'clear', 'tree']) {
    assert.deepEqual(parseCommand(command), {
      success: true,
      result: [{ command }],
      error: null
    })
  }
})

test('fails on a completely empty command', () => {
  assert.deepEqual(parseCommand(''), { success: false, result: [], error: 'Wrong command syntax' })
  assert.deepEqual(parseCommand('   '), { success: false, result: [], error: 'Wrong command syntax' })
})

test('fails on doubled separators with nothing between them', () => {
  assert.deepEqual(parseCommand('&&'), { success: false, result: [], error: 'Wrong command syntax' })
})

test('fails on leading, trailing, or repeated separators', () => {
  assert.deepEqual(parseCommand('& ls & & cd ..&'), {
    success: false,
    result: [],
    error: 'Wrong command syntax'
  })
})

test('fails on a command outside the supported list', () => {
  assert.deepEqual(parseCommand('grep -t react'), {
    success: false,
    result: [],
    error: 'Unknown command: grep'
  })
})

test('fails the whole chain if any command in it is unsupported', () => {
  assert.deepEqual(parseCommand('ls & whoami'), {
    success: false,
    result: [],
    error: 'Unknown command: whoami'
  })
})

test('fails when cat or cd is missing its required arg', () => {
  assert.deepEqual(parseCommand('cat'), { success: false, result: [], error: 'Wrong command syntax' })
  assert.deepEqual(parseCommand('cd'), { success: false, result: [], error: 'Wrong command syntax' })
})

test('fails when help or clear is given an arg', () => {
  assert.deepEqual(parseCommand('help me'), {
    success: false,
    result: [],
    error: 'Wrong command syntax'
  })
  assert.deepEqual(parseCommand('clear now'), {
    success: false,
    result: [],
    error: 'Wrong command syntax'
  })
})

test('allows ls and tree with or without an arg', () => {
  assert.deepEqual(parseCommand('ls'), { success: true, result: [{ command: 'ls' }], error: null })
  assert.deepEqual(parseCommand('ls /posts'), {
    success: true,
    result: [{ command: 'ls', arg: '/posts' }],
    error: null
  })
  assert.deepEqual(parseCommand('tree'), { success: true, result: [{ command: 'tree' }], error: null })
  assert.deepEqual(parseCommand('tree /posts'), {
    success: true,
    result: [{ command: 'tree', arg: '/posts' }],
    error: null
  })
})
