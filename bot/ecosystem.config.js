const { env } = require('process');

module.exports = {
  apps : [{
    name   : "discord-bot",
    script : "./dist/index.js",
    env : "development",
    "env" : {
        "NODE_ENV" : "development",
    },
    "env_production" : {
        "NODE_ENV" : "production",
    }
  }]
}
