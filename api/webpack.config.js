const path = require('path'); // Make sure to require the 'path' module

module.exports = {
  // Other webpack configuration options...
  
  resolve: {
    fallback: {
      util: require.resolve('util/'), // Polyfill for 'util' module
      path: require.resolve('path-browserify') // Polyfill for 'path' module
    }
  },

  // Other webpack configuration options...
};
