import { resolve } from 'node:path'

import loadAdapt from './adapt.load.js'

// --------------------------------------------

test('throws an error when not given a configuration directory', () => {
  expect(() => loadAdapt({}))
    .toThrowError('configuration directory')
})

test('throws an error when given an invalid configuration directory', () => {
  expect(() => loadAdapt({ configurationDirectory: 'non/existent/dir' }))
    .toThrowError('could not be found')
})

test('gathers configuration from configuration directory in mode from process.env when given only a configuration file', () => {
  const originalMode = process.env.mode
  process.env.mode = 'dev'

  // --------------------------------------------

  const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/configurationOnly')

  const adapt = loadAdapt({ configurationDirectory })
  expect(adapt('key')).toEqual('value-dev')

  // --------------------------------------------

  process.env.mode = originalMode
})

test('gathers configuration from configuration directory in mode from process.env when given an environment file', () => {
  const originalMode = process.env.mode
  process.env.mode = 'dev'

  // --------------------------------------------

  const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

  const adapt = loadAdapt({ configurationDirectory })
  expect(adapt('key')).toEqual('value-dev')

  // --------------------------------------------

  process.env.mode = originalMode
})

test('includes environment variables in process.env when given an environment file', () => {
  process.env.KEY_FROM_PROCESS = 'process-value'

  // --------------------------------------------

  const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

  const adapt = loadAdapt({ configurationDirectory })
  expect(adapt('keyFromProcess')).toEqual('process-value')

  // --------------------------------------------

  delete process.env.KEY_FROM_PROCESS
})

test('prioritizes environment file values above process.env values when given an environment file', () => {
  process.env.DUPLICATE_KEY = 'in-process'

  // --------------------------------------------

  const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

  const adapt = loadAdapt({ configurationDirectory })
  expect(adapt('duplicateKey')).toEqual('in-file')

  // --------------------------------------------

  delete process.env.DUPLICATE_KEY
})
