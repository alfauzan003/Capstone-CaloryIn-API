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
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=2T0wJdkyemstg8Oqpg6N8KAy768QWfUKCmQBILeN&query=${food}`
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
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=2T0wJdkyemstg8Oqpg6N8KAy768QWfUKCmQBILeN&query=${food}`
    )
    console.log(response.data)
    let jsonData = JSON.parse(JSON.stringify(response.data))
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Protein") {
        var proteinId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Carbohydrate, by difference") {
        var carbohydrateId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Total lipid (fat)") {
        var lipidId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Energy") {
        var caloryId = i
      }
    }

    const dataFood = {
      nameFood: response.data.foods[0].description,
      protein: response.data.foods[0].foodNutrients[proteinId].value,
      lipid: response.data.foods[0].foodNutrients[lipidId].value,
      Carbohydrate: response.data.foods[0].foodNutrients[carbohydrateId].value,
      Calory: response.data.foods[0].foodNutrients[caloryId].value
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
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=2T0wJdkyemstg8Oqpg6N8KAy768QWfUKCmQBILeN&query=${food}`
    )
    console.log(response.data)
    let jsonData = JSON.parse(JSON.stringify(response.data))
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Protein") {
        var proteinId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Carbohydrate, by difference") {
        var carbohydrateId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Total lipid (fat)") {
        var lipidId = i
      }
    }
    for (var i=0; i<jsonData.foods[0].foodNutrients.length; i++) {
      if(jsonData.foods[0].foodNutrients[i].nutrientName == "Energy") {
        var caloryId = i
      }
    }
    const dataFood = {
      nameFood: response.data.foods[0].description,
      dateRecord: foods.dateRecord,
      protein: response.data.foods[0].foodNutrients[proteinId].value,
      lipid: response.data.foods[0].foodNutrients[lipidId].value,
      Carbohydrate: response.data.foods[0].foodNutrients[carbohydrateId].value,
      Calory: response.data.foods[0].foodNutrients[caloryId].value,
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

// get record by date
router.get('/records/:uid/date/:date', auth.verifyLogin, function (req, res, next) {
  async function getRecord() {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc(req.params.uid)
      .collection('records')
      .where('dateRecord', '==', req.params.date)
      .get()
    let arrayJson = []
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

module.exports = router
