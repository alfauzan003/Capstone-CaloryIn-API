var express = require('express');
var router = express.Router();
const admin = require('firebase-admin');
const credentials = require('../serviceaccount.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  async function getUsers() {
    const snapshot = await admin.firestore().collection('users').get();
    const users = snapshot.docs.map(doc => doc.data());
    return users;
  }
  getUsers().then(users => res.send(users));
});

// Create Document ID same as firebase auth UID
router.post('/register', async (req, res, next) => {
  async function createUser() {
    const user={
      uid: req.body.uid,
      name: req.body.name,
      email: req.body.email
    }
    await admin.firestore().collection('users').doc(user.uid).set(user);
  }
  createUser().then(user => res.send(user));
});

// Get user by UID
router.get('/:uid', async (req, res, next) => {
  async function getUser() {
    const snapshot = await admin.firestore().collection('users').doc(req.params.uid).get();
    const user = snapshot.data();
    return user;
  }
  getUser().then(user => res.send(user));
});


module.exports = router;
