import createSelectingFunction from './createSelectingFunction.js'

// --------------------------------------------

const valid = {
  options: {
    configuration: {}
  }
}

// --------------------------------------------

describe('createSelectingFunction()', () => {
  describe('without a configuration object', () => {
    it('throws an error', () => {
      expect(() => createSelectingFunction({}))
        .toThrowError('Configuration was undefined')
    })
  })

  describe('with valid configuration', () => {
    describe('the selecting function', () => {
      describe('without a selector', () => {
        it('throws an error', () => {
          const adapt = createSelectingFunction(valid.options)
          expect(() => adapt()).toThrowError('Selector was undefined')
        })
      })

      describe('with a selector which does not match the configuration', () => {
        it('throws an error', () => {
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
      })

      describe('with a valid selector', () => {
        describe('which matches a normal key', () => {
          it('returns the value of the normal key', () => {
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
        })

        describe('which matches an Adaptive Object', () => {
          describe('without a key that matches the mode', () => {
            describe('with a default key', () => {
              it('returns the value of the default key', () => {
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
            })

            describe('without a default key', () => {
              it('throws an error', () => {
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
            })
          })

          describe('with a key that matches the mode', () => {
            it('returns the value matching the mode', () => {
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
          })
        })
      })

      describe('with a valid selector which includes an Adaptive Reference', () => {
        describe('when the reference(s) cannot be found in the configuration', () => {
          it('throws an error', () => {
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
        })

        describe('when the value(s) can be found in the environment', () => {
          it('replaces all matching Adaptive References', () => {
            const configuration = {
              joined: '{firstWord}-{secondWord}',
              firstWord: 'hello',

              secondWords: {
                dev: 'world'
              }
            }

            const adapt = createSelectingFunction({
              ...valid.options,
              configuration,
              environment: {},
              mode: 'dev'
            })

            expect(adapt('joined')).toEqual('hello-world')
          })
        })
      })

      describe('with a valid selector which includes an Adaptive Value', () => {
        describe('when the value(s) cannot be found in the environment', () => {
          it('throws an error', () => {
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
        })

        describe('when the value(s) can be found in the environment', () => {
          it('replaces all matching Adaptive Values', () => {
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
        })

        describe('when the Adaptive Value contains an Adaptive Object', () => {
          describe('and the value(s) matching the mode cannot be found in the environment', () => {
            describe('with a default key', () => {
              it('returns the value of the default key', () => {
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
            })

            describe('without a default key', () => {
              it('throws an error', () => {
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
            })
          })

          describe('and the value(s) matching the mode can be found in the environment', () => {
            it('replaces all matching Adaptive Values with Adaptive Object values', () => {
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
          })
        })
      })
    })
  })
})
