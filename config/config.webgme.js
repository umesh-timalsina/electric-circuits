// DO NOT EDIT THIS FILE
// This file is automatically generated from the webgme-setup-tool.
'use strict';


var config = require('webgme/config/config.default'),
    validateConfig = require('webgme/config/validator');

// The paths can be loaded from the webgme-setup.json
config.visualization.decoratorPaths.push(__dirname + '/../src/decorators');
config.plugin.basePaths.push(__dirname + '/../src/plugins');
config.seedProjects.basePaths.push(__dirname + '/../src/seeds/projectBase');
config.seedProjects.basePaths.push(__dirname + '/../src/seeds/project');




config.visualization.panelPaths.push(__dirname + '/../src/visualizers/panels');

config.rest.components['BindingsDocs'] = {
  src: __dirname + '/../node_modules/webgme-bindings/src/routers/BindingsDocs/BindingsDocs.js',
  mount: 'bindings-docs',
  options: {}
};

// Visualizer descriptors
config.visualization.visualizerDescriptors.push(__dirname + '/../src/visualizers/Visualizers.json');
// Add requirejs paths
config.requirejsPaths = {
  'panels': './src/visualizers/panels',
  'widgets': './src/visualizers/widgets',
  'BindingsDocs': 'node_modules/webgme-bindings/src/routers/BindingsDocs',
  'webgme-bindings': './node_modules/webgme-bindings/src/common',
  'electric-circuits': './src/common'
};


config.mongo.uri = 'mongodb://127.0.0.1:27017/electric_circuits';
validateConfig(config);
module.exports = config;
