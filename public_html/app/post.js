/**
 * Name: Salim Choura and Yanxiao Chen
 * Class: csc 337
 * Description: this file handles the funcionality
 * associated with the post.html page
 */



document.getElementById('post').onclick = addItem


/*
  the function adds new item collection to the database
  using fetch API
*/
function addItem(){
    // Get the values of the item inputs
    const title = document.getElementById('title').value.trimEnd();
    const description = document.getElementById('desc').value.trimEnd();
    const image = document.getElementById('image').files[0];
    image.filename = image.originalname
    const price = document.getElementById('price').value.trimEnd();
    const status = document.getElementById('status').value.trimEnd();
    const formData = new FormData();
    formData.append('photo', image);
    formData.append('title', title);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('description', description);
      
    fetch('/get/currentUser').then((data) => { return data.text() }).then((data) => {
        let url = '/add/item/' + data;
        console.log(url);
        console.log(formData)
        p = fetch(url, {
            method: "POST",
            body: formData
          })
        
          // Log a message if the POST request was successful
          p.then((data) =>{ return data.text()
          }).then((text) => {if (text != undefined) {console.log(text)}})
        
          // Show an alert message if the POST request failed
          p.catch(()=>{
            console.log('something went wrong while requesting posting an item');
          })
      })
  } 