import pluralize from 'pluralize'

// -------------------------------------------- 

function search({ data, environment, mode, selector, selectorOriginal }) {
  const selectorSections = selector.split('.')

  // -------------------------------------------- 

  const selected = select({
    data,
    environment,
    mode,
    selector: selectorSections[0],
    selectorOriginal
  })

  if (typeof(selected) !== 'object') {
    return selected
  }

  return search({
    data: selected,
    environment,
    mode,
    selector: selectorSections.slice(1).join('.'),
    selectorOriginal
  })
}

// --------------------------------------------

function select({ data, environment, mode, selector, selectorOriginal }) {
  let value = data[selector]

  // --------------------------------------------

  const messagePrefix = `[adapt | '${ selectorOriginal }']`

  // --------------------------------------------
  // Handle Adaptive Objects

  if (typeof(value) === 'undefined') {
    const adaptiveObjectSelector = pluralize(selector)
    const adaptiveObject = data[adaptiveObjectSelector]

    if (typeof(adaptiveObject) === 'undefined') {
      throw new Error(`${ messagePrefix } Could not find '${ selector }' or '${ adaptiveObjectSelector }' in the configuration.`)
    }

    value = adaptiveObject[mode]

    // --------------------------------------------
    // Check for Default Key

    if (typeof(value) === 'undefined') {
      value = adaptiveObject['_default']
    }

    // --------------------------------------------

    if (typeof(value) === 'undefined') {
      throw new Error(`${ messagePrefix } Could not find a '${ mode }' or '_default' key in '${ adaptiveObjectSelector }'.`)
    }
  }

  // --------------------------------------------
  // Handle Adaptive References

  if (typeof(value) === 'string' && value.includes('{')) {
    const matcher = /\{[^\{]*\}/g
    const matches = value.match(matcher)

    matches.forEach(match => {
      const referenceSelector = match.replace(/(\{|\})/g, '')

      const replacement = search({
        data,
        environment,
        mode,
        selector: referenceSelector,
        selectorOriginal: selector
      })

      value = value.replace(match, replacement)
    })
  }

  // --------------------------------------------
  // Handle Adaptive Values

  if (typeof(value) === 'string' && value.includes('[')) {
    const matcher = /\[[^\[]*\]/g
    const matches = value.match(matcher)

    matches.forEach(match => {
      const key = match.replace(/(\[|\])/g, '')
      const replacement = environment[key]

      if (typeof(replacement) === 'undefined') {
        throw new Error(`${ messagePrefix } Could not find '${ key }' from '${ value }' within the environment.`)
      }

      if (typeof(replacement) !== 'object') {
        value = value.replace(match, replacement)
      }

      if (typeof(replacement) === 'object') {
        let adaptiveReplacement = replacement[mode]

        // --------------------------------------------
        // Check for Default Key

        if (typeof(adaptiveReplacement) === 'undefined') {
          adaptiveReplacement = replacement['_default']
        }

        // --------------------------------------------

        if (typeof(adaptiveReplacement) === 'undefined') {
          throw new Error(`${ messagePrefix } Could not find a '${ mode }' or '_default' key in '${ key }'.`)
        }

        value = value.replace(match, adaptiveReplacement)
      }
    })
  }

  return value
}

// -------------------------------------------- 

export default ({ configuration, environment, mode }) => {
  if (typeof(configuration) === 'undefined') {
    throw new Error('[adapt] Configuration was undefined.')
  }

  return (selector) => {
    if (typeof(selector) === 'undefined') {
      throw new Error('[adapt] Selector was undefined.')
    }

    return search({
      data: configuration,
      environment,
      mode,
      selector,
      selectorOriginal: selector
    })
  }
}
