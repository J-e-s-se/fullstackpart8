import { useEffect, useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommend from "./components/Recommend";

import { BOOK_ADDED, GET_BOOKS } from "./queries";

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();
  const [page, setPage] = useState("authors");
  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage("books");
  };

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      console.log("subscriptionData", subscriptionData);
      window.alert(`A new Book '${addedBook.title}' added`);
      client.cache.updateQuery({ query: GET_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        };
      });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      setToken(token);
    }
  }, []);

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button
              onClick={() => {
                logout();
              }}
            >
              logout
            </button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>
      <Authors show={page === "authors"} />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} />
      <LoginForm
        show={page === "login"}
        setToken={setToken}
        goHome={() => setPage("books")}
      />

      <Recommend show={page === "recommend"} />
    </div>
  );
};

export default App;
