var babel = require('babel-core');
var expect = require('chai').expect;
var plugin = require('../src/index.js');

function transformCode(code) {
	var result = babel.transform(code, {
		plugins: [
			[ plugin, { translateFunction: '_T', module: '/test/fixtures/translate', moduleFunction: 'translate' } ]
		]
	});

	return result.code;
}

describe('babel-plugin-translate-strings', function () {
	var code, result;

	beforeEach(function () {
		result = transformCode(code);
	});

	describe('when name of function in call expression does not match', function () {
		before(function () {
			code = 'foo("bar");';
		});

		it('should do nothing', function () {
			expect(result).to.equal(code);
		});
	});

	describe('when call expression called with more than one arg', function () {
		before(function () {
			code = '_T("foo", "A", "B");';
		});

		it('should pass all arguments to translate function', function () {
			expect(result).to.equal('"AfooB";');
		});
	});
	describe('when call expression called with double-quoted string', function () {
		before(function () {
			code = '_T("foo");';
		});

		it('should replace function with double-quoted translation', function () {
			expect(result).to.equal('"TfooT";');
		});
	});

	describe('when call expression called with (single-quoted) string', function () {
		before(function () {
			code = "_T('foo');";
		});

		it('should replace function with (single-quoted) translation', function () {
			expect(result).to.equal("'TfooT';");
		});
	});

	describe('when call expression called with (ES6) template literal', function () {
		before(function () {
			code = "_T(`foo`);";
		});

		it('should replace function with translation', function () {
			expect(result).to.equal('"TfooT";');
		});
/*
		describe('when template literal contains newlines and backslashes', function () {
			before(function () {
				code = "_T(`foo\nbar\\baz`);";
			});

			it('should replace function with translation', function () {
				expect(result).to.equal('"Tfoo\nbar\\bazT";');
			});
		});
*/
	});

	describe('when call expression called with concatenated strings', function () {
		before(function () {
			code = '_T("foo" + (\'bar\' + "baz") + `qux`);';
		});

		it('should replace function with translation of concatenated strings', function () {
			expect(result).to.equal('"TfoobarbazquxT";');
		});
	});

	describe('when call expression called with complex expression', function () {
		describe('when expression can be evaluated at compile time', function () {
			before(function () {
				code = 'var a = 2, b = 3, c = _T("foo" + (a + b));';
			});

			it('should replace function with translation of evaluated expression', function () {
				expect(result).to.contain('"Tfoo5T";');
			});
		});

		describe('when expression uses template literals', function () {
			before(function () {
				code = 'const a = 2, b = 3, c = _T(`foo${ a + b }`);';
			});

			it('should replace function with translation of evaluated expression', function () {
				expect(result).to.contain('"Tfoo5T";');
			});
		});

		describe('when expression cannot be evaluated at compile time', function () {
			before(function () {
				code = 'const a = 2, b = x, c = _T(`foo${ a + b }`);';
			});

			it('should do nothing', function () {
				expect(result).to.contain('_T(`foo${ a + b }`)');
			});
		});
	});
});
