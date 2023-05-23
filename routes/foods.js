var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth');
const { default: axios } = require('axios');

/* GET food data by request body. */
router.get("/", auth.verifyLogin, async (req, res, next) => {
    try {
        const foods = {
            food: req.body.food
        }
        const food = foods.food;
        const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${food}`);
        console.log(response.data);
        res.send(response.data);
    }
    catch (err) {
        next(err)
    }
})

module.exports = router;
