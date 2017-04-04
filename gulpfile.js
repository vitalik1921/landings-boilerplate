"use strict";
const gulp         = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS     = require('gulp-clean-css');
const uglify       = require('gulp-uglify');
const sass         = require('gulp-sass');
const concat       = require('gulp-concat');
const imagemin     = require('gulp-imagemin');
const browserSync  = require('browser-sync').create();
const watch        = require('gulp-watch'); gulp.watch = watch;
const flatten      = require('gulp-flatten');
const del          = require('del');
const sourcemaps   = require('gulp-sourcemaps');
const dedupe       = require('gulp-dedupe');

// ROUTES

let scss_route_from              = 'app/scss/*.scss';
let scss_route_to                = 'dist/css';
let scss_route_file_name         = 'main.css';

let vendors_js_route_from        = ['app/js/vendors/jquery-2.0.3.min.js', 'app/js/vendors/*.js', 'app/js/vendors/**/*.js'];
let vendors_js_route_to          = 'dist/js';
let vendors_js_route_file_name   = 'vendors.js';

let js_route_from                = 'app/js/*.js';
let js_route_to                  = 'dist/js';
let js_route_file_name           = 'main.js';

let images_route_from            = ['app/img/*.*', 'app/img/**/*.*'];
let images_route_to              = 'dist/img';

let fonts_route_from             = 'app/fonts/*.*';
let fonts_route_to               = 'dist/fonts';

let templates_route_from         = 'app/*.html';
let templates_route_to           = 'dist';

// FUNCTIONS

function makeSCSS(folder_from, folder_to, dest_file) {
    gulp.src(folder_from)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'IE >= 10'],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie10'
        }))
        .pipe(concat(dest_file))
        .pipe(gulp.dest(folder_to));
}


function makeJS(folder_from, folder_to, dest_file) {
    gulp.src(folder_from)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(dest_file))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(folder_to));
}

function copyImages(folder_from, folder_to) {
    gulp.src(folder_from)
        .pipe(imagemin())
        .pipe(gulp.dest(folder_to));
}

function copyFiles(folder_from, folder_to, callback) {
    if (typeof(callback) == "undefined") {
        callback = function() {};
    }
    gulp.src(folder_from)
        .pipe(flatten())
        .pipe(gulp.dest(folder_to))
        .on('end', callback);
}

// TASKS

gulp.task('removedist', function() {
    return del.sync('dist');
});

gulp.task('watch', function() {
  gulp.watch(scss_route_from,
    function() {
      makeSCSS(scss_route_from, scss_route_to, scss_route_file_name);
    }
  );
  gulp.watch(vendors_js_route_from,
    function() {
      makeJS(vendors_js_route_from, vendors_js_route_to, vendors_js_route_file_name);
    }
  );
  gulp.watch(js_route_from,
    function() {
      makeJS(js_route_from, js_route_to, js_route_file_name);
    }
  );
  gulp.watch(images_route_from,
    function() {
      copyImages(images_route_from, images_route_to);
    }
  );
  gulp.watch(fonts_route_from,
    function() {
      copyFiles(fonts_route_from, fonts_route_to);
    }
  );
  gulp.watch(templates_route_from,
    function() {
      copyFiles(templates_route_from, templates_route_to);
    }
  );
  browserSync.init({
      logLevel: "info",
      port: 8080,
      open: false,
      server: {
          baseDir: 'dist'
      },
      notify: false
  });
  gulp.watch(['dist/*.*', 'dist/**/*.*', 'dist/**/**/*.*', 'dist/**/**/**/*.*', 'dist/**/**/**/**/*.*'], function() {
      browserSync.reload();
  });
});

gulp.task('vendors', function() {
  gulp.watch(vendors_js_route_from,
    function() {
      makeJS(vendors_js_route_from, vendors_js_route_to, vendors_js_route_file_name);
    }
  );
});

gulp.task('build', ['removedist'], function() {
  //vendors
  makeJS(vendors_js_route_from, vendors_js_route_to, vendors_js_route_file_name);
  //general
  makeSCSS(scss_route_from, scss_route_to, scss_route_file_name);
  makeJS(js_route_from, js_route_to, js_route_file_name);
  copyImages(images_route_from, images_route_to);
  copyFiles(fonts_route_from, fonts_route_to);
  copyFiles(templates_route_from, templates_route_to);
});
