const { AuthenticationError, UserInputError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const config = require("./utils/config");

const { PubSub } = require("graphql-subscriptions");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate("author");
      if (!(args.author || args.genre)) {
        return books;
      }

      let returnedBooks = books;
      if (args.author) {
        returnedBooks = books.filter((book) => book.author === args.author);
      }

      if (args.genre) {
        returnedBooks = returnedBooks.filter((book) =>
          book.genres.includes(args.genre)
        );
      }
      return returnedBooks;
    },
    allAuthors: async () => Author.find({}),
    allUsers: async () => User.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const author = await Author.findOne({ name: args.author });
      const newBook = new Book({ ...args });
      if (author) {
        newBook.author = author._id;
      } else {
        const newAuthor = new Author({ name: args.author });
        try {
          const savedAuthor = await newAuthor.save();
          newBook.author = savedAuthor._id;
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      try {
        const savedBook = await newBook.save();
        const populatedBook = await savedBook.populate("author");

        const bookAuthor = await Author.findById(savedBook.author);
        if (bookAuthor) {
          bookAuthor.books = bookAuthor.books.concat(savedBook);
          await bookAuthor.save();
        }

        pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });
        return populatedBook;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      return Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      ).catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },

    createUser: async (root, args) => {
      const user = new User({ ...args });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, config.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
