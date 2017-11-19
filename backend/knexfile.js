'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/localeyesr_dev'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
}
