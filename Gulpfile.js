"use strict";

const gulp        = require('gulp');
const sass        = require('gulp-sass');
const maps        = require('gulp-sourcemaps');
const nano        = require('gulp-cssnano');
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify');
const babel       = require('gulp-babel');
const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const psi         = require('psi');
const imagemin    = require('gulp-imagemin');
const pngquant    = require('imagemin-pngquant');
const htmlmin     = require('gulp-htmlmin');
const runSequence = require('run-sequence');

const localSite = 'http://moviepitchapp.herokuapp.com';

const paths = {
  vendor: [
  ],
  images: [
    "public/src/img/**/*.png",
    "public/src/img/**/*.jpg",
    "public/src/img/**/*.jpeg"
  ],
  html: [
    "public/src/**/*.html"
  ],
  js: [
    "public/src/js/fancySelect.js",
    "public/src/js/index.js",
    "public/src/controllers/**/*.js",
    "public/src/factories/**/*.js",
    "public/src/components/**/*.js",
    "public/src/modals/**/*.js"
  ],
  stylesheets: [
    "public/src/stylesheets/scss/**/*.scss"
  ]
}

gulp.task('min-html', function(){
  return gulp.src('./public/src/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./public/dist'));
});

gulp.task('images', function(){
  return gulp.src('./public/src/img/**/*')
    .pipe(imagemin({
  			progressive: true,
  			svgoPlugins: [{removeViewBox: false}],
  			use: [pngquant({
          quality: '80', speed: 5
        })]
  		}))
    .pipe(gulp.dest('./public/dist/img'));
});

gulp.task('sass', function(){
  return gulp.src('./public/src/stylesheets/scss/main.scss')
    .pipe(maps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(nano())
    .pipe(maps.write())
    .pipe(gulp.dest('./public/dist/css'));
});

gulp.task('sass-build', function(){
  return gulp.src('./public/src/stylesheets/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(nano())
    .pipe(gulp.dest('./public/dist/css'));
});

gulp.task('vendor', function(){
  return gulp.src(paths.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('vendor-build', function(){
  return gulp.src(paths.vendor)
  .pipe(concat('vendor.js'))
  .pipe(uglify({
    mangle: true
  }))
  .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('scripts', function(){
  return gulp.src(paths.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('browserify', function(){
  return browserify('./public/dist/js/scripts.js')
    .bundle()
    .pipe(source('bundled-main.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/dist/js'))
});

gulp.task('min-scripts', function(){
  return gulp.src('./public/dist/js/bundled-main.js')
    .pipe(uglify({
      mangle: false
    }))
    .pipe(gulp.dest('./public/dist/js'));
});


gulp.task('watch', function(){
  gulp.watch(paths.html, ['min-html']);
  gulp.watch(paths.stylesheets, ['sass']);
  gulp.watch(paths.js, ['scripts', 'browserify']);
  gulp.watch(paths.images, ['images']);
});

gulp.task('scripts-sequenced-watch', function(){
  runSequence(
    'scripts',
    'browserify',
    'watch'
  );
});

gulp.task('scripts-sequenced', function(){
  runSequence(
    'scripts',
    'browserify',
    'min-scripts'
  );
});


// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v2/getting-started

gulp.task('mobile', function () {
    return psi(localSite, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop', function () {
    return psi(localSite, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log(data.pageStats);
    });
});

gulp.task('default', ['min-html', 'scripts-sequenced-watch']);

gulp.task('build', ['min-html', 'images', 'sass-build', 'scripts-sequenced']);
