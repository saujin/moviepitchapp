var gulp        = require('gulp');
var sync        = require('run-sequence');
var concat      = require('gulp-concat');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');

var paths = {
  ejs: "views/**/*.ejs",
  js: "public/js/*.js",
  stylesheets: "public/stylesheets/scss/**/*.scss"
}

gulp.task('sass', function(){
  return gulp.src(paths.stylesheets)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/stylesheets'))
});

gulp.task('watch', function(){
  gulp.watch(paths.stylesheets, ['sass']);
  console.log('watching');
});

gulp.task('default', function(done){
  sync('sass', 'watch', done);
});
