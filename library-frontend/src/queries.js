import { gql } from "@apollo/client";

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {
      name
      born
      bookCount
    }
    published
    genres
  }
`;

export const GET_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const GET_BOOKS_BY_GENRE = gql`
  query booksByGenre($genre: String!) {
    allBooks(genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const GET_BOOKS = gql`
  query {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
      bookCount
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const GET_USER = gql`
  query getUser {
    me {
      username
      favouriteGenre
      id
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
