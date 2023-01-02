# @adaptably/adapt

Keep your Node.js application's configuration in one place. Access it simply and declaratively. Easily change it based on your application's environment.

- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [Setting Up](#setting-up)
  - [Adding Adaptive Objects](#adding-adaptive-objects)
  - [Adding Adaptive Values](#adding-adaptive-values)
  - [Adding Adaptive References](#adding-adaptive-references)
  - [Putting It All Together](#putting-it-all-together)
- [Configuration](#configuration)
  - [The Configuration File](#the-configuration-file)
  - [The Environment File](#the-environment-file)
  - [Customizing File Locations](#customizing-file-locations)
  - [Programmatic Configuration](#programmatic-configuration)
- [Detailed Usage](#detailed-usage)
  - [The Selecting Function](#the-selecting-function)
    - [Adaptive Values](#adaptive-values)
    - [Adaptive References](#adaptive-references)
    - [Adaptive Objects](#adaptive-objects)
      - [In the Configuration File](#in-the-configuration-file)
      - [In the Environment File](#in-the-environment-file)
      - [The Default Key](#the-default-key)
      - [The `mode` Variable](#the-mode-variable)
  - [The `adapt` Command](#the-adapt-command)

## Installation

`npm install @adaptably/adapt`

## Basic Usage

### Setting Up

To get started, all you need is a [Configuration File](#the-configuration-file) (`adapt.json`) in the root of your project.

You can then use [the Selecting Function](#the-selecting-function) to access your configuration data.

For example:

**adapt.json**
```json
{
  "app": {
    "name": "hello-world"
  }
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const appName = adapt('app.name')
console.log(appName)
```

**CLI**
```bash
node app.js
> "hello-world"
```

### Adding Adaptive Objects

Maybe your app's configuration values change based on its environment. To handle this, add [Adaptive Objects](#adaptive-objects) and [the `mode` variable](#the-mode-variable).

**adapt.json**
```json
{
  "app": {
    "names": {
      "dev": "hello-world-dev",
      "production": "hello-world-production"
    }
  }
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const appName = adapt('app.name')
console.log(appName)
```

**CLI**
```bash
mode=dev node app.js
> "hello-world-dev"

mode=production node app.js
> "hello-world-production"
```

### Adding Adaptive Values

If there's configuration data you'd rather keep secret, bake in some [Adaptive Values](#adaptive-values).

`adapt` will look in [the Environment File](#the-environment-file) for these values. If it can't find them there, it will look in `process.env`. 

This is useful in production environments where the `adapt.env.json` file may not exist.

**Note:** Values in [the Environment File](#the-environment-file) will take precedence over (but not replace) values in `process.env`.

**adapt.json**
```json
{
  "api": {
    "token": "[API_TOKEN]"
  }
}
```

**adapt.env.json**
```json
{
  "API_TOKEN": "super-secret-token"
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const apiToken = adapt('api.token')
console.log(apiToken)
```

**CLI**
```bash
node app.js
> "super-secret-token"
```

#### Adaptive Values + Adaptive Objects

You can use [Adaptive Objects](#adaptive-objects) in [the Environment File](#the-environment-file) too.

**adapt.json**
```json
{
  "app": {
    "names": {
      "dev": "hello-world-dev",
      "production": "hello-world-production"
    }
  },

  "api": {
    "token": "[API_TOKEN]"
  }
}
```

**adapt.env.json**
```json
{
  "API_TOKEN": {
    "dev": "super-secret-token-dev",
    "production": "super-secret-token-production"
  }
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const apiToken = adapt('api.token')
console.log(apiToken)
```

**CLI**
```bash
mode=dev node app.js
> "super-secret-token-dev"

mode=production node app.js
> "super-secret-token-production"
```

### Adding Adaptive References

Sometimes you may want to put configuration values together. In this case, you can use [Adaptive References](#adaptive-references).

**adapt.json**
```json
{
  "database": {
    "host": "127.0.0.1",
    "user": "root",
    "connectionString": "mysql://{database.user}@{database.host}"
  }
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const connectionString = adapt('database.connectionString')
console.log(connectionString)
```

**CLI**
```bash
node app.js
> "mysql://root@127.0.0.1"
```

### Putting It All Together

With our powers combined, make your application adaptable!

**adapt.json**
```json
{
  "allTheThings": "app-[APP_NAME]-with-{services.logging.key}",

  "app": {
    "name": "hello-world-[APP_NAME]"
  },

  "api": {
    "tokens": {
      "dev": "not-secret-token",
      "staging": "[API_TOKEN]",
      "production": "[API_TOKEN]"
    }
  },

  "services": {
    "logging": {
      "keys": {
        "_default": "default-logging-key",
        "staging": "[LOGGING_KEY]",
        "production": "[LOGGING_KEY]"
      }
    }
  }
}
```

**adapt.env.json**
```json
{
  "APP_NAME": {
    "dev": "from-environment-dev",
    "production": "from-environment-production"
  },

  "API_TOKEN": "super-secret-token",

  "LOGGING_KEY": {
    "staging": "super-secret-logging-key-staging",
    "production": "super-secret-logging-key-production"
  }
}
```

**app.js**
```javascript
import adapt from '@adaptably/adapt'

const allTheThings = adapt('allTheThings')
const appName = adapt('app.name')
const apiToken = adapt('api.token')
const loggingKey = adapt('services.logging.key')

console.log('App Name:', appName)
console.log('API Token:', apiToken)
console.log('Logging Key:', loggingKey)
console.log('All the Things:', allTheThings)
```

**CLI**
```bash
mode=dev node app.js
> "App Name: hello-world-from-environment-dev"
> "API Token: not-secret-token"
> "Logging Key: default-logging-key"
> "All the Things: app-from-environment-dev-with-default-logging-key"

mode=staging node app.js
> "App Name: hello-world-from-environment-staging"
> "API Token: super-secret-token"
> "Logging Key: super-secret-logging-key-staging"
> "All the Things: app-from-environment-staging-with-super-secret-logging-key-staging"

mode=production node app.js
> "App Name: hello-world-from-environment-production"
> "API Token: super-secret-token"
> "Logging Key: super-secret-logging-key-production"
> "All the Things: app-from-environment-staging-with-super-secret-logging-key-production"
```
## Configuration

### The Configuration File

The Configuration File lives at `adapt.json` in the root of your project. To change the default location, see [Customizing File Locations](#customizing-file-locations).

This file can contain [Adaptive Objects](#adaptive-objects) and [Adaptive Values](#adaptive-values) which will be parsed by [the Selecting Function](#the-selecting-function).

#### Example Configuration File

```json
{
  "api": {
    "keys": {
      "_default": "bcd-234",
      "staging": "abc-123"
      "production": "[API_KEY]"
    }
  },

  "general": {
    "number": 5,
    "text": "Hello world"
  }
}
```

### The Environment File

The Environment File lives at `adapt.env.json` in the root of your project. To change the default location, see [Customizing File Locations](#customizing-file-locations).

This file is optional and contains environment variables for your application. It typically should not be committed to source control.

The Environment File file can contain [Adaptive Objects](#adaptive-objects) which will be parsed by [the selecting function](#the-selecting-function).

#### Example Environment Files

##### Basic

```json
{
  "API_KEY": "api-key",
  "DATABASE_URL": "db-url"
}
```

##### With [Adaptive Objects](#adaptive-objects)

```json
{
  "APP_ID": "abc123",

  "API_KEY": {
    "_default": "base-key",
    "production": "production-key"
  },

  "DATABASE_URL": {
    "dev": "dev-db",
    "staging": "staging-db",
    "production": "production-db"
  }
}
```

#### Notes on the Environment File

- If [the selecting function](#the-selecting-function) can't find a value in the Environment File, it will look in `process.env`. This is useful in production environments where the `adapt.env.json` file may not exist.
- Values in the Environment File will take precedence over (but not replace) values in `process.env`.
- Values in the Environment File must be strings (in order to work with [Adaptive Values](#adaptive-values) in [the Configuration File](#the-configuration-file)).
- Neither [Adaptive Values](#adaptive-values) nor [Adaptive References](#adaptive-references) can be used in the Environment File.

### Customizing File Locations

When importing `adapt`, it will look in thee root of your project for the [Configuration](#the-configuration-file) and [Environment](#the-environment-file) files.

To customize where `adapt` looks for these files, use the `loadAdapt` function instead of the default export:

```javascript
import { loadAdapt } from '@adaptably/adapt'

const adapt = loadAdapt({
  configurationDirectory: '/my/custom/directory'
})
```

### Programmatic Configuration

If you want to get even closer to the metal, you can skip file loading altogether and give `adapt` the data it needs programatically using the `createSelectingFunction` function:

```javascript
import { createSelectingFunction } from '@adaptably/adapt'

const adapt = createSelectingFunction({
  configuration: {
    // Provide configuration data like in the Configuration File.
  },

  environment: {
    // Provide environment data like in the Environment File.
  },

  // Optionally define a mode (or use `process.env.mode`).
  mode: 'dev'
})
```

## Detailed Usage

### The Selecting Function

#### Usage

```
import adapt from '@adaptably/adapt'
```

#### Syntax

```
adapt(selector)
```

#### Arguments

| Name | Type | Description | Example |
| :-- | :-- | :-- | :-- |
| `selector` | String | A string in dot notation which targets a key in [the configuration file](#the-configuration-file). | `api.key` |

#### Exceptions

Throws a standard `Error` if:

- The selector is `null` or `undefined`.
- A matching basic or [Adaptive Object](#adaptive-objects) key cannot be found in [the Configuration File](#the-configuration-file).
- The value of a selected key is `undefined`.

#### Normal Keys

**Normal keys** can be accessed by name, using dot notation.

Using the [Example Configuration File](#example-configuration-file):

```javascript
adapt('api.keys.staging') // 'abc-123'
adapt('general.number') // 5
adapt('general.text') // 'Hello world'
```

#### Adaptive Objects

##### In [the Configuration File](#the-configuration-file)

In [the Configuration File](#the-configuration-file), **Adaptive Objects** have two special qualities:

- The key which contains them is plural (i.e. `tokens`),
- They are an object with keys representing application modes, such as: 

```json
"keys": {
  "dev": "key-dev",
  "staging": "key-staging"
}
```

Adaptive Objects in [the Configuration File](#the-configuration-file) will be accessed when the singular form of a given selector (`api.key`) cannot be found.

A key from the object will be chosen based on [the `mode` variable](#the-mode-variable).

See [Adding Adaptive Objects](#adding-adaptive-objects) for an example.

##### In [the Environment File](#the-environment-file)

In the [Environment File](#the-environment-file), **Adaptive Objects** have one special quality:

- They are an object with keys representing application modes, such as: 

```json
"API_TOKEN": {
  "dev": "token-dev",
  "staging": "token-staging"
}
```

Adaptive Objects in [the Environment File](#the-environment-file) will be accessed when [the Configuration File](#the-configuration-file) contains an [Adaptive Value](#adaptive-values). 

A key from the object will be chosen based on [the `mode` variable](#the-mode-variable).

See [Adaptive Values + Adaptive Objects](#adaptive-values-adaptive-objects) for an example.

##### The Default Key

All [Adaptive Objects](#adaptive-objects) can contain a `_default` key.

This key will be accessed if [the `mode` variable](#the-mode-variable) is not set, or if there are no keys within the [Adaptive Object](#adaptive-objects) which match the current `mode`.

See [Putting it All Together](#putting-it-all-together) for an example.

##### The `mode` Variable

[Adaptive Objects](#adaptive-objects) can only function if the `mode` is set.

By default, `adapt` will look in the environment for `process.env.mode`.

The `mode` variable can also be set manually using [Programmatic Configuration](#programmatic-configuration).

#### Adaptive Values

**Adaptive Values** are used in [the Configuration File](#the-configuration-file) to reference data in the environment.

These values are surrounded in brackets, such as `[API_KEY]`. This tells [the Selecting Function](#the-selecting-function) to replace this section with a value from [the Environment File](#the-environment-file) or `process.env`.

See [Adding Adaptive Values](#adding-adaptive-values) for an example.

##### Interpolated Adaptive Values

[Adaptive Values](#adaptive-values) can contain additional text and/or multiple bracketed sections. For example:

```json
{
  "database": "mysql://[DATABASE_USER]:[DATABASE_PASSWORD]"
}
```

#### Adaptive References

**Adaptive References** are used in [the Configuration File](#the-configuration-file) to reference other configuration values.

These values are surrounded in curly braces which contain a [selector](#the-selecting-function), such as `{database.url}`. This tells [the Selecting Function](#the-selecting-function) to replace this section with the value of the given selector from elsewhere in [the Configuration File](#the-configuration-file).

See [Adding Adaptive Values](#adding-adaptive-values) for an example.

##### Interpolated Adaptive References

[Adaptive References](#adaptive-references) can contain additional text and/or multiple curly braced sections. For example:

```json
{
  "database": "mysql://{database.user}@{database.host}"
}
```

See [Putting it All Together](#putting-it-all-together) for an example.

#### Preloading Environment Data

By default, `adapt` **will not** load data from [the Environment File](#the-environment-file) into `process.env`. If you'd like to do this you can use [the `adapt` command](#the-adapt-command).

## The `adapt` Command

The `adapt` command will run shell commands with the environment variables defined in your [Environment File](#the-environment-file) loaded into `process.env`.

This can be useful when running a command line utility which relies on environment variables.

### Usage

`adapt '[command]'`

### Example

**adapt.env.json**
```json
{
  "DATABASE_URL": {
    "testing": "my-testing-database",
    "production": "my-production-database"
  }
}
```

**CLI**
```bash
mode=testing adapt "echo $DATABASE_URL"
> "my-testing-database"

mode=production adapt "echo $DATABASE_URL"
> "my-production-database"
```
