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
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (jsonData.foods[0].foodNutrients[i].nutrientName == 'Protein') {
        var proteinId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (
        jsonData.foods[0].foodNutrients[i].nutrientName ==
        'Carbohydrate, by difference'
      ) {
        var carbohydrateId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (
        jsonData.foods[0].foodNutrients[i].nutrientName == 'Total lipid (fat)'
      ) {
        var lipidId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (jsonData.foods[0].foodNutrients[i].nutrientName == 'Energy') {
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
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (jsonData.foods[0].foodNutrients[i].nutrientName == 'Protein') {
        var proteinId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (
        jsonData.foods[0].foodNutrients[i].nutrientName ==
        'Carbohydrate, by difference'
      ) {
        var carbohydrateId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (
        jsonData.foods[0].foodNutrients[i].nutrientName == 'Total lipid (fat)'
      ) {
        var lipidId = i
      }
    }
    for (var i = 0; i < jsonData.foods[0].foodNutrients.length; i++) {
      if (jsonData.foods[0].foodNutrients[i].nutrientName == 'Energy') {
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
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 6
  const offset = (page - 1) * limit

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
        imageURL: doc.data().imageURL
      }
      arrayJson.push(finalData)
    })
    return arrayJson
  }
  getRecord().then((user) => res.send(user))
})

// GET specific record by UID
router.get(
  '/records/:uid/:recordId',
  auth.verifyLogin,
  function (req, res, next) {
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
  }
)

// get record by date
router.get(
  '/records/:uid/date/:date',
  auth.verifyLogin,
  function (req, res, next) {
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
          imageURL: doc.data().imageURL
        }
        arrayJson.push(finalData)
      })
      return arrayJson
    }
    getRecord().then((user) => res.send(user))
  }
)
// get Dashboard data
router.get(
  '/records/:uid/dashboard',
  auth.verifyLogin,
  function (req, res, next) {
    let todayDate = getDate()
    let totalCalory = 0
    let totalFat = 0
    let totalCarbohydrate = 0
    let totalProtein = 0

    let percCalory
    let percCarbohydrate
    let percProtein
    let percFat

    let totalNutrientsNeeds
    let totalNutrients
    async function getRecord() {
      const snapshot = await admin
        .firestore()
        .collection('users')
        .doc(req.params.uid)
        .collection('records')
        .where('dateRecord', '==', todayDate)
        .get()
      let arrayJson = []
      snapshot.docs.forEach((doc) => {
        totalCalory = totalCalory + doc.data().Calory
        totalFat = totalFat + doc.data().lipid
        totalProtein = totalProtein + doc.data().protein
        totalCarbohydrate = totalCarbohydrate + doc.data().Carbohydrate
        const finalData = {
          recordId: doc.id,
          nameFood: doc.data().nameFood,
          dateRecord: doc.data().dateRecord,
          protein: doc.data().protein,
          calory: doc.data().Calory,
          lipid: doc.data().lipid,
          carbohydrate: doc.data().Carbohydrate,
          imageURL: doc.data().imageURL
        }

        arrayJson.push(finalData)
      })
      // console.log('Total Calory: ' + totalCalory)
      // console.log('Total Carbohydrate: ' + totalCarbohydrate)
      // console.log('Total Protein: ' + totalProtein)
      // console.log('Total Fat: ' + totalFat)
      const profileSnapshot = await admin.firestore().collection('users').get()

      let arrayProfile = []
      profileSnapshot.docs.forEach((document) => {
        // console.log(req.params.uid)
        // console.log(document.id)
        if (document.id == req.params.uid) {
          console.log(profileSnapshot.size)
          percCalory = (totalCalory / document.data().caloryNeed) * 100
          percCarbohydrate =
            (totalCarbohydrate / document.data().carbohydrateNeed) * 100
          percProtein = (totalProtein / document.data().proteinNeed) * 100
          percFat = (totalFat / document.data().fatNeed) * 100

          totalNutrientsNeeds =
            document.data().caloryNeed +
            document.data().carbohydrateNeed +
            document.data().proteinNeed +
            document.data().fatNeed

          totalNutrients =
            ((totalCalory + totalCarbohydrate + totalFat + totalProtein) /
              totalNutrientsNeeds) *
            100
        }
      })

      console.log(totalNutrientsNeeds)
      const finalDashboardData = {
        date: todayDate,
        caloryPerc: percCalory,
        carbohydratePerc: percCarbohydrate,
        proteinPerc: percProtein,
        fatPerc: percFat,
        currentNutrientsPerc: totalNutrients
      }
      console.log(percCalory)
      console.log(percCarbohydrate)
      console.log(percProtein)
      console.log(percFat)
      return finalDashboardData
    }
    getRecord().then((user) => res.send(user))
  }
)

function getDate() {
  let date_time = new Date()

  // get current date
  // adjust 0 before single digit date
  let date = ('0' + date_time.getDate()).slice(-2)

  // get current month
  let month = ('0' + (date_time.getMonth() + 1)).slice(-2)

  // get current year
  let year = date_time.getFullYear()

  // get current hours
  let hours = date_time.getHours()

  // get current minutes
  let minutes = date_time.getMinutes()

  // get current seconds
  let seconds = date_time.getSeconds()

  // prints date in YYYY-MM-DD format
  console.log(year + '-' + month + '-' + date)

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  // console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
  todayDate = String(year + '-' + month + '-' + date)
  return todayDate
}

module.exports = router
