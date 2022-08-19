import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { useState } from "react";
import { GET_BOOKS, GET_BOOKS_BY_GENRE, BOOK_ADDED } from "../queries";
import _ from "lodash";

const Books = (props) => {
  const client = useApolloClient();
  const [selectedGenre, setSelectedGenre] = useState("");
  console.log("selectedGenre", selectedGenre);
  const result = useQuery(GET_BOOKS);
  const book_genre_result = useQuery(GET_BOOKS_BY_GENRE, {
    variables: { genre: selectedGenre },
  });
  const books_by_genre = book_genre_result.data
    ? book_genre_result.data.allBooks
    : null;

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      client.cache.updateQuery(
        { query: GET_BOOKS_BY_GENRE },
        ({ allBooks }) => {
          if (!selectedGenre) {
            return {
              allBooks: allBooks.concat(addedBook),
            };
          }
          if (addedBook.genres.includes(selectedGenre)) {
            return {
              allBooks: allBooks.concat(addedBook),
            };
          }
        }
      );
    },
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>Loading ...</div>;
  }

  if (result.error) {
    return <div>Error: {result.error.message}</div>;
  }

  const books = result.data.allBooks;
  const allGenres = _.union(books.map((book) => book.genres).flat());
  console.log("genres", allGenres);

  const getFilteredBooks = () => {
    if (!selectedGenre) {
      return books;
    } else {
      // return books.filter((book) => book.genres.includes(selectedGenre));
      return books_by_genre ? books_by_genre : [];
    }
  };

  console.log("books", books);
  console.log("filteredBooks", getFilteredBooks());
  return (
    <div>
      <h2>books</h2>
      {selectedGenre ? (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      ) : null}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {getFilteredBooks().map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {allGenres.map((genre) => (
        <button onClick={() => setSelectedGenre(genre)} key={genre}>
          {genre}
        </button>
      ))}
      <button onClick={() => setSelectedGenre("")}>all genres</button>
    </div>
  );
};

export default Books;
