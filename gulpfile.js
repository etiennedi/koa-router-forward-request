const gulp = require('gulp');
// const clean = require('gulp-clean');
const babel = require('gulp-babel');
// const postcss = require('gulp-postcss');
const del = require('del');

const buildDir = './tmp';

gulp.task('build', ['dist'], function() {
  return del([buildDir]);
});

gulp.task('dist', ['transpile',], function () {
  return gulp.src('./'+buildDir+'/**/*.*')
    .pipe(gulp.dest('./lib'));
});

gulp.task('transpile', function () {
  return gulp.src(['./src/**/*.js', '!./src/**/*.spec.js'])
    .pipe(babel())
    .pipe(gulp.dest(buildDir));
});

// gulp.task('postcss', function () {
//   var processors = config.postcss();
//
//   return gulp.src('./src/components/**/*.css')
//     .pipe(postcss(processors))
//     .pipe(gulp.dest(buildDir));
// });

gulp.task('watch', function() {
  gulp.watch(['./src/**/*.*', '!./src/components/**/*.spec.js'], ['build']);
});