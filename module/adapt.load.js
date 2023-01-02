import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import createSelectingFunction from './selecting/createSelectingFunction.js'

// --------------------------------------------

export default ({ configurationDirectory }) => {
  if (typeof(configurationDirectory) === 'undefined') {
    throw new Error('[adapt.configureAdapt] Called without a configuration directory.')
  }

  // --------------------------------------------

  const configurationFilePath = resolve(configurationDirectory, 'adapt.json')

  if (existsSync(configurationFilePath) === false) {
    throw new Error(`[adapt.configureAdapt] Configuration file (adapt.json) could not be found in ${ configurationFilePath }.`)
  }

  const configuration = JSON.parse(readFileSync(configurationFilePath))

  // --------------------------------------------

  const environmentFilePath = resolve(configurationDirectory, 'adapt.env.json')
  let environment = process.env

  if (existsSync(environmentFilePath) === true) {
    environment = {
      ...process.env,
      ...JSON.parse(readFileSync(environmentFilePath))
    }
  }

  // --------------------------------------------

  return createSelectingFunction({
    configuration,
    environment,
    mode: process.env.mode
  })
}
