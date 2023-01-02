import adaptEnvironment from './adaptEnvironment.js'

// --------------------------------------------

describe('adaptEnvironment()', () => {
  it('selects all values that match the current mode', () => {
    const mode = 'staging'

    const environment = {
      API_URL: {
        dev: 'dev-api',
        staging: 'staging-api'
      },

      UI_LOCATION: {
        _default: 'ui-default',
        production: 'production-ui'
      },

      APP_NAME: 'app'
    }

    const result = adaptEnvironment({ environment, mode })

    expect(result).toEqual({
      API_URL: 'staging-api',
      UI_LOCATION: 'ui-default',
      APP_NAME: 'app'
    })
  })
})
