import { cp, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'

// --------------------------------------------

const defaultConfigurationDirectory = process.cwd()
const testFixturesDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

// --------------------------------------------

beforeAll(async () => {
  await cp(testFixturesDirectory, defaultConfigurationDirectory, { recursive: true })
})

afterAll(async () => {
  await unlink(resolve(defaultConfigurationDirectory, 'adapt.json'))
  await unlink(resolve(defaultConfigurationDirectory, 'adapt.env.json'))
})

// --------------------------------------------

test('exposes the loadAdapt function for custom loading', async () => {
  const { loadAdapt } = await import('./adapt.load.auto.js')
  expect(loadAdapt).toBeTypeOf('function')
})

test('exposes the createSelectingFunction function for programmatic configuration', async () => {
  const { createSelectingFunction } = await import('./adapt.load.auto.js')
  expect(createSelectingFunction).toBeTypeOf('function')
})

test('gathers configuration data from default configuration files', async () => {
  // --------------------------------------------
  // Ensure that environment is as expected using the
  // configuration at:
  //
  // tests/fixtures/withEnvironment

  const adapt = (await import('./adapt.load.auto.js')).default
  expect(adapt('key')).toEqual('value-testing')
})
