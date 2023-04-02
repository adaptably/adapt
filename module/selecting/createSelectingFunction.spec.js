import createSelectingFunction from './createSelectingFunction.js'

// --------------------------------------------

const valid = {
  options: {
    configuration: {}
  }
}

// --------------------------------------------

test('throws an error without a configuration object', () => {
  expect(() => createSelectingFunction({}))
    .toThrowError('Configuration was undefined')
})

// --------------------------------------------
// Selecting Function

test('selecting function throws an error without a selector', () => {
  const adapt = createSelectingFunction(valid.options)
  expect(() => adapt()).toThrowError('Selector was undefined')
})

test('selecting function throws an error when there is no matching selector', () => {
  const configuration = {}

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration
  })

  expect(() => adapt('item'))
    .toThrowError(`[adapt | 'item'] Could not find 'item' or 'items'`)

  expect(() => adapt('item.nested.thing'))
    .toThrowError(`[adapt | 'item.nested.thing'] Could not find 'item' or 'items'`)
})

test('selecting function returns the value of a selector when there is a matching selector', () => {
  const configuration = {
    root: 'root',

    nestedOne: {
      key: 'nested-one',

      nestedTwo: {
        key: 'nested-two'
      }
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration
  })

  const root = adapt('root')
  expect(root).to.eq('root')

  const nestedOne = adapt('nestedOne.key')
  expect(nestedOne).to.eq('nested-one')

  const nestedTwo = adapt('nestedOne.nestedTwo.key')
  expect(nestedTwo).to.eq('nested-two')
})

// --------------------------------------------
// Selecting Function: Adaptive Objects

test('Adaptive Objects: selecting function throws an error when there is no matching mode key and no default key', () => {
  const configuration = {
    roots: {
      dev: 'root-dev',
      staging: 'root-staging'
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    mode: 'production'
  })

  expect(() => adapt('root'))
    .toThrowError(`[adapt | 'root'] Could not find a 'production' or '_default' key in 'roots'`)
})

test('Adaptive Objects: selecting function returns the value of the default key when there is no matching mode key', () => {
  const configuration = {
    roots: {
      _default: 'root-default',
      dev: 'root-dev',
      staging: 'root-staging'
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    mode: 'production'
  })

  expect(adapt('root')).toEqual('root-default')
})

test('Adaptive Objects: selecting function returns the value of the matching mode key', () => {
  const configuration = {
    roots: {
      dev: 'root-dev',
      staging: 'root-staging'
    },

    nested: {
      items: {
        dev: 'nested-dev',
        staging: 'nested-staging'
      }
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    mode: 'staging'
  })

  const root = adapt('root')
  expect(root).to.eq('root-staging')

  const nested = adapt('nested.item')
  expect(nested).to.eq('nested-staging')
})

// --------------------------------------------
// Selecting Function: Adaptive References

test('Adaptive References: selecting function throws an error without a matching reference', () => {
  const configuration = {
    root: 'hello-{reference}'
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment: {}
  })

  expect(() => adapt('root'))
    .toThrowError(`[adapt | 'root'] Could not find 'reference' or 'references' in the configuration.`)
})

test('Adaptive References: selecting function replaces all matching references', () => {
  const configuration = {
    joined: '{firstWord}-{secondWord}-{nested.thirdWord}',
    firstWord: 'hello',

    secondWords: {
      dev: 'world'
    },

    nested: {
      thirdWords: {
        dev: 'foo'
      }
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment: {},
    mode: 'dev'
  })

  expect(adapt('joined')).toEqual('hello-world-foo')
})

// --------------------------------------------
// Selecting Function: Adaptive Values

test('Adaptive Values: selecting function throws an error without a matching environment value', () => {
  const configuration = {
    root: 'hello-[word]'
  }

  const environment = {}

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment
  })

  expect(() => adapt('root'))
    .toThrowError(`[adapt | 'root'] Could not find 'word' from 'hello-[word]' within the environment.`)
})

test('Adaptive Values: selecting function replaces matching environment values', () => {
  const configuration = {
    root: '[word1]-[word2]',
    number: '[number]',
    joined: '[word1]-[number]'
  }

  const environment = {
    word1: 'hello',
    word2: 'world',
    number: 1
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment
  })

  expect(adapt('root')).toEqual('hello-world')
  expect(adapt('number')).toEqual('1')
  expect(adapt('joined')).toEqual('hello-1')
})

test('Adaptive Values: selecting function throws an error when the matching environment value has no matching mode key and no default key', () => { 
  const configuration = {
    root: 'hello-[word]'
  }

  const environment = {
    word: {
      dev: 'word-dev'
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment,
    mode: 'staging'
  })

  expect(() => adapt('root'))
    .toThrowError(`[adapt | 'root'] Could not find a 'staging' or '_default' key in 'word'.`)
})

test('Adaptive Values: selecting function replaces matching values with the default key when the matching environment value is an Adaptive Object without a matching mode key', () =>{
  const configuration = {
    root: 'hello-[word]'
  }

  const environment = {
    word: {
      _default: 'word-default',
      dev: 'word-dev'
    }
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment,
    mode: 'staging'
  })

  expect(adapt('root')).toEqual('hello-word-default')
})

test('Adaptive Values: selecting function replaces matching values when the matching environment value is an Adaptive Object with a matching mode key', () => {
  const configuration = {
    root: 'hello-[word1]-[word2]'
  }

  const environment = {
    word1: {
      dev: 'word1-dev',
      staging: 'word1-dev'
    },

    word2: 'word2-dev'
  }

  const adapt = createSelectingFunction({
    ...valid.options,
    configuration,
    environment,
    mode: 'dev'
  })

  expect(adapt('root')).toEqual('hello-word1-dev-word2-dev')
})
