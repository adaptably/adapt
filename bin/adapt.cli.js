#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

import adaptEnvironment from '../module/environment/adaptEnvironment.js'

// --------------------------------------------

const environmentFilePath = resolve(process.cwd(), 'adapt.env.json')
const { mode } = process.env

// --------------------------------------------

let environment = {}

if (existsSync(environmentFilePath) === true) {
  const adaptedEnvironment = adaptEnvironment({
    environment: JSON.parse(readFileSync(environmentFilePath)),
    mode: process.env.mode
  })

  environment = {
    ...process.env,
    ...adaptedEnvironment
  }
}

if (existsSync(environmentFilePath) === false) {
  environment = process.env
}

// --------------------------------------------

const commandSplit = process.argv[2].split(' ')
const commandBase = commandSplit[0]
const commandArgs = commandSplit.slice(1)

// --------------------------------------------

const spawned = spawn(commandBase, commandArgs, {
  stdio: 'inherit',
  env: environment
})

spawned.on('exit', (exitCode) => {
  process.exit(exitCode)
})
