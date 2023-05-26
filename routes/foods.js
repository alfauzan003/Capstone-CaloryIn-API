var express = require('express')
var router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../config/firebase-config')
const { default: axios } = require('axios')

/* GET food data by request body. */
router.get('/', auth.verifyLogin, async (req, res, next) => {
  try {
    const foods = {
      food: req.body.food
    }
    const food = foods.food
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${food}`
    )
    console.log(response.data)
    res.send(response.data.foods[0])
  } catch (err) {
    next(err)
  }
})

//API get specific data nutrient
router.get('/data', auth.verifyLogin, async (req, res, next) => {
  try {
    const foods = {
      food: req.body.food
    }
    const food = foods.food
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${food}`
    )
    console.log(response.data)
    const dataFood = {
      nameFood: response.data.foods[1].description,
      protein: response.data.foods[1].foodNutrients[0].value,
      lipid: response.data.foods[1].foodNutrients[1].value,
      Carbohydrate: response.data.foods[1].foodNutrients[2].value,
      Calory: response.data.foods[1].foodNutrients[3].value
    }
    res.send(dataFood)
  } catch (err) {
    next(err)
  }
})

//Add Data to database
router.post('/records', auth.verifyLogin, async (req, res, next) => {
  try {
    const foods = {
      food: req.body.food
    }
    const food = foods.food
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${food}`
    )
    const date = new Date()
    console.log(response.data)
    const dataFood = {
      idRecords: generateString(6),
      nameFood: response.data.foods[1].description,
      dateTime: date,
      protein: response.data.foods[1].foodNutrients[0].value,
      lipid: response.data.foods[1].foodNutrients[1].value,
      Carbohydrate: response.data.foods[1].foodNutrients[2].value,
      Calory: response.data.foods[1].foodNutrients[3].value
    }
    await admin
      .firestore()
      .collection('users')
      .doc('124')
      .collection('records')
      .doc()
      .set(dataFood)

    res.send(dataFood)
  } catch (err) {
    next(err)
  }
})

// Get All records
router.get('/records', auth.verifyLogin, function (req, res, next) {
  let arrayJson = []
  async function getUsers() {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc('124')
      .collection('records')
      .get()
    snapshot.docs.forEach((doc) => {
      const finalData = {
        reocrdId: doc.id,
        nameFood: doc.data().nameFood,
        dateRecord: doc.data().dateTime,
        protein: doc.data().protein,
        calory: doc.data().Calory,
        lipid: doc.data().lipid,
        carbohydrate: doc.data().Carbohydrate
      }
      arrayJson.push(finalData)
      console.log(doc.id)
      const test = doc.data().dateTime
      console.log(typeof test)
    })
    return arrayJson
  }
  getUsers().then((user) => res.send(user))
})

module.exports = router
