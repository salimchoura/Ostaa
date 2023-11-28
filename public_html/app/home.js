/**
 * Name: Salim Choura and Yanxiao Chen
 * Class: csc 337
 * Description: this file handles the funcionality
 * associated with the home.html page
 */


// username has to be a global variable
var username;

// as soon as the window loads I request to current user
// from the server. The server uses to cookie to tell us 
// the currect user. We tried using document.cookie instead
// but the cookie is formatted weirdly with a lot of symbols
// and we couldn't extract the username from there
window.onload = () => {
    let url = '/get/currentUser'
    let p = fetch(url)
    p.then((data) => { return data.text() }).then((data) => {
        username = data
        console.log(username)
    })
}


/**
 * This function handles making purchases when the user clicks on
 * the buy now button. The e parameter is the button clicked which
 * is needed since there's many buy me buttons (one for each item)
 * and we need to know which button was clicked.
 */
function makePurchase(e)
{
    let index = e.srcElement.id
    let titles = document.getElementsByClassName('title')
    let descriptions = document.getElementsByClassName('description')
    let prices = document.getElementsByClassName('price')

    // using the index of the button clicked to know which item was bought
    // and extract the information of that item
    let title = titles[index].innerText
    let description = descriptions[index].innerText
    let price = prices[index].innerText

    // sending a fetch request to the server to tell it about the item
    // that was bought by our current user
    let url = '/add/purchase/' + username
    let my_body = {'title': title,'description': description,'price': price}
    console.log(my_body)
    p = fetch(url, {
        method: "POST",
        body: JSON.stringify(my_body),
        headers: { 'Content-Type': "application/json" }
      }).then(() => {console.log('success')})
}


// This code handles the case when the user clicks on the view
// listings button. It requests the listings of the current user
// from the server and then adds the listings to our DOM
document.getElementById('listings').onclick = () => {

    fetch('/get/listings/' + username)
        .then((data) => { return data.text() })
        .then((text) => 
        {
            let data = JSON.parse(text);
            console.log(data)
            let right = document.getElementById('lower_right')
            right.innerHTML = ''
            // adding the listings to the DOM here
            for (let listing of data)
            {
                let html = `<br><div class="item">
                <span>Title: ${listing['title']}</span><br>
                <img src="../images/${listing['image']}"><br>
                <span> Description: ${listing['description']}</span><br>
                <span> Price: ${listing['price']}</span><br>
                <span> Status: ${listing['stat']}</span><br>
                </div>`
                right.innerHTML += html
            }
        })
}


// This code handles the case when the user clicks on the view
// purchases button. It requests the purchases of the current user
// from the server and then adds the purchases to our DOM
document.getElementById('purchases').onclick = () => {

    fetch('/get/purchases/' + username)
        .then((data) => { return data.text() })
        .then((text) => 
        {
            let data = JSON.parse(text);
            console.log(data)
            let right = document.getElementById('lower_right')
            right.innerHTML = ''
            // adding the purchases to the DOM
            for (let listing of data)
            {
                let html = `<br><div class="item">
                <span>Title: ${listing['title']}</span><br>
                <img src="../images/${listing['image']}"><br>
                <span> Description: ${listing['description']}</span><br>
                <span> Price: ${listing['price']}</span><br>
                <span> Status: ${listing['stat']}</span><br>
              </div>`
                right.innerHTML += html
            }
        })
}


/**
 * This function handles the case where the user clicks on the search button
 * to search for items matching a keyword. The function adds the item to the
 * DOM and adds buttons if the items have not been SOLD.
 */
document.getElementById('search').onclick = () =>
{
    // first we request the data from our database
    let value = document.getElementById('input').value
    let url = '/search/items/' + value
    fetch(url)
        .then((data) => { return data.text() })
        .then((text) => 
        {
            let my_data = JSON.parse(text);
            let right = document.getElementById('lower_right')
            right.innerHTML = ''
            right.innerHTML = '<br>'
            // adding the data to the DOM
            for (let i=0; i<my_data.length;i++)
            {
                // we give our status, description, title, and status a class name
                // so that later we can extract the information of the item that was
                // purchased
                let listing = my_data[i];
                let item = document.createElement('div')
                let image = document.createElement('img')
                image.src=`../images/${listing['image']}`
                item.classList += 'item'
                let status = document.createElement('span')
                let title = document.createElement('span')
                title.classList += 'title'
                let description = document.createElement('span')
                description.classList += 'description'
                let price = document.createElement('span')
                price.classList += 'price'
                let button = document.createElement('button')
                // our button will have as an id the number of the item
                // in our list of items searched which will make figuring out
                // which button was clicked and which item was bought easier
                button.setAttribute('id',i)
                status.innerHTML += listing['stat']
                description.innerHTML += listing['description']
                price.innerHTML += listing['price']
                title.innerHTML += listing['title']
                button.innerHTML += 'Buy Now' 
                button.classList += 'buy'
                item.innerHTML += '<br>'
                item.appendChild(title)
                item.innerHTML += '<br>'
                item.appendChild(image)
                item.innerHTML += '<br>'
                item.appendChild(description)
                item.innerHTML += '<br>'
                item.appendChild(price)
                item.innerHTML += '<br>'
                // if the item is not sold we add a button, otherwise, we just
                // show that the status is sold
                if (listing['stat'] != 'SOLD' && listing['stat'] != 'sold')
                {
                    item.appendChild(button)
                    item.innerHTML += '<br>'
                }
                else
                {
                    item.appendChild(status)
                    item.innerHTML += '<br>'
                }
                right.appendChild(item)
                right.innerHTML += '<br>'
            }
            // adding event listeners to the buy now buttons that we added
            addEventListeners();
        })
}


// this code redirects the user when he clicks on the create
// post button
document.getElementById('create').onclick = () => 
{
    window.location.href = '/app/post.html'
}

// This function adds event listeners to the buy now buttons
// The event listener will be the makePurchase function which
// takes the id of the button clicked and uses it to figure out
// and extract the information of the item purchased (example:
// button with id 1 will correspond to item number 1 in our items)
function addEventListeners()
{
    let buttons = document.getElementsByClassName('buy')
    for (let button of buttons)
    {
        button.onclick = (e) => {makePurchase(e)}
    }
}

