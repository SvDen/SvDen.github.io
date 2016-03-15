'use strict';

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del'),
    bs = require('browser-sync')


gulp.task('script', function() {
    return gulp.src('dev/script/**/*.*')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/script'))
});

gulp.task('styles', function() {
    return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.css', 'dev/style/*.*'])
        .pipe(concat('styles.css'))
    .pipe(gulp.dest('public/css'))
});

gulp.task('assets', function() {
    return gulp.src('dev/img/**')
    .pipe(gulp.dest('public/img'))
});

gulp.task('html', function() {
    return gulp.src('dev/*.html')
        .pipe(gulp.dest('public'))
});

gulp.task('clear', function() {
    return del('public');
});

gulp.task('watch', function() {
    gulp.watch('dev/img/**/*.*', gulp.series('assets'));
    gulp.watch('dev/*.html', gulp.series('html'));
    gulp.watch('dev/styles/**/*.*', gulp.series('styles'));
    gulp.watch('dev/script/**/*.*', gulp.series('script'));
});

gulp.task('serve', function() {
    bs.init({
        server: 'public'
    });

    bs.watch('dev/**/*.*').on('change', bs.reload);
});

gulp.task('build', gulp.series('clear', gulp.parallel('assets', 'styles', 'script', 'html')));

gulp.task('default', gulp.parallel('build', 'watch', 'serve'));


