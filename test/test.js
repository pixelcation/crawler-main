var assert = require('chai').assert,
	crawler = require('../index.js')

var string = {
	search: 'opikold',
	page: 'india',
	disamb: 'Gabbar Singh'
}

describe('Search', () => {
	it('should give {type: search} type object', function(done) {
		this.timeout(10000)
		crawler.crawl(string.search).then((data) => {
			assert.equal('search', data.type)
			done()
		})
	})
})

describe('Page', () => {
	it('should give {type: page} type object', function(done) {
		this.timeout(50000)
		crawler.crawl(string.page).then((data) => {
			assert.equal('page', data.type)
			done()
		})
	})
})

describe('Disambiguation', () => {
	it('should give {type: search} type object', function(done) {
		this.timeout(50000)
		crawler.crawl(string.disamb).then((data) => {
			assert.equal('search', data.type)
			done()
		})
	})
})