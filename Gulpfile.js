var gulp        = require('gulp');
var sync        = require('run-sequence');
var util        = require('gulp-util');
var concat      = require('gulp-concat');
// var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

var paths = {
  ejs: "views/**/*.ejs",
  js: "public/js/*.js",
  stylesheets: "public/stylesheets/scss/**/*.scss"
}

// gulp.task('browser-sync', function(){
//   browserSync.init({
//     server: {
//       basedir: "./"
//     }
//   })
// });

gulp.task('sass', function(){
  return gulp.src(paths.stylesheets)
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./public/stylesheets'))
    // .pipe(browserSync.stream());
});

gulp.task('watch', function(){
  gulp.watch(paths.stylesheets, ['sass']);
  console.log('watching');
});

gulp.task('default', function(done){
  sync('watch', done);
});
