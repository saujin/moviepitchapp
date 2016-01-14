"use strict";

let gulp        = require('gulp');
let sync        = require('run-sequence');
let concat      = require('gulp-concat');
let sass        = require('gulp-sass');
let sourcemaps  = require('gulp-sourcemaps');
let uglify      = require('gulp-uglify');
let babel       = require('gulp-babel');

let browserify  = require('browserify');
let source      = require('vinyl-source-stream');

// import gulp from "gulp";
// import sass from "gulp-sass";
// import sync from "run-sequence";
// import concat from "gulp-concat";
// import sourcemaps from "gulp-sourcemaps";
// import uglify from "gulp-uglify";

const paths = {
  ejs: "views/**/*.ejs",
  vendor: [
    "node_modules/jquery/dist/jquery.js",
    // "node_modules/parse/dist/parse-latest.js",
    // "node_modules/angular/angular.js",
    // "node_modules/angular-ui-router/release/angular-ui-router.js",
    "node_modules/bootstrap/dist/js/bootstrap.js",
    // "node_modules/sendgrid/lib/sendgrid.js"
  ],
  js: [
    "public/js/index.js",
    "public/controllers/**/*.js",
    "public/factories/**/*.js",
    "public/components/**/*.js"
  ],
  stylesheets: "public/stylesheets/scss/**/*.scss"
}

gulp.task('browserify', function(){
  return browserify('./public/js/scripts.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js/'))
});

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
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    // .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
})

gulp.task('watch', function(){
  gulp.watch(paths.stylesheets, ['sass']);
  gulp.watch(paths.js, ['watcher']);
  console.log('watching');
});

gulp.task('watcher', function(done){
  sync('scripts', 'browserify', done);
})

gulp.task('default', function(done){
  sync('sass', 'modularize', 'watch', done);
});

gulp.task('modularize', function(done){
  sync('vendor', 'scripts', 'browserify', done);
})
