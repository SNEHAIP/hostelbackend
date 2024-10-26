// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
});
const orderModel = mongoose.model('Order', orderSchema);
module.exports = orderModel
