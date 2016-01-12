'use strict';

var gulp        = require('gulp');
var babel       = require('gulp-babel');
var sync        = require('run-sequence');
var concat      = require('gulp-concat');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');

var paths = {
  ejs: "views/**/*.ejs",
  vendor: [
    "node_modules/jquery/dist/jquery.js",
    "node_modules/parse/dist/parse-latest.js",
    "node_modules/angular/angular.js",
    "node_modules/angular-ui-router/release/angular-ui-router.js",
    "node_modules/bootstrap/dist/js/bootstrap.js"
  ],
  js: [
    "public/js/index.js",
    "public/controllers/**/*.js",
    "public/factories/**/*.js",
    "public/components/**/*.js"
  ],
  stylesheets: "public/stylesheets/scss/**/*.scss"
}

gulp.task('sass', function(){
  return gulp.src(paths.stylesheets)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/stylesheets'))
});


gulp.task('vendor', function(){
  return gulp.src(paths.vendor)
    .pipe(sourcemaps.init())
    .pipe(concat('vendor.js'))
    .pipe(sourcemaps.write())
    // .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
});

gulp.task('scripts', function(){
  return gulp.src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    // .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
})

gulp.task('watch', function(){
  gulp.watch(paths.stylesheets, ['sass']);
  gulp.watch(paths.js, ['scripts'])
  console.log('watching');
});

gulp.task('default', function(done){
  sync('vendor', 'sass', 'scripts', 'watch', done);
});
