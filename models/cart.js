const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});




module.exports = mongoose.model('Cart', cartSchema);
