export default ({ environment, mode }) => {
  const transformed = {}
  const keys = Object.keys(environment)

  keys.forEach(key => {
    let value = environment[key]

    if (typeof(value) === 'object') {
      value = environment[key][mode]

      if (typeof(value) === 'undefined') {
        value = environment[key]['_default']
      }
    }

    transformed[key] = value
  })

  return transformed
}
