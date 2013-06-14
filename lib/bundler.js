var path = require('path');

var log = require('minilog')('bundler');

var cache = require('./cache'),
    buildEnv = require('./build-env'),
    registry = require('./registry'),
    unpack = require('./unpack'),
    riggledogg = require('./riggledogg'),
    install = require('./install'),
    browserify = require('./browserify');

module.exports = function (options) {
  return cache(options, bundler(options));
};

function bundler(opts) {
  opts = opts || {};

  var root = opts.root;

  return function bundle(pkg, cb) {

    var module = pkg.module,
        semver = pkg.version;

    log.info('about to browserify `' + module + '@' + semver + '`...');

    buildEnv({
      root: module
    }, function (err, env) {
      if (err) return cb(err);

      registry(module, semver, function (err, stream) {
        if (err) return cb(err);

        unpack(env, stream, function (err) {
          if (err) return cb(err);

          riggledogg(env, module, function (err) {
            if (err) return cb(err);

            install(env, module, function (err) {
              if (err) return cb(err);

              browserify(env, pkg, function (err, bundle) {
                if (err) return cb(err);

                log.info('successfully browserified `' + module + '@' + semver + '`.');

                cb(null, bundle);
              });
            });
          });
        });
      });
    });
  };
};