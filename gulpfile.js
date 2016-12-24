const gulp = require('gulp');
const postcss = require('gulp-postcss');
const posthtml = require('gulp-posthtml');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const sync = require('browser-sync').create();
const cssnano = require('gulp-cssnano');
let NODE_ENV = process.env.NODE_ENV || 'development';


const assets = [
  'src/images{,/*.+(jpg|png)}',
  '!src/html{,/**}',
  '!src/styles{,/**}',
  '!src/scripts/script.js',
];

const processors = [
  require('postcss-import')(),
  require('postcss-easysprites')({
    imagePath: './src/images/',
    spritePath: './src/images'
  }),
  require("postcss-cssnext")({
    browsers: ['last 10 version']
  }),
  require('postcss-custom-media')(),
  require('postcss-sorting')({
    'sort-order': 'csscomb'
  }),
  require('css-mqpacker')({
    sort: true
  })
];

gulp.task('styles', () => {
  return gulp.src('./src/styles/style.css')
    .pipe(gulpif(NODE_ENV === 'development',
      sourcemaps.init()
    ))
    .pipe(plumber())
    .pipe(postcss(processors))
    .pipe(gulpif(NODE_ENV === 'development',
      sourcemaps.write()
    ))
    .pipe(gulpif(NODE_ENV === 'production',
      cssnano()
    ))
    .pipe(gulp.dest('./dest/styles'))
    .pipe(sync.stream());
});

gulp.task('html', () =>  {
  return gulp.src('src/html/pages/*.pug')
    .pipe(pug({
      pretty: '  '
    }))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream());
});

gulp.task('server', () => {
  sync.init({
    notify: false,
    open:false,
    server: {
      baseDir: 'dest'
    }
  });
});

gulp.task('watch', () => {
  gulp.watch('src/html/**/*.pug', ['html']);
  gulp.watch('src/styles/**/*.css', ['style']);
  gulp.watch(assets, ['copy']);
});

gulp.task('copy', () => {
  return gulp.src(assets)
    .pipe(gulp.dest('dest/'))
});

gulp.task('default', [
  'copy',
  'html',
  'styles',
  'server',
  'watch',
]);