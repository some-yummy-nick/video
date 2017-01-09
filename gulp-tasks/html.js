module.exports = function (options) {
  const sync = require('browser-sync').create();
  return this.gulp.src(options.src)
    .pipe(this.fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(this.gulp.dest(options.dest))
    .pipe(sync.stream());
};
