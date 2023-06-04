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
    const today = new Date()
    const date = new Date(req.body.birthDate)
    const age = today.getFullYear() - date.getFullYear()
    console.log(age)
    const gender = req.body.gender
    const weight = req.body.weight
    const height = req.body.height
    if(gender=='male' || 'laki-laki' || 'pria'){
      if(age >= 10 && age <= 12){
        var caloryNeed = 2000
        var proteinNeed = 50
        var fatNeed = 65
      } else if(age >= 13 && age <= 15){
        var caloryNeed = 2400
        var proteinNeed = 70
        var fatNeed = 80
      } else if(age >= 16 && age <= 18){
        var caloryNeed = 2650
        var proteinNeed = 75
        var fatNeed = 85
      } else if(age >= 19 && age <= 29){
        var caloryNeed = 2650
        var proteinNeed = 65
        var fatNeed = 75
      } else if(age >= 30 && age <= 49){
        var caloryNeed = 2550
        var proteinNeed = 65
        var fatNeed = 70
      } else if(age >= 50 && age <= 64){
        var caloryNeed = 2150
        var proteinNeed =65
        var fatNeed = 60
      } else if(age >= 65 && age <= 80){
        var caloryNeed = 1800
        var proteinNeed = 64
        var fatNeed = 50
      } else if(age > 80){
        var caloryNeed = 1600
        var proteinNeed = 64
        var fatNeed = 45
      } 
    } else if (gender=='female' || 'perempuan' || 'wanita'){
      if(age >= 10 && age <= 12){
        var caloryNeed = 1900
        var proteinNeed = 55
        var fatNeed = 65
      } else if(age >= 13 && age <= 15){
        var caloryNeed = 2050
        var proteinNeed = 65
        var fatNeed = 70
      } else if(age >= 16 && age <= 18){
        var caloryNeed = 2100
        var proteinNeed = 65
        var fatNeed = 70
      } else if(age >= 19 && age <= 29){
        var caloryNeed = 2250
        var proteinNeed = 60
        var fatNeed = 65
      } else if(age >= 30 && age <= 49){
        var caloryNeed = 2150
        var proteinNeed = 60
        var fatNeed = 60
      } else if(age >= 50 && age <= 64){
        var caloryNeed = 1800
        var proteinNeed =60
        var fatNeed = 50
      } else if(age >= 65 && age <= 80){
        var caloryNeed = 1550
        var proteinNeed = 58
        var fatNeed = 45
      } else if(age > 80){
        var caloryNeed = 1400
        var proteinNeed = 58
        var fatNeed = 40
      }
    }

    const user = {
      uid: req.body.uid,
      name: req.body.name,
      email: req.body.email,
      gender: gender,
      birthDate: date,
      height: height,
      weight: weight,
      caloryNeed: caloryNeed,
      proteinNeed: proteinNeed,
      fatNeed: fatNeed,
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
        caloryNeed: caloryNeed,
        proteinNeed: proteinNeed,
        fatNeed: fatNeed,
      }
      arrayProfile.push(finalProfile)
    })
    return arrayProfile
  }
  getUser().then((user) => res.send(user))
})

module.exports = router
