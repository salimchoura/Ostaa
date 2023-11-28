/*
  Name: Salim Choura and Yanxihao Chen 
  Course Name: CSc337
  Description: this is client side javascript file 
  for OSTAA project. Consists of two functions for adding item and adding user.
*/


/*
  the function adds new user collection to the database
  using fetch API
*/
function addUser() {
  // Get the values of the username and password inputs
  const username = document.getElementById('new_username').value;
  const password = document.getElementById('new_password').value;

  // Send a POST request to add a new user
  let p = fetch('add/user',
    {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({ username: username, password: password, listings: [], purchases: [] })
    }
  )

  p.then((response) => {
    return response.text()
  }).then((text) => {
    console.log(text)
  }).catch((error) => { console.log('error adding user', error) })
}


/**
 * This function requests the server to validate the user trying to 
 * login and redirects them to the home page if the login is successful
 */
function Login() {
  const username = document.getElementById('existing_username').value
  const password = document.getElementById('existing_password').value

  let p = fetch('login/user',
    {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({ username: username, password: password, listings: [], purchases: [] })
    }
  )

  const errorBox = document.getElementById('error_section')

  p.then((response) => {
    return response.text()
  }).then((text) => {
    if (text == 'SUCCESS')
      window.location = '/app/home.html'
    else
      errorBox.innerText = 'Issue logging in with that info'
  }).catch((error) => { console.log('error adding user', error) })
}