const express = require('express');
const authRouter = require('./routres/authRoutes');
const connectDB = require("./config/db");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-user.json');
const cookieParser = require('cookie-parser');
const videoRoute = require("./routres/videoRoutes")
const subscriptionRoute = require("./routres/subscriptionRoutes")
const PlaylistRoute = require("./routres/playlistRoutes")
const tweetRoute = require("./routres/tweetRoutes");
const commentRoute = require("./routres/commentRoutes")
const likeRoute = require("./routres/likeRoutes")

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({limit:"16kb"}));
app.use(cookieParser());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database Connection
connectDB();

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/subscriptions", subscriptionRoute);
app.use("/api/v1/playlists", PlaylistRoute);
app.use("/api/v1/tweets", tweetRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/likes", likeRoute);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
