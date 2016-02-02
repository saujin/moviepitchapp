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

const paths = {
  vendor: [
    "node_modules/jquery/dist/jquery.js",
    // "node_modules/bootstrap/dist/js/bootstrap.js"
  ],
  images: [
    "public/src/img/**/*.png",
    "public/src/img/**/*.jpg",
    "public/src/img/**/*.jpeg"
  ],
  js: [
    "public/src/js/fancySelect.js",
    "public/src/js/index.js",
    "public/src/controllers/**/*.js",
    "public/src/factories/**/*.js",
    "public/src/components/**/*.js"
  ],
  stylesheets: [
    "public/src/stylesheets/scss/**/*.scss"
  ]
}

gulp.task('watch', function(){
  gulp.watch(paths.stylesheets, ['sass']);
  gulp.watch(paths.js, ['scripts', 'browserify']);
  gulp.watch(paths.images, ['images']);
});

gulp.task('images', function(){
  return gulp.src('./public/src/img/**/*')
    .pipe(gulp.dest('./public/dist/img'));
});

gulp.task('browserify', function(){
  return browserify('./public/dist/js/scripts.js')
    .bundle()
    .pipe(source('bundled-main.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/dist/js'))
});

gulp.task('sass', function(){
  return gulp.src('./public/src/stylesheets/scss/main.scss')
    .pipe(maps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(nano())
    .pipe(maps.write())
    .pipe(gulp.dest('./public/dist/css'));
});

gulp.task('vendor', function(){
  return gulp.src(paths.vendor)
    // .pipe(maps.init())
    .pipe(concat('vendor.js'))
    // .pipe(maps.write())
    .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('scripts', function(){
  return gulp.src(paths.js)
    // .pipe(maps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('scripts.js'))
    // .pipe(maps.write())
    // .pipe(uglify({
    //   mangle: false
    // }))
    .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('default', ['images', 'vendor', 'scripts', 'browserify', 'watch']);
