const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken")
const adminModel = require("./models/admins")
const userModel = require("./models/user")
const foodModel  = require("./models/book")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://snehaip:sneha2020@cluster0.swl0hmq.mongodb.net/surplusfooddb?retryWrites=true&w=majority&appName=Cluster0") 

//ADMIN
app.post("/AdminLogin", (req, res) => {
    let input = req.body;

    // Default admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if the input matches admin credentials
    
    if (input.email === adminEmail && input.password === adminPassword) {
        // Admin login successful
        jwt.sign({ email: input.email }, "hostelfood-app", { expiresIn: "1d" }, (error, token) => {
            if (error) {
                res.json({ "status": "Token credentials failed" });
            } else {
                res.json({ "status": "success", "token": token, "message": "Admin logged in successfully" });
            }
        })
        };
    }
)
const generateHashedPassword = async(password) =>{
  const salt = await bcrypt.genSalt(10)  
  return bcrypt.hash(password,salt)
}


app.post('/AddFood', async (req, res) => {
  try {
      const { name, quantity, price, image } = req.body;
      
      if (!name || !quantity || !price || !image) {
          return res.status(400).json({ status: 'error', message: 'All fields are required' });
      }

      const newFood = new foodModel({
          name,
          quantity,
          price,
          image
      });

      await newFood.save();
      res.status(200).json({ status: 'success', message: 'food added successfully' });
  } catch (error) {
      console.error('Error adding food:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add food' });
  }
});

// View Food
app.post('/ViewFood', async (req, res) => {
  try {
      const food = await foodModel.find();
      res.status(200).json(food);
  } catch (error) {
      console.error('Error fetching food:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch food' });
  }

});

const Cart = require('./models/cart');  // Import the Cart model
const Wishlist = require("./models/wishlist")
const feedbackModel = require("./models/feedback")
const order = require("./models/order")
const cart = require("./models/cart")
const orderModel = require("./models/order")

