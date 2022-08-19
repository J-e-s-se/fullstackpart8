const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
    },
    born: {
      type: Number,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  {
    virtuals: {
      bookCount: {
        get() {
          return this.books.length;
        },
      },
    },
  }
);

module.exports = mongoose.model("Author", schema);
