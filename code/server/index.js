const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

require('./models/User');
require('./models/Order');
require('./models/Video');
require('./models/Warehouse');

app.use(cors());
app.use(bodyParser.json());
app.use(
    cookieSession({
        maxAge: 30*24*60*60*1000,
        keys: ["p9q8wrghuasgf98a34yhfauisd"]
    })
);


require('./routes/orderRoutes')(app);

const uri = "mongodb+srv://user123:UwHUrc1iI87dMAIN@cluster0.rerpk.mongodb.net/videoco?retryWrites=true&w=majority";


mongoose.connect(uri,
    { useNewUrlParser: true, useFindAndModify: false},
    () => console.log('Connected to DB.')
    );

if(process.env.NODE_ENV === 'production') {
    //Express will serve up production assets like main.js
    app.use(express.static('client/build'));

    //Express will serve up index.html if it doesn't recognize route
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}
app.use('/user',require('./routes/users.js'));
app.use('/access',require('./routes/access.js'));
app.use('/video', require('./routes/videos.js'));
app.use('/warehouse', require('./routes/warehouseRoutes.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
