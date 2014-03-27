$ = require 'jquery'
isPage = require './components/ispage.coffee'

console.log 'ProjectName'
console.log 'jQuery', $.fn.jquery

#Things here
if isPage 'index'
	console.log 'index page'
