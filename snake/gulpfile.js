'use strict';

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del'),
    bs = require('browser-sync');

var path = {
    build: { //назначение
        html: 'build/',
        js: 'build/scripts/',
        jsConcat: 'snake-main.js',
        style: 'build/styles/',
        styleConcat: 'main.css'
        //img: 'build/img/',
        //fonts: 'build/fonts/'
    },
    src: { //исходники
        html: 'dev/*.html',
        js: 'dev/scripts/*.js',
        style: 'dev/styles/*.css',
        //img: 'src/img/**/*.*',
        //fonts: 'src/fonts/**/*.*'
    },
    watch: { //файлы для наблюдения
        html: 'dev/**/*.html',
        js: 'dev/scripts/**/*.js',
        style: 'dev/styles/**/*.css',
        all: 'dev/**/*.*',
        //img: 'src/img/**/*.*',
        //fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('script', function() {
    return gulp.src(path.src.js)
        //.pipe(sourcemaps.init())
        .pipe(concat(path.build.jsConcat))
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
});

gulp.task('styles', function() {
    return gulp.src(path.src.style)
        .pipe(concat(path.build.styleConcat))
    .pipe(gulp.dest(path.build.style))
});

//gulp.task('assets', function() {
//    return gulp.src('dev/img/**')
//    .pipe(gulp.dest('public/img'))
//});

gulp.task('html', function() {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
});

gulp.task('clear', function() {
    return del(path.clean);
});

gulp.task('watch', function() {
    //gulp.watch('dev/img/**/*.*', gulp.series('assets'));
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.style, gulp.series('styles'));
    gulp.watch(path.watch.js, gulp.series('script'));
});

//gulp.task('serve', function() {
//    bs.init({
//        server: 'public'
//    });
//
//    bs.watch(path.watch.all).on('change', bs.reload);
//});

gulp.task('build', gulp.series('clear', gulp.parallel('styles', 'script', 'html')));

//gulp.task('default', gulp.parallel('build', 'watch', 'serve'));


