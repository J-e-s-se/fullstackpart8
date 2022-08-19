import { GET_USER, GET_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const Recommend = ({ show }) => {
  const userResult = useQuery(GET_USER);
  const result = useQuery(GET_BOOKS);

  const books = result.data ? result.data.allBooks : null;
  console.log("The value of books in Recommend", books);
  const user = userResult.data ? userResult.data.me : null;
  console.log("user", user);

  const getFilteredBooks = (selectedGenre) => {
    console.log("selectedGenre", selectedGenre);
    if (!selectedGenre) {
      return [];
    } else {
      return books.filter((book) => book.genres.includes(selectedGenre));
    }
  };

  if (!show) {
    return null;
  }

  if (!user || !books) {
    return null;
  }

  return (
    <div>
      <h1>recommendations</h1>
      <p>
        books in your favourite genre <strong>{user.favouriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {getFilteredBooks(user.favouriteGenre).map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
