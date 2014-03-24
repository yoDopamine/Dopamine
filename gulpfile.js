'use strict';

var gulp = require('gulp'),
	es = require('event-stream'),
	fs = require('fs'),
	path = require('path'),
	plugins = require("gulp-load-plugins")(),
	prettifyrc = fs.readFileSync('.prettifyrc', 'utf-8'),

	config = {
		project:{
			name: 'Dopamine'
		},
		dist: './dist',
		distScripts: './dist/scripts',
		distStyles: './dist/css',
		distImages: './dist/images',
		server: {
			root: ['./dist'],
			port: 1337,
			livereload: true
		}
	}


// Connect Task
gulp.task('connect', plugins.connect.server(config.server));

// Markup Task
gulp.task('html', ['markup'], function () {
	return gulp.src('./dist/**/*.html')
		.pipe(plugins.connect.reload());
});

gulp.task('markup', function() {
	gulp.src(['./src/views/*.jade', '!src/views/**/{_,dp-}*.jade'])
		.pipe(plugins.plumber())
		.pipe(plugins.jade({
				pretty: false,
				data: {dp:{page:{},project: config.project}}
		}))
		.pipe(plugins.prettify(prettifyrc))
		.pipe(gulp.dest(config.dist))
});

// Stylus compiler task
gulp.task('stylus', function () {
	return gulp.src(['./src/stylus/main.styl'])
	.pipe(plugins.plumber())
	.pipe(plugins.stylus({
		pretty: false
		}), plugins.util.log('Compiling stylus files...'))
	.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'), plugins.util.log('Applying autoprefixer...'))
	.pipe(gulp.dest(config.distStyles))
	.pipe(plugins.connect.reload(), plugins.util.log('Reloading browser...'));
});


gulp.task('coffee', function () {
	var config = {
		debug: false,
		insertGlobals : true,
		transform: ['coffeeify',
		 ],
		shim: {
			console: {
				path: './vendor/console-polyfill/index.js',
				exports: 'window'
			},
			jquery: {
				path: './vendor/jquery/dist/jquery.min.js',
				exports: '$'
			},
		}
	};

	var bundle = gulp.src('./src/coffee/main.coffee', {
		read: false
	})

	return bundle
		.pipe(plugins.browserify(config))
		.pipe(plugins.rename('bundle.js'))
		.pipe(gulp.dest('./dist/scripts'))
		// .pipe(gulp.dest(config.distScripts))
		.pipe(plugins.connect.reload());
});


// Minify images
gulp.task('imagemin', function () {
	return es.concat(
		gulp.src('./src/images/**/*.png')
			.pipe(plugins.imagemin())
			.pipe(gulp.dest('./dist/images')),
		gulp.src('./src/images/**/*.jpg')
			.pipe(plugins.imagemin())
			.pipe(gulp.dest('./dist/images')),
		gulp.src('./src/images/**/*.gif')
			.pipe(plugins.imagemin())
			.pipe(gulp.dest(config.distImages))
	);
});

// Transfer files for distribution
gulp.task('static', function () {
	return es.concat(
		gulp.src('./src/fonts/**/*')
			.pipe(gulp.dest('./dist/fonts'))
	);
});



gulp.task('watch', function () {
	gulp.watch(['src/stylus/**/*.styl'], ['stylus']);
	gulp.watch(['src/coffee' + '/**/*.{coffee,js}'], ['coffee']);
	gulp.watch(['src/views/**/*.jade'], ['html']);
	gulp.watch(['src/images/**/*'], ['imagemin']);

	// Static file changes
	gulp.watch(['src/static/**/*.*'], ['static']);
});

gulp.task('clean', function () {
	gulp.src(config.dist, {read: false})
		.pipe(plugins.clean());
});

gulp.task('build', [
	'markup',
	'stylus',
	'coffee',
	'imagemin',
	'static'
	], function () {
	plugins.util.log('Building project...');
});
gulp.task('build-code', [
	'markup',
	'stylus',
	'coffee'
	], function () {
	plugins.util.log('Building [code] project...');
});

gulp.task('serve', ['connect', 'build', 'watch']);
gulp.task('serve-code', ['connect', 'build-code', 'watch']);

gulp.task('default', ['serve', 'watch'], function () {
	plugins.util.log('Watching for file changes...');
});
