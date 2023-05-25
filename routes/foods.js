var express = require('express')
var router = express.Router()
const auth = require('../middleware/auth')
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
module.exports = router
