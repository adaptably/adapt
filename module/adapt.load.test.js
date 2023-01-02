import { resolve } from 'node:path'

import loadAdapt from './adapt.load.js'

// --------------------------------------------

describe('Integration: Manually Loading Configuration Files', () => {
  describe('without a configuration directory', () => {
    it('throws an error', () => {
      expect(() => loadAdapt({}))
        .toThrowError('configuration directory')
    })
  })

  describe('without a valid configuration directory', () => {
    it('throws an error', () => {
      expect(() => loadAdapt({ configurationDirectory: 'non/existent/dir' }))
        .toThrowError('could not be found')
    })
  })

  describe('with a valid configuration directory', () => {
    describe('with only a configuration file', () => {
      it('gathers configuration from configuration directory in mode from process.env', () => {
        const originalMode = process.env.mode
        process.env.mode = 'dev'

        // --------------------------------------------

        const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/configurationOnly')

        const adapt = loadAdapt({ configurationDirectory })
        expect(adapt('key')).toEqual('value-dev')

        // --------------------------------------------

        process.env.mode = originalMode
      })
    })

    describe('with a configuration file and an environment file', () => {
      it('gathers configuration from configuration directory in mode from process.env', () => {
        const originalMode = process.env.mode
        process.env.mode = 'dev'

        // --------------------------------------------

        const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

        const adapt = loadAdapt({ configurationDirectory })
        expect(adapt('key')).toEqual('value-dev')

        // --------------------------------------------

        process.env.mode = originalMode
      })

      it('includes environment variables in process.env', () => {
        process.env.KEY_FROM_PROCESS = 'process-value'

        // --------------------------------------------

        const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

        const adapt = loadAdapt({ configurationDirectory })
        expect(adapt('keyFromProcess')).toEqual('process-value')

        // --------------------------------------------

        delete process.env.KEY_FROM_PROCESS
      })

      it('prioritizes environment file values above process.env values', () => {
        process.env.DUPLICATE_KEY = 'in-process'

        // --------------------------------------------

        const configurationDirectory = resolve(process.cwd(), 'tests/fixtures/withEnvironment')

        const adapt = loadAdapt({ configurationDirectory })
        expect(adapt('duplicateKey')).toEqual('in-file')

        // --------------------------------------------

        delete process.env.DUPLICATE_KEY
      })
    })
  })
})
