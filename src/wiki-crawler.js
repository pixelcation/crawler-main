var request = require('request'),
	htmlparser = require("htmlparser2"),
	S = require('string')

var endpoint = 'https://en.wikipedia.org/w/index.php?search='

var trim = (string) => {
	return string.replace(/\s+/g,' ').replace(/\[\d\]/g,'').trim()
}

module.exports = {
	crawl: (query) => {
		return new Promise(function(resolve, reject){
			request.get(encodeURI(endpoint+query), {followRedirect: false}, (err, res, body) => {
				if(res.statusCode == 200){
					var flag = {
						list: false,
						item: false,
						title: false,
						description: false
					}
					var buffer = {
						link: endpoint+query,
						title: '',
						description: ''
					}
					var results = []
					var parser = new htmlparser.Parser({
						onopentag: (name, attribs) => {
							if(name=='ul' && attribs.class=='mw-search-results'){
								flag.list = true
							}
							if(name=='div' && attribs.class=='mw-search-result-heading'){
								flag.title = true
							}
							if(name=='div' && attribs.class=='searchresult'){
								flag.description = true
							}
							if(flag.list && name=='li'){
								flag.item = true
							}
						},
						ontext: (text) => {
							if(flag.list) {
								if(flag.title){
									buffer.title += text
								}else if(flag.description){
									buffer.description += text
								}
							}
						},
						onclosetag: (name) => {
							if(name == 'ul') {
								flag.list = false
							}
							if(flag.title && name == 'div'){
								flag.title = false
							}
							if(flag.description && name == 'div'){
								flag.description = false
							}
							if(flag.list && flag.item && name=='li'){
								results.push({
									title: trim(buffer.title), 
									description: trim(buffer.description)
								})
								buffer.title = buffer.description = ''
								flag.item = false
							}
						}
					}, {decodeEntities: true})
					parser.write(body)
					parser.end()
					resolve({type: 'search', reults: results})
				}else if(res.statusCode == 302){	
					var page = res.headers.location
					request.get(page, (err, res, body) => {		
						if(res.statusCode == 200){
							var content = {
								type: 'page',
								link: page,
								title: '',
								description: ''
							}
							var flag = {
								self: false,
								title: false,
								description: false,
								p_count: 0,
								depth: 0
							}
							var parser = new htmlparser.Parser({
								onopentag: (name, attribs) => {
									if(name=='h1' && attribs.class=='firstHeading'){
										flag.title = true
									}else if(name=='div' && attribs.class=='mw-body-content'){
										flag.self = true
									}else if(flag.self && name=='p' && flag.depth===2){
										if(flag.p_count < 3){
											flag.description = true
											flag.p_count++
										}else{
											parser.end()
										}
									}
									if(flag.self){
										flag.depth++
									}
								},
								ontext: (text) => {
									if(flag.title){
										content.title += text
									}else if(flag.self && flag.description){
										content.description += text
									}					
								},
								onclosetag: (name) => {
									if(flag.title && name=='h1'){
										flag.title = false
									}else if(flag.self && flag.description && name=='p'){
										flag.description = false
									}	
									if(flag.self){
										flag.depth--
									}
								}
							}, {decodeEntities: true})
							parser.write(body)
							parser.end()
							if(S(content.description).endsWith('may refer to:')){
								var flag = {
									self: false,
									ul: false,
									li: false,
									title: false,
									depth: 0
								}
								var buffer = {
									title: '',
									description: ''
								}
								var results = []
								var parser = new htmlparser.Parser({
									onopentag: (name, attribs) => {
										if(name=='div' && attribs.class=='mw-body-content'){
											flag.self = true
										}else if(flag.self && name=='ul'){
											flag.ul = true
										}else if(flag.self && flag.depth===3 && name=='li'){
											flag.li = true
										}else if(flag.li && name=='a'){
											flag.title = true
										}
										if(flag.self){
											flag.depth++
										}
									},
									ontext: (text) => {
										if(flag.title){
											buffer.title += text
										}else if(flag.li && !flag.title){
											buffer.description += text
										}					
									},
									onclosetag: (name) => {
										if(flag.li && name=='li'){
											results.push({title: buffer.title, description: buffer.description})
											buffer.title = buffer.description = ''
											flag.li = false
										}
										if(flag.title && name=='a'){
											flag.title = false
										}
										if(flag.ul && name=='ul'){
											parser.end()
										}		
										if(flag.self){
											flag.depth--
										}
									}
								}, {decodeEntities: true})
								parser.write(body)
								parser.end()
								resolve({type: 'search', results: results})
							}else{
								resolve(content)
							}
						}else{
							reject({error: 'Wiki error'})
						}
					})
				}else{
					reject({error: 'Wiki error'})
				}
			})
		})
	}
}