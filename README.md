# wiki-crawler
A search and crawler program for Wikipedia articles. Search the articles in wikipedia, get the results or get the page content if the keyword is page itself.

### Installation
```javascript
npm install wiki-crawler
```

### Usage
This is very simple library. Just initiate it and use `crawl` function. It returns promise back

```javascript
var crawler = require('wiki-crawler')
crawler.crawl(string.search).then((data) => {
	// data contains the result
})
```
### Result
data contains following information
+ `type: search || page` it contains the type of data. If the result is actual search result, it contains search, else if it is a page instead, it contains page
+ `title`: if the result is page, it contains title
+ `description`: if the result is page, it contains description
+ `results`: if the result is search result, it contains all the results(array). Each item does have `title` and `description` inturn

### License
`MIT`
