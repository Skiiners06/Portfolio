const { src, dest, series, parallel, watch } = require('gulp');
const gulpSass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rename = require('gulp-regex-rename');
const unuse = require('postcss-uncss'); //https://github.com/uncss/postcss-uncss

/*
 * SASS$
 */
function sass() {
	let options_unuse = {
		html: 'http://starter.spip'
	};
	return (
		src('css/**/*.scss')
			.pipe(sourcemaps.init())
			.pipe(gulpSass({ outputStyle: 'expanded' }))
			.on('error', err => notify().write(err))
			.pipe(postcss([autoprefixer()])) // autoprefixer
			//		.pipe(postcss([autoprefixer(), cssnano()])) // autoprefixer  +  minifier
			//		.pipe(postcss([unuse(options_unuse), autoprefixer()])) // css unuse + autoprefixer
			.pipe(sourcemaps.write('.')) // initialize sourcemaps first
			.pipe(dest('css'))
	);
}

/*
 * JS -> concat + babel
 */
function jsConcatMinif() {
	console.log('ok');
	return src(['./js/a_compresser/*.js'])
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/preset-env']
			})
		)
		.pipe(concat('roc_squelette.min.js', { newLine: ';' }))
// SPECIFIQUE DEV: ne pas compacter le JS
		//		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./js'));
}

/*
 * JS -> babel
 */
function jsBabel() {
	return src(['js/**/*.es6.js'])
		.pipe(
			babel({
				presets: ['@babel/preset-env']
			})
		)
		.pipe(rename(/\.es6/, ''))
		.pipe(dest('./js'));
}

/*
 * Les Watchers
 */
function watcherSass() {
	watch('css/**/*.scss', { ignoreInitial: false }, sass).on('change', function() {
		notify('CSS -> SCSS ==> OK').write('');
	});
}

function watcherJsConcatMinif() {
	watch('./js/a_compresser/*.js', { ignoreInitial: false }, jsConcatMinif).on('change', function() {
		notify('JS (concat)  ==> OK').write('');
	});
}

function watcherJsBabel() {
	watch('./js/**/*.es6.js', { ignoreInitial: false }, jsBabel).on('change', function() {
		notify('JS (babel)  ==> OK').write('');
	});
}

/*
 * SVG sprite
 */
const gulpSvgSprite = require('gulp-svg-sprite');
const config = {
	shape: {
		spacing: {
			box: 'icon'
		}
	},
	mode: {
		/*		"view": {
					"dest": ".",
					"sprite": "sprite_css_pictos.svg",
					"bust": false
				},
		*/
		symbol: {
			dest: '.',
			sprite: 'sprite_symbol_picto.svg'
		}
	}
};

function svgSprite() {
	return (
		src('svg/**/*.svg')
			//.pipe(plumber())
			.pipe(gulpSvgSprite(config))
			.on('error', function(error) {
				console.log(error);
			})
			.pipe(dest('img'))
	);
}

/*
 * SVG minifier
 */
var svgmin = require('gulp-svgmin');
function svgMin() {
	return src('svg/*.svg')
		.pipe(svgmin())
		.pipe(dest('./svgmin'));
}

/*
 * Exports des fonctions
 */
module.exports = {
	default: parallel(sass, jsConcatMinif, jsBabel),
	sass: sass,
	watch: parallel(watcherSass, watcherJsConcatMinif, watcherJsBabel),
	sprite: svgSprite,
	svgmin: svgMin
};
