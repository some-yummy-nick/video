const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const sync = require('browser-sync').create();
const cssnano = require('gulp-cssnano');
const pngquant = require('imagemin-pngquant');
const del = require('del');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const runSequence = require('run-sequence');
const path = require('path');
const ghPages = require('gulp-gh-pages');
let NODE_ENV = process.env.NODE_ENV || 'development';


const assets = [
  'src/libraries{,/**}',
  'src/images{,/favicon/**}',
  '!src/html{,/**}',
  '!src/styles{,/**}',
  '!src/scripts/script.js',
];

const processors = [
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
];

gulp.task('styles', () => {
  return gulp.src('./src/styles/style.scss')
    .pipe(gulpif(NODE_ENV === 'development',
      sourcemaps.init()
    ))
    .pipe(plumber())
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
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

gulp.task('html', () => {
  return gulp.src('src/html/pages/*.pug')
    .pipe(gulpif(NODE_ENV === 'development',
      pug({
        pretty: '  '
      })
    ))
    .pipe(gulpif(NODE_ENV === 'production',
      pug()
    ))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream());
});


gulp.task('images', () => {
  return gulp.src('./src/images/*.+(jpg|png)')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dest/images'));
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
    .pipe(gulp.dest('src/images/'));
});

gulp.task('deploy', () => {
  return gulp.src( 'dest/**/*.*')
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
  gulp.watch('src/html/**/*.pug', ['html']);
  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch(assets, ['copy']);
});

gulp.task('copy', () => {
  return gulp.src(assets)
    .pipe(gulp.dest('./dest'))
});

gulp.task('clean', () => {
  return del('dest/**/*');
});

gulp.task('build', () => {
  runSequence('clean',
    ['copy', 'images', 'styles'],
    'html');
});

gulp.task('default', [
  'copy',
  'html',
  'images',
  'styles',
  'server',
  'watch',
]);