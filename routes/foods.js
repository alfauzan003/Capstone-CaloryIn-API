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

//Add record by UID
router.post('/records/:uid', auth.verifyLogin, async (req, res, next) => {
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
      .doc(req.params.uid)
      .collection('records')
      .doc()
      .set(dataFood)

    res.send(dataFood)
  } catch (err) {
    next(err)
  }
})

// Get All records by UID
router.get('/records/:uid', auth.verifyLogin, function (req, res, next) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  let arrayJson = []
  async function getRecord() {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc(req.params.uid)
      .collection('records')
      .orderBy('dateTime', 'desc')
      .limit(limit)
      .offset(offset)
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
  getRecord().then((user) => res.send(user))
})

// GET specific record by UID
router.get('/records/:uid/:recordId', auth.verifyLogin, function (req, res, next) {
  async function getRecord() {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc(req.params.uid)
      .collection('records')
      .doc(req.params.recordId)
      .get()
    const finalData = {
      reocrdId: snapshot.id,
      nameFood: snapshot.data().nameFood,
      dateRecord: snapshot.data().dateTime,
      protein: snapshot.data().protein,
      calory: snapshot.data().Calory,
      lipid: snapshot.data().lipid,
      carbohydrate: snapshot.data().Carbohydrate
    }
    return finalData
  }
  getRecord().then((user) => res.send(user))
})

module.exports = router
