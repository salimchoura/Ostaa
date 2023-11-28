/*
  Name: Salim Choura and Yanxihao Chen 
  Course Name: CSc337
  Description: this is server side javascript file 
  for OSTAA project.
*/

// import necessary modules
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const port = 3000
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public_html/images');
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
})

const upload = multer({storage});

app.use(cookieParser());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// set up static files directory

// mongo connection
const db = mongoose.connection;
const mongoDBURL = "mongodb://127.0.0.1:27017/ostaa";
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', () => { console.log('MongoDB connection error:') });

// define mongoose schemas
const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String
})

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  listings: [String],
  purchases: [String]
})

// create mongoose models from schemas
const Item = mongoose.model("Item", itemSchema);
const User = mongoose.model('User', userSchema);


let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}

app.get('/get/users', (req, res) => {
  // fetch all users from the database and return as JSON data
  let p = User.find().exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents))
  })
    .catch((error) => {
      console.log('Error getting users list ', error)
    })
})

function authenticate(req, res, next) {
  let c = req.cookies.login;
  console.log('auth request:');
  if (c != undefined) {
    if (sessions[c.username] != undefined && 
      sessions[c.username].id == c.sessionID) {
      next();
    } else {
      res.redirect('/index.html');
    }
  }  else {
    res.redirect('/index.html');
  }
}


app.use('/app/*', authenticate);

app.use(express.static('public_html'));

app.get('/get/currentUser', (req,res) =>
{
  res.end(req.cookies.login.username);
})

app.get('/get/items', (req, res) => {
  // fetch all items from the database and return as JSON data
  let p = Item.find().exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents))
  })
    .catch((error) => {
      console.log('Error getting users list ', error)
    })
})

// get all listings of a particular user
app.get('/get/listings/:USERNAME', async (req, res) => {

  const username = req.params.USERNAME;
  let user = await User.findOne({ username: username }).exec();
  const listings = [];
  for (let listing of user.listings) {
    // find the item for each listing and add it to the result array
    let item = await Item.findById(listing);
    listings.push(item);
  }
  res.end(JSON.stringify(listings))
})

// get all purchases made by a particular user
app.get('/get/purchases/:USERNAME', async (req, res) => {

  const username = req.params.USERNAME;
  let user = await User.findOne({ username: username }).exec();
  const purchases = [];
  for (let purchase of user.purchases) {
    // find the item for each listing and add it to the result array
    let item = await Item.findById(purchase);
    purchases.push(item);
  }
  res.end(JSON.stringify(purchases))
})


function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    //if (last + 120000 < now) {
    if (last + 200000 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);



// search for users that match a certain keyword
app.get('/search/users/:KEYWORD', (req, res) => {
  const keyword = req.params.KEYWORD;
  const p = User.find({}).exec();
  p.then((users) => {
    const neededUsers = [];
    for (let user of users) {
      // filter users whose username contains the given keyword
      if (user.username.includes(keyword)) {
        neededUsers.push(user);
      }
    }
    // return the matching users
    res.json(JSON.stringify(neededUsers));
  })
    .catch((error) => {
      console.log('error getting users from db', error)
    })
})


app.get('/search/items/:KEYWORD', (req, res) => {
  // get the search keyword from the request parameters
  const keyword = req.params.KEYWORD;
  const p = Item.find({}).exec();
  p.then((items) => {
    const neededItems = [];
    for (let item of items) {
      // filter users whose username contains the given keyword
      if (item.description.includes(keyword)) {
        neededItems.push(item);
      }
    }
    // return the matching items
    res.end(JSON.stringify(neededItems));
  })
    .catch((error) => {
      console.log('error getting items from db', error)
    })
})

app.post('/add/user', (req, res) => {
  let p = User.findOne({ username: req.body.username }).exec();
  p.then((document) => {
    if (document != undefined) {
      res.end('username already exists')
    }
    else {
      let user = new User(req.body)
      user.save().then(() => { res.end('new user created') })
        .catch((error) => { console.log('could not save user', error) })
    }
  }).catch((error) => { console.log('error retrieving user', error) })
})

app.post('/add/item/:USERNAME', upload.single('photo'), (req, res) => {
  // get the username from the request parameters
  const username = req.params.USERNAME;

  let item = {
    title: req.body.title,
    description: req.body.description,
    image: req.file.originalname,
    price: req.body.price,
    stat: req.body.status
  }
  // create a new item object and save it to the database
  const newItem = new Item(item);
  newItem.save().then(() => {
    console.log('new Item saved');
  }).catch((error) => { console.log('could not save new item', error) })

  // add the new item to the user's listings array
  let p = User.findOne({ username: username }).exec()
  p.then((user) => {
    user.listings.push(newItem.id)
    user.save().then(() => { console.log('update of listings made') })
      .catch((error) => { console.log('failed to update listing', error) })
  })
    .catch((error) => { console.log('could not add item to user listing', error) })
})


// When the server gets this request, it adds the id of the item 
// to the list of purchases of the user
app.post('/add/purchase/:USERNAME', async (req, res) => {
  console.log('request received')
  // get the username from the request parameters
  const username = req.params.USERNAME;
  let purchase = await Item.findOne(req.body).exec()
  purchase['stat'] = 'SOLD'
  purchase.save().then(() => {console.log('purchase updated')})
  let user = await User.findOne({ username: username }).exec();
  user['purchases'].push(purchase['id'])
  user.save().then(() => {console.log('user purchases list updated'); res.end('success')})
})


// request to login the user
app.post('/login/user', (req, res) => { 
  console.log(sessions);
  let u = req.body;
  let p1 = User.find({username: u.username, password: u.password}).exec();
  p1.then( (results) => { 
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
      let sid = addSession(u.username);  
      res.cookie("login", 
        {username: u.username, sessionID: sid}, 
        {maxAge: 200000 });
      res.end('SUCCESS');
    }
  });
});


// starting the server
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));