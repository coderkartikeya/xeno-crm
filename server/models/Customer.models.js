const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    address: {type: String, required: true},
    email: {type: String, required: true},
    phone:  {type: String, required: true},
    loyaltyPoints: {type: Number, default: 0},
    totalSpend: {type: Number, default: 0},
    totalOrders: {type: Number, default: 0},
    visits:     {type: Number, default: 0},
    lastOrder:  {type: String, default: ''},
    lastOrderDate: {type: Date, default: Date.now},
    lastVisit:  {type: Date, default: Date.now},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand', // brand that owns this customer
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
