#!/usr/bin/env node

// Development entrypoint — runs commands from TypeScript source via ts-node.
process.env.NODE_ENV = "development";

require("ts-node/register");

const { execute } = require("@oclif/core");

execute({ development: true, dir: __dirname });
