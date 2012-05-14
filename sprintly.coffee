###
| The purpose of this file is to make it easier for people to check what is assigned to themselves specifically, across all products they are members of.
| Copyright 2012 Andrew Steele on behalf of EPB's A-Team
| Licensed as Public Domain
###

username = prompt "What e-mail address do you use with Sprint.ly?", ""
password = prompt "What is your Sprint.ly API Key?", ""

make_error_page = () ->
    page = $('#view_content')
    page.empty().html "<h3>You must provide both your e-mail address and API key in order for this bookmarklet to work.</h3>"

# jQuery.ajax requires Basic Auth data to be set in the header
if username? and password?
    base64str = Base64.encode username + ":" + password
    jQuery.ajaxSetup(
        beforeSend: (xhr) -> 
            xhr.setRequestHeader("Authorization", "Basic " + base64str)
    )
else
    make_error_page()

# define the current user by 'borrowing' data from sprint.ly itself
user = sprintly.proxyData.currentUser
user.full_name = user.first_name + " " + user.last_name
user.products = sprintly.proxyData.myProducts
user.product_length = user.products.length
user.items = []

#define team members
members = sprintly.proxyData.currentUsers
_.each members,
    (m) ->
        m.full_name = m.first_name + " " + m.last_name

iterator = user.product_length

# generic api_request wrapper
api_request = (path, func) ->
    base = 'https://sprint.ly/api/'
    url = base + path
    jQuery.ajax url,
        success: (data) ->
            func(data)
        error: (xhr, status, error) ->
            if window.console
                console.log "Error occurred, status: " + status + " and error: " + error
            iterator = iterator - 1

# once a collection of items is returned, assign it to the appropriate product
set_items = (items) ->
    item = _.first items
    product = _.find user.products,
        (p) ->
            return p.pk is item.product.id
    p_index = user.products.indexOf product
    items = _.filter items,
        (i) ->
            return !i.archived
    user.products[p_index].items = items if p_index
    iterator = iterator - 1
    make_my_items_page() if iterator is 0

# get all of the items for each product
_.each user.products,
    (p_id) -> 
        api_request('products/' + product_id + '/items.json', set_items())

###
Types of items:
 40 - Story
 30 - Defect
 20 - Test
 10 - Task
###

master_view_vars =
    user_name: user.first_name
    products: user.products
    type_number: () ->
        return (type, render) ->
            switch type
                when "task" then typeNum = "10"
                when "test" then typeNum = "20"
                when "defect" then typeNum = "30"
                when "story" then typeNum = "40"
            return typeNum
    
master_template = "
        <h3>All items assigned to you, <strong>{{user_name}}</strong>.</h3>
        {{#products}}
            <h2><a href='https://sprint.ly/product/{{product.pk}}'>{{product.title}}</a></h2>
            {{>sub_items}}
        {{/products}}
"

partials =
    sub_items: "
        {{#items}}
            <div id='item-{{number}}' class='my_item type-{{#type_number}}{{type}}{{/type_number}} status-{{status}}'>
                <div class='item_number_and_status'>&hash;{{number}}, status: {{status}}</div>
                <div class='item_title'>{{title}}</div>
                <div class='item_description'>{{description}}</div>
            </div>
        {{/items}}
        {{^items}}
            <p>No items assigned to you for this project.</p>
        {{/items}}
    "

# this will be called after all items are set
make_my_items_page = () ->
    new_content = Mustache.to_html master_template, master_view_vars, partials
    page = $('#view_content')
    page.empty().html new_content