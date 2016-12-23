const gulp = require('gulp');
const postcss = require('gulp-postcss');

gulp.task('style', function () {
  return gulp.src('src/style/style.css')
    .pipe(postcss([
      require("postcss-cssnext")({
        browsers: ['last 10 version']
      })
    ]))
    .pipe(gulp.dest('dest'))

});
