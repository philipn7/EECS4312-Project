const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Order = mongoose.model('order');
const User = mongoose.model('User');
const verifyToken = require('../middlewares/verifyToken');

module.exports = app => {


    //Get all orders
    app.get('/api/orders', async (req, res) => {
        const orders = await Order.find({});

        res.send(orders);
    });

    // Create orders in Customer View ?
    app.post('/api/orders', verifyToken, async (req, res) => {
        const { videos, subtotal } = req.body;
        // const status = "preparing"
      
        const order = await new Order({
           user: req.userId,
           videos,
           subtotal,
           status
        });
        try{
            await order.save();
            res.send("order");
        } catch(err) {
            res.status(422).send(err);
        }
    });

    //Get users orders
    app.get('/api/orders/user', verifyToken, async (req, res) => {
        const orders = await Order.find({ user : req.userId, status: {$nin: ["cart"]}});
        res.send(orders);
    });

    //get active orders
//   Comment for now since haven't figured how to use verifyToken in Operator view
    app.get('/api/orders/user/active', verifyToken, async (req, res) => {
        const orders = await Order.find({ user : req.userId, status: {$nin: ["cart", "cancelled", "returned"]}});

        res.send(orders);
    });

    

    app.post('/api/orders/active', async (req, res) => {
        const { userId } = req.body;

        const orders = await Order.find({ user : userId, status: {$nin: ["cancelled", "returned"]}}).populate('videos');

        res.send(orders);
    });

    // Create orders in the Operator View (don't know how to use verifyToken)
    app.post('/api/orders/create', async (req, res) => {
        const { userId, cart, subtotal, loyalty_points_used } = req.body;

        const order = Order.create({
            user: userId,
            videos: cart,
            subtotal: subtotal,
            loyalty_points_used: loyalty_points_used
        });
    });

    //Get specific order by id
    app.get('/api/orders/:orderId', async (req, res) => {
        const order = await Order.findById(req.params.orderId);

        res.send(order);
    });

    //Update specific order by id
    app.post('/api/orders/update/:orderId', async (req, res) => {
        const order = await Order.findById(req.params.orderId);
        const { status } = req.body;
        order.status = status;
        try{
            await order.save();
            res.send(order);
        } catch(err) {
            res.status(422).send(err);
        }
    });

    app.post('/api/orders/cancel', async (req, res) => {
       const { orderId } = req.body;

       var errorMessage;
       Order.findByIdAndUpdate(orderId, {"status": "cancelled"}, function(err, result){
            if (err)
                errorMessage += err;
            User.findByIdAndUpdate(result.user, {"$inc": {"loyalty_points": result.loyalty_points_used}}, function(err1){
                if (err1)
                    res.status(404).send(errorMessage + " " + err1);
                else
                    res.send("Order Cancelation Completes");
            });
       });
    });
};