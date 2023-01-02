import { resolve } from 'node:path'

import createSelectingFunctionImported from './selecting/createSelectingFunction.js'
import loadAdaptImported from './adapt.load.js'

// --------------------------------------------

export const createSelectingFunction = createSelectingFunctionImported
export const loadAdapt = loadAdaptImported

// --------------------------------------------

export default loadAdapt({
  configurationDirectory: process.cwd()
})
