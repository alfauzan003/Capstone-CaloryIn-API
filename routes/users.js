var express = require('express')
var router = express.Router()
const admin = require('../config/firebase-config')
const auth = require('../middleware/auth')

/* GET users listing. */
router.get('/', auth.verifyLogin, function (req, res, next) {
  async function getUsers() {
    const snapshot = await admin.firestore().collection('users').get()
    const users = snapshot.docs.map((doc) => doc.data())
    return users
  }
  getUsers().then((users) => res.send(users))
})

// Create Document ID same as firebase auth UID
router.post('/register', async (req, res, next) => {
  async function createUser() {
    const date = new Date(req.body.birthDate)
    const user = {
      uid: req.body.uid,
      name: req.body.name,
      email: req.body.email,
      birthDate: date,
      height: req.body.height,
      weight: req.body.weight,
    }
    await admin
      .firestore()
      .collection('users')
      .doc(req.body.uid)
      .collection('profile')
      .doc()
      .set(user)
  }
  createUser().then((user) => res.send(user))
})

// Get user by UID
router.get('/:uid', auth.verifyLogin, async (req, res, next) => {
  let arrayProfile = []
  async function getUser() {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc(req.params.uid)
      .collection('profile')
      .get()

    snapshot.docs.forEach((data) => {
      const finalProfile = {
        uid: data.data().uid,
        name: data.data().name,
        email: data.data().email,
        birthDate: data.data().birthDate,
        height: data.data().height,
        weight: data.data().weight,
      }
      arrayProfile.push(finalProfile)
    })
    return arrayProfile
  }
  getUser().then((user) => res.send(user))
})

module.exports = router
