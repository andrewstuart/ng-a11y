'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({camelize: true});
var merge = require('merge-stream');
var argv = require('yargs').argv;

var distFolder = 'dist';
var pkg = require('./package.json');

gulp.task('build', function() {
    return gulp.src(['src/pre.js', 'src/*/*.js', 'src/post.js'])
    .pipe($.concat(pkg.name + '.js'))
    .pipe($.ngAnnotate())
    .pipe(gulp.dest(distFolder))
    .pipe($.uglify())
    .pipe($.rename(pkg.name + '.min.js'))
    .pipe(gulp.dest(distFolder));
});

gulp.task('docs', ['build'], function() {
    return gulp.src('src/*/*.js')
        .pipe($.ngdocs.process({
            html5Mode: false,
            title: 'ng-a11y library',
            scripts: ['dist/' + pkg.name + '.js']
        }).on('error', function(e) {
            console.error('Error with ngdocs', e);
            this.emit('end');
        }))
        .pipe(gulp.dest('docs'));
});

gulp.task('publish', ['default'], function() {
    if (!argv.version) {
        console.error('Missing --version flag');
    }

    var versions = gulp.src('./bower.json', './package.json')
        .pipe($.bump({
            type: argv.version
        }))
        .pipe(gulp.dest('./'));

    var pages = gulp.src('docs/**/*')
        .pipe($.ghPages());

    return merge(versions, pages);
});

gulp.task('default', ['build', 'docs']);

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*', ['default']);
});
