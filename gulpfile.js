const gulp = require('gulp');
sync = require('browser-sync').create(),
  del = require('del'),
  runSequence = require('run-sequence'),
  gulpIf = require('gulp-if'),
  fileInclude = require('gulp-file-include'),
  useref = require('gulp-useref'),
  htmlmin = require('gulp-htmlmin'),
  uglify = require('gulp-uglify'),
  gutil = require('gulp-util'),
  bower = require('gulp-bower'),
  wiredep = require('wiredep').stream,
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  cssnano = require('gulp-cssnano'),
  pngquant = require('imagemin-pngquant'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  ghPages = require('gulp-gh-pages');


let processors = [
    require('autoprefixer')({
      browsers: ['last 10 versions']
    }),
    require('postcss-easysprites')({
      imagePath: './src/images/',
      spritePath: './src/images'
    }),
    require('postcss-sorting')({
      'sort-order': 'csscomb'
    }),
    require('css-mqpacker')({
      sort: true
    })
  ],
  assets = [
    'src/libraries{,/**}',
    'src/images{,/favicon/**}',
    '!src/html{,/**}',
    '!src/styles{,/**}',
    '!src/scripts/script.js',
  ],
  NODE_ENV = process.env.NODE_ENV || 'development';


gulp.task('copy', () => {
  return gulp.src(assets)
    .pipe(gulp.dest('./dest'))
});

gulp.task('html', () => {
  return gulp.src('src/html/pages/*.html')
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(wiredep({
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf(NODE_ENV === 'production',
      htmlmin({collapseWhitespace: true})
    ))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream());
});

gulp.task('styles', () => {
  return gulp.src('src/styles/style.scss')
    .pipe(gulpIf(NODE_ENV === 'development',
      sourcemaps.init()
    ))
    .pipe(plumber({
      errorHandler: function (error) {
        gutil.log('Error: ' + error.message);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(gulpIf(NODE_ENV === 'development',
      sourcemaps.write()
    ))
    .pipe(gulpIf(NODE_ENV === 'production',
      cssnano()
    ))
    .pipe(gulp.dest('dest/styles'))
    .pipe(sync.stream());
});

gulp.task('images', () => {
  return gulp.src('src/images/*.+(jpg|png)')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dest/images'))
});

gulp.task('svg', () => {
  return gulp.src('src/images/svg/*.svg')
    .pipe(svgmin(function (file) {
      let prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
        }]
      };
    }))
    .pipe(svgstore())
    .pipe(gulp.dest('src/images'))
});

gulp.task('deploy', () => {
  return gulp.src('dest/**/*.*')
    .pipe(ghPages());
});

gulp.task('server', () => {
  sync.init({
    notify: false,
    open: false,
    server: {
      baseDir: 'dest'
    }
  });
});

gulp.task('watch', () => {
  gulp.watch('src/html/**/*.html', ['html']);
  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch(assets, ['copy']);
});

gulp.task('clean', () => {
  return del('dest/**/*');
});

gulp.task('build', () => {
  runSequence('clean', ['copy', 'images', 'styles'], 'html');
});
gulp.task('default', () => {
  runSequence(['copy', 'images', 'styles'], 'html', 'server', 'watch');
});
