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
      food: req.body.food,
      imageURL: req.body.imageURL,
      dateRecord: req.body.dateRecord
    }
    const food = foods.food
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${food}`
    )
    console.log(response.data)
    const dataFood = {
      nameFood: response.data.foods[1].description,
      dateRecord: foods.dateRecord,
      protein: response.data.foods[1].foodNutrients[0].value,
      lipid: response.data.foods[1].foodNutrients[1].value,
      Carbohydrate: response.data.foods[1].foodNutrients[2].value,
      Calory: response.data.foods[1].foodNutrients[3].value,
      imageURL: foods.imageURL
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
      .orderBy('dateRecord', 'desc')
      .limit(limit)
      .offset(offset)
      .get()
    snapshot.docs.forEach((doc) => {
      const finalData = {
        recordId: doc.id,
        nameFood: doc.data().nameFood,
        dateRecord: doc.data().dateRecord,
        protein: doc.data().protein,
        calory: doc.data().Calory,
        lipid: doc.data().lipid,
        carbohydrate: doc.data().Carbohydrate,
        imageURL: doc.data().imageURL,
      }
      arrayJson.push(finalData)
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
      recordId: snapshot.id,
      nameFood: snapshot.data().nameFood,
      dateRecord: snapshot.data().dateRecord,
      protein: snapshot.data().protein,
      calory: snapshot.data().Calory,
      lipid: snapshot.data().lipid,
      carbohydrate: snapshot.data().Carbohydrate,
      imageURL: snapshot.data().imageURL,
      dateRecord: snapshot.data().dateRecord
    }
    return finalData
  }
  getRecord().then((user) => res.send(user))
})

module.exports = router
