const mongoose = require("mongoose");
const foodSchema = new mongoose.Schema(
    {
    name:{ type: String, required: true },
    quantity:{ type: String, required: true },
    price:{ type: String, required: true },
   
    image:{ type: String } 
    }
);

const foodModel= mongoose.model("Food", foodSchema);
module.exports = foodModel;