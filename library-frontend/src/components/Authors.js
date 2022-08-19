import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";
import { GET_AUTHORS, UPDATE_AUTHOR } from "../queries";

const Authors = (props) => {
  const result = useQuery(GET_AUTHORS);

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
  });

  const [selectedName, setSelectedName] = useState("");
  const [born, setBorn] = useState("");

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>Loading ...</div>;
  }

  if (result.error) {
    console.log(result.error);
    return <div>Error: {result.error.message}</div>;
  }

  const authors = result.data.allAuthors;
  const options = authors.map((author) => {
    return { value: author.name, label: author.name };
  });
  const submitAuthorUpdate = (event) => {
    event.preventDefault();
    updateAuthor({
      variables: { name: selectedName.value, born: Number(born) },
    });
    setSelectedName("");
    setBorn("");
  };
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submitAuthorUpdate}>
        <Select
          defaultValue={selectedName}
          onChange={setSelectedName}
          options={options}
        />
        <div>
          born
          <input
            name="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button>update author</button>
      </form>
    </div>
  );
};

export default Authors;
