import childProcess from 'node:child_process'
import { cp, unlink } from 'node:fs/promises'
import { promisify } from 'node:util'
import { resolve } from 'node:path'

// --------------------------------------------

const exec = promisify(childProcess.exec)

// --------------------------------------------

describe('`adapt` command', () => {
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

  it('runs the given command with preloaded environment variables in correct mode and priority', async () => {
    const testCommand = `mode=dev node ./bin/adapt.cli.js 'node ./tests/scripts/logEnvironmentVariables.js'`

    const { stdout } = await exec(testCommand, {
      env: {
        ...process.env,

        // Set a duplicate key in the process to ensure that
        // values from the Environment File take priority.
        DUPLICATE_KEY: 'in-process',
      }
    })

    // --------------------------------------------
    // Ensure that environment is as expected using the
    // fixture Environment File at:
    //
    // tests/fixtures/withEnvironment/environment.json

    expect(stdout).toContain('value-dev')
    expect(stdout).toContain('in-file')
  })
})
