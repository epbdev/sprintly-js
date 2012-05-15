// Generated by CoffeeScript 1.3.1
/*
| The purpose of this file is to make it easier for people to check what is assigned to themselves specifically, across all products they are members of.
| Copyright 2012 Andrew Steele on behalf of EPB's A-Team
| Licensed as Public Domain
*/

var Base64, api_request, base64str, iterator, make_error_page, make_my_items_page, master_template, master_view_vars, members, partials, password, set_items, user, username;

Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=Base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}};

username = prompt("What e-mail address do you use with Sprint.ly?", "");

password = prompt("What is your Sprint.ly API Key?", "");

make_error_page = function() {
  var page;
  page = $('#view_content');
  return page.empty().html("<h3>You must provide both your e-mail address and API key in order for this bookmarklet to work.</h3>");
};

if ((username != null) && (password != null)) {
  base64str = Base64.encode(username + ":" + password);
  jQuery.ajaxSetup({
    beforeSend: function(xhr) {
      return xhr.setRequestHeader("Authorization", "Basic " + base64str);
    }
  });
} else {
  make_error_page();
}

user = sprintly.proxyData.currentUser;

user.full_name = user.first_name + " " + user.last_name;

user.products = sprintly.proxyData.myProducts;

user.product_length = user.products.length;

user.items = [];

members = sprintly.proxyData.currentUsers;

_.each(members, function(m) {
  return m.full_name = m.first_name + " " + m.last_name;
});

iterator = user.product_length;

api_request = function(path) {
  var base, url;
  base = 'https://sprint.ly/api/';
  url = base + path;
  return jQuery.ajax(url, {
    success: function(data) {
      return set_items(data);
    },
    error: function(xhr, status, error) {
      if (window.console) {
        console.log("Error occurred, status: " + status + " and error: " + error);
      }
      return iterator = iterator - 1;
    }
  });
};

set_items = function(items) {
  var item, p_index, product;
  if (items.length > 0) {
    item = _.first(items);
    product = _.find(user.products, function(p) {
      return p.pk === item.product.id;
    });
    p_index = user.products.indexOf(product);
    items = _.filter(items, function(i) {
      return !i.archived && (i.assigned_to != null) && i.assigned_to.id === user.pk;
    });
    items = _.sortBy(items, function(i) {
      return i.status;
    });
    if (p_index != null) {
      user.products[p_index].items = items;
    }
  }
  iterator = iterator - 1;
  if (iterator === 0) {
    return make_my_items_page();
  }
};

_.each(user.products, function(p) {
  return api_request("products/" + p.pk + "/items.json");
});

/*
Types of items:
 40 - Story
 30 - Defect
 20 - Test
 10 - Task
*/


master_view_vars = {
  user_name: user.first_name,
  products: user.products,
  type_number: function() {
    return function(type, render) {
      var typeNum;
      switch (type) {
        case "task":
          typeNum = "10";
          break;
        case "test":
          typeNum = "20";
          break;
        case "defect":
          typeNum = "30";
          break;
        case "story":
          typeNum = "40";
      }
      return typeNum;
    };
  }
};

master_template = "<h1>All items assigned to you, <strong>{{user_name}}</strong>.</h1>\n{{#products}}\n    <h2><a href='https://sprint.ly/product/{{pk}}'>{{title}}</a></h2>\n    {{>sub_items}}\n    <br>\n{{/products}}";

partials = {
  sub_items: "{{#items}}\n    <div id='item-{{number}}' class='my_item type-{{#type_number}}{{type}}{{/type_number}} status-{{status}}'>\n        <div class='item_number_and_status'><h4>\#{{number}}</h4></div>\n        <div class='item_title'><a href=\"https://sprint.ly/product/{{#product}}{{id}}{{/product}}/#!/item/{{number}}\">{{title}}</a></div>\n        <div class='item_description'>{{description}}</div>\n    </div>\n{{/items}}\n{{^items}}\n    <p>No items assigned to you for this project.</p>\n{{/items}}"
};

make_my_items_page = function() {
  var new_content, page;
  new_content = Mustache.to_html(master_template, master_view_vars, partials);
  page = $('#view_content');
  return page.empty().html(new_content);
};