// Load each module using require
const schema = require('./lib/config/schema');
const context = require('./lib/engine/context');
const controller = require('./lib/engine/controller');
const graph = require('./lib/engine/graph');
const handlers = require('./lib/engine/handlers');
const registry = require('./lib/engine/registry');
const types = require('./lib/engine/types');
const utils = require('./lib/engine/utils');
const events = require('./lib/events/events');
const socketTypes = require('./lib/realtime/socket-types');
const emitter = require('./lib/realtime/emitter');

// Export them all using module.exports
module.exports = {
  ...schema,
  ...context,
  ...controller,
  ...graph,
  ...handlers,
  ...registry,
  ...types,
  ...utils,
  ...events,
  ...socketTypes,
  ...emitter,
};