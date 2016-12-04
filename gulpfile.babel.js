const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify');
const runSequence = require('run-sequence');
const inject = require('gulp-inject');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');


gulp.task('scripts', () => {
    return browserify({ entries: ['main.js'], extensions: ['.js'], debug: true })
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('build'));
})

gulp.task('sass', function() {
    return gulp.src('./styles/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./build/'));
});


gulp.task('clean', () => {
    return gulp.src('./build/').pipe(clean());
})

gulp.task('html', function() {
    var target = gulp.src('./index.html');
    var sources = gulp.src(['./build/*.js', './build/*.css'], { read: false });

    return target.pipe(inject(sources))
        .pipe(gulp.dest('.'));
});


gulp.task('scripts:prod', ['clean'], () => {
    return browserify({ entries: ['main.js'], extensions: ['.js'], debug: true })
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('build'))
});

gulp.task('serve:dist', () => {
    runSequence('scripts:prod', 'sass', 'html', () => {
        browserSync({
            port: 9000,
            server: {
                baseDir: '.'
            }
        })
        gulp.watch(['main.js', './src/**/*.js'], ['scripts']).on('change', reload);
        gulp.watch('./styles/**/*.scss', ['sass']).on('change', reload);
    })

})

gulp.task('serve:prod', (callback) => {
    return runSequence('scripts:prod', 'sass', 'html', callback);
})

gulp.task('serve', ['default']);

gulp.task('default', () => {
    runSequence('clean', 'scripts', 'sass', 'html', () => {
        browserSync({
            port: 9000,
            server: {
                baseDir: '.'
            }
        })
        gulp.watch(['main.js', './src/**/*.js'], ['scripts']).on('change', reload);
        gulp.watch('./styles/**/*.scss', ['sass']).on('change', reload);

    })

})
