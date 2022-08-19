const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const { createServer } = require("http");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("./models/user");
const config = require("./utils/config");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

console.log("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("MongoDB connection error: ", error.message);
  });

const start = async () => {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  // Hand in the schema we just created and have the WebSocketServer start listening
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith("bearer")) {
        const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/",
  });

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};

// call the function that does the setup and starts the server
start();
