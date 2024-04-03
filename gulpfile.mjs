import autoprefixer from 'gulp-autoprefixer';
import { create as createBrowserSync } from 'browser-sync';
import csscomb from 'gulp-csscomb';
import cleanCss from 'gulp-clean-css';
import cache from 'gulp-cache';
import cssnano from 'gulp-cssnano';
import {deleteAsync} from 'del';
import imagemin from 'gulp-imagemin';
import htmlPrettify from 'gulp-html-prettify';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import gulpRun from 'gulp-run';
import gulpUtil from 'gulp-util';
import npmDist from 'gulp-npm-dist';
import postcss from 'gulp-postcss';
import runSequence from 'gulp4-run-sequence';
import gulpSass from "gulp-sass";
import nodeSass from "node-sass";
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import useref from 'gulp-useref-plus';
import wait from 'gulp-wait';

const sass = gulpSass(nodeSass);

// Define paths

const paths = {
    dist: {
        base: 'dist',
        img:  'dist/assets/img',
        libs: 'dist/assets/vendor'
    },
    base: {
        base: './',
        node: 'node_modules'
    },
    src: {
        base: './',
        css:  'assets/css',
        html: '**/pages/**/*.html',
        img:  'assets/img/**/*.+(png|jpg|gif|svg)',
        js:   'assets/js/**/*.js',
        scss: 'assets/scss/**/*.scss'
    }
}

// Compile SCSS

gulp.task('scss', () => {
return gulp.src(paths.src.scss)
    .pipe(wait(500))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 1%']
    }))
    .pipe(csscomb())
    .pipe(gulp.dest(paths.src.css))
    .pipe(browserSync.stream());
});
  

// Minify CSS

gulp.task('minify:css', () => {
  return gulp.src([
        `${paths.src.css}/argon.css`
    ])
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${paths.dist.base}/css`))
});

// Minify JS

gulp.task('minify:js', () => {
    return gulp.src([
            `${paths.src.base}/assets/js/argon.js`
        ])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(`${paths.dist.base}/js`))
});

// Live reload

const browserSync = createBrowserSync();

gulp.task('browserSync', () => {
    browserSync.init({
        server: {
            baseDir: [paths.src.base, paths.base.base]
        },
    })
});

// Watch for changes

gulp.task('watch', () => {
    gulp.watch(paths.src.scss, gulp.series('scss'));
    gulp.watch(paths.src.js).on('change', browserSync.reload);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
});

// Clean

gulp.task('clean:dist', () => {
    return deleteSync(paths.dist.base);
});

// Copy CSS

gulp.task('copy:css', () => {
    return gulp.src([
        `${paths.src.base}/assets/css/argon.css`
    ])
    .pipe(gulp.dest(`${paths.dist.base}/css`))
});

// Copy JS

gulp.task('copy:js', () => {
    return gulp.src([
        `${paths.src.base}/assets/js/argon.js`
    ])
    .pipe(gulp.dest(`${paths.dist.base}/js`))
});

// Build

gulp.task('build', (callback) => {
    runSequence('clean:dist', 'scss', 'copy:css', 'copy:js', 'minify:js', 'minify:css',
        callback);
});

// Default

gulp.task('default', gulp.series('scss', 'browserSync', 'watch'));