app.post('/AddToCart', async (req, res) => {
  try {
    console.log(req.body); // Log request body
    const { foodId, quantity } = req.body;
    const foodItem = await foodModel.findById(foodId);

    if (!foodItem) {
      return res.status(404).json({ status: 'error', message: 'Food item not found' });
    }

    // Ensure quantity is at least 1 if not provided
    const cartQuantity = quantity || 1;

    const cartItem = new Cart({
      foodId: foodItem._id,
      name: foodItem.name,
      price: foodItem.price,
      quantity: cartQuantity,
    });

    await cartItem.save();
    res.status(200).json({ message: `${foodItem.name} added to cart successfully!`, cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// View cart and calculate total amount based on item price and quantity
// In your backend (Node.js/Express)

app.post('/ViewCart', async (req, res) => {
  const userId = req.body.userId; // Get the userId from the request body

  try {
    // Fetch cart items for the specific user
    const cartItems = await Cart.find({ userId });

    if (!cartItems.length) {
      return res.status(200).json({ message: 'Cart is empty', totalAmount: 0, cartItems: [] });
    }

    // Calculate total amount based on price * quantity for each item
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    res.status(200).json({ cartItems, totalAmount });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});



// Add item to wishlist with foodId
// Ensure that the foodId is being added when you add items to wishlist
const addToWishlist = (item) => {
  const newItem = {
    foodId: item._id, // Correctly set foodId using item's _id
    name: item.name,
    price: item.price,
    image: item.image,
  };

  console.log('Adding item with foodId:', newItem.foodId); // Debugging to confirm the correct ID

  const updatedWishlist = [...wishlist, newItem];
  setWishlist(updatedWishlist);
  localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

  console.log('Wishlist after adding item:', updatedWishlist); // Check updated wishlist
};


//  to delete an food by name
app.put('/deletefood/:name', async (req, res) => {
    try {
        const foodName = req.params.name;
        const { quantityToRemove } = req.body;
  
        // Find the food item by name
        const foodItem = await foodModel.findOne({ name: foodName });
  
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
  
        // Update the quantity
        foodItem.quantity += quantityToRemove;
  
        // If quantity reaches zero, you can choose to delete the item or keep it with zero quantity
        if (foodItem.quantity === 0) {
            await foodItem.delete();
            return res.status(200).json({ message: 'Food item deleted as quantity reached zero' });
        }
  
        await foodItem.save();
  
        res.status(200).json({ message: 'Quantity updated successfully', foodItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  });
  
   //USER
app.post("/userSignUp",async(req,res)=>{

  let input = req.body
  let hashedPassword = await generateHashedPassword(input.password)
  console.log(hashedPassword)

  input.password = hashedPassword     
  let user = new userModel(input)
  user.save()
  console.log(user)

  res.json({"status":"success"})
})


app.post("/userSignIn", (req, res) => {
  let input = req.body
   userModel.find({"email":req.body.email}).then(
      (response)=>{
         if (response.length>0) {
          let dbPassword=response[0].password
          console.log(dbPassword)
          bcrypt.compare(input.password,dbPassword,(error,isMath)=>{
              if (isMath) {
                 jwt.sign({email:input.email},"hostefood-app",{expiresIn:"1d"},(error,token)=>{
                  if(error){
                      res.json({"status":"unable to create token"})
                  }else{
                      res.json({"status":"success","userid":response[0]._id,"token":token})
                  }
                 })
              } else {
                  
                  res.json("incorrect password")
              }
          })
         } else {

          res.json({"status":"user not found"})

         }
      }
  ).catch()

})

// Assuming you are using Express
app.get('/userProfile/:email', async (req, res) => {
    const email = req.params.email;

    try {
        // Replace this with your actual logic to find the user by email
        const user = await userModel.findOne({ email: email }); // Assuming you have a User model

        if (user) {
            // Exclude sensitive information
            const { password, ...userProfile } = user.toObject();
            res.json(userProfile);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//user feedback//

// Feedback submission route
app.post('/submitFeedback', async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newFeedback = new feedbackModel({
            email,
            message
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//admin feedbackview//

// Route to get all feedbacks
app.get('/getFeedbacks', async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find();
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching feedbacks' });
    }
});

// Route to delete a feedback by ID
app.delete('/deleteFeedback/:email', async (req, res) => {
    try {
        const { email } = req.params;
        await feedbackModel.findByIdAndDelete(email);
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting feedback' });
    }
});
//admin view the user list//

 // Assuming you have a user model

// Route to get all users
app.get('/getAllUsers', async (req, res) => {
    try {
        const users = await userModel.find(); // Fetch all users from the database
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});


app.get('/foodItem/:id', async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.json(foodItem);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving food item", error });
    }
});



//----------------------------ORDER STORE---------------------------------------------
// Function to confirm order and store it in the database
// routes/orderRoutes.js

// Route to create a new order

// Route to get orders for a specific user
app.get('/:userId', async (req, res) => {
    try {
      const orders = await orderModel.find({ userId: req.params.userId }).populate('items.foodId');
      if (orders.length > 0) {
        res.status(200).json(orders);
      } else {
        res.status(404).json({ message: 'No orders found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders', error });
    }
  });

  app.post('/quantityUpdate', async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    if (!userId || !itemId || !quantity) {
        return res.status(400).json({ message: 'User ID, item ID, and quantity are required.' });
    }

    try {
        // Find the item by its ID
        const foodItem = await foodModel.findById(itemId);

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found.' });
        }

        // Check if the requested quantity is available
        if (foodItem.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity available.' });
        }

        // Subtract the quantity from the current stock
        foodItem.quantity -= quantity;

        // Save the updated item
        await foodItem.save();

        res.json({ message: 'Quantity updated successfully', updatedItem: foodItem });
    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: 'An error occurred while updating the quantity.' });
    }
});


// SaveCart API - Save a user's cart items to the database
app.post('/SaveCart', async (req, res) => {
    const { userId, items } = req.body;
    console.log("Received request to save cart:", req.body);

    // Validate input
    if (!userId || !items || items.length === 0) {
        console.error("Validation failed: Missing userId or items");
        return res.status(400).json({ status: 'error', message: 'User ID and cart items are required' });
    }

    try {
        // Delete existing cart items for the user
        await Cart.deleteMany({ userId });

        // Map the items to the cart schema
        const cartItems = items.map((item) => ({
            userId: userId,
            foodId: mongoose.Types.ObjectId.isValid(item.foodId) 
                     ? mongoose.Types.ObjectId(item.foodId) 
                     : new mongoose.Types.ObjectId(), // Fallback to a new ObjectId if invalid
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));
        

        // Insert new cart items
        const savedItems = await Cart.insertMany(cartItems);
        console.log("Cart items saved:", savedItems);
        res.status(200).json({ status: 'success', message: 'Cart saved successfully', cartItems: savedItems });
    } catch (error) {
        console.error("Error saving cart:", error);
        res.status(500).json({ status: 'error', message: 'Failed to save cart' });
    }
});


app.put('/foodItems/decrementQuantities', async (req, res) => {
    const { updateData } = req.body;

    try {
        const updatePromises = updateData.map(async (item) => {
            // Decrement quantity based on foodId
            await Food.updateOne(
                { _id: item.foodId },
                { $inc: { quantity: -item.quantity } }
            );
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'Quantities decremented successfully' });
    } catch (error) {
        console.error("Error decrementing quantities:", error);
        res.status(500).json({ message: 'Error decrementing quantities' });
    }
});


app.put('/foodItems/decrementQuantities', async (req, res) => {
    const { updateData } = req.body; // Destructure updateData from the request body
    try {
        for (const item of updateData) {
            await Food.findByIdAndUpdate(item.foodId, {
                $inc: { quantity: -item.quantity } // Decrement quantity in the Food collection
            });
        }
        res.status(200).send('Quantities updated successfully');
    } catch (error) {
        console.error('Error updating quantities:', error);
        res.status(500).send('Error updating quantities');
    }
});


// ADMIN order history//
app.get('/userpayments', async (req, res) => {
    const { userId } = req.query; // Ensure the userId is passed as a query parameter
  
    try {
        const payments = await orderModel.find({ userId })
            .populate('product')
           // Populate the product details
            .exec(); // Execute the query
  
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error fetching payments.' });
    }
  });

// Route to move all cart items to the order history
app.post('/checkout', async (req, res) => {
    const { userId } = req.body; // Get userId from the request body

    try {
        // Find all cart items for the user
        const cartItems = await Cart.find({ userId });
        
        if (!cartItems.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate the total amount
        const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Create a new order
        const newOrder = new orderModel({
            userId,
            items: cartItems.map(item => ({
                foodId: item.foodId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount,
            orderDate: new Date()
        });

        // Save the order
        await newOrder.save();

        // Clear the cart for the user
        await Cart.deleteMany({ userId });

        res.status(200).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// Route to view all orders for a specific user in the order history
app.get('/orderHistory/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch all orders for the specified user
        const orders = await orderModel.find({ userId })
            .populate({
                path: 'items.foodId',
                select: 'name price', // Only populate name and price fields of each food item
            })
            .exec();

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ message: 'Failed to retrieve order history' });
    }
});




app.listen(8080,()=>{
    console.log("server started")
})