import React from "react";
import ReactDOM from "react-dom/client";
import { setContext } from "@apollo/client/link/context";

import { getMainDefinition } from "@apollo/client/utilities";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
} from "@apollo/client";
import App from "./App";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("user-token");
  console.log("token when authenticating", token);
  return {
    headers: {
      ...headers,
      Authorization: token ? `bearer ${token}` : null,
    },
  };
});

const httpLink = new HttpLink({ uri: "http://localhost:4000" });
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000",
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
