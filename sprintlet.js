/*
| This is the script for the bookmarklet for the sprintly "my items" script.
| Copyright 2012 Andrew Steele on behalf of EPB's A-Team
| Licensed as Public Domain
|
| Bookmarklet code 'generated' from Ben Alman's "jQuery Bookmarklet Generator",
| http://benalman.com/projects/run-jquery-code-bookmarklet/
|
| External javascript code injection from NetTuts+,
| http://net.tutsplus.com/tutorials/javascript-ajax/create-bookmarklets-the-right-way/
*/

javascript:(function(e,a,g,h,f,c,b,d){if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){c=a.createElement('script');c.type='text/javascript';c.src='http://ajax.googleapis.com/ajax/libs/jquery/'+g+'/jquery.min.js';c.onload=c.onreadystatechange=function(){if(!b&&(!(d=this.readyState)||d=='loaded'||d=='complete')){h((f=e.jQuery).noConflict(1),b=1);f(c).remove()}};a.documentElement.childNodes[0].appendChild(c)}})(window,document,'1.7.1',function($, L) {var c1=document.createElement('script');c1.setAttribute('src', 'https://raw.github.com/epbdev/sprintly-js/master/sprintly.js');document.body.appendChild(c1);});