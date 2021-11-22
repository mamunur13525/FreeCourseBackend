const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const uuid = require("uuid");
require("dotenv").config();

const { ObjectId } = require("mongodb");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_HOST}:${process.env.DB_PASS}@cluster0.k2oj4.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;

console.log({ uri });
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ImageKit = require("imagekit");
const imagekit = new ImageKit({
  urlEndpoint: "https://ik.imagekit.io/b1lhvbzf99x",
  publicKey: "public_JQOkLhqzy//NdqgGFHaosM8IWeA=",
  privateKey: "private_GmmXgMu2M7RM9Km2zNOOWVXVPY4=",
});

app.use(cors());
app.use(bodyParser.json());

client.connect((err) => {
  console.log("mongodb connected");
  const adminCollection = client.db("Free_course_data").collection("admin");
  const courseCollection = client.db("Free_course_data").collection("courses");
  const categoryCollectino = client
    .db("Free_course_data")
    .collection("category");
  //Admin add
  app.post("/admin-login", (req, res) => {
    let { email, password } = req.body;
    adminCollection.find({ email: email }).toArray((err, documents) => {
      if (JSON.stringify(documents) !== "[]") {
        let [findObject] = documents;
        if (findObject.password === password) {
          res.send({
            status: "success",
            message: "Welcome Boss ❤❤",
            info: { email: findObject.email },
          });
        } else {
          res.send({ status: "failed", message: "Password Not Match!" });
        }
      } else {
        res.send({ status: "failed", message: "Email Not Found!" });
      }
    });
  });
  //Create Admin
  app.post("/add-admin", (req, res) => {
    const register = req.body;
    adminCollection.insertOne(register).then((result) => {
      res.send(result);
    });
  });
  //Create Admin
  app.post("/add-category", (req, res) => {
    const register = req.body;
    categoryCollectino
      .find({ category: register.category })
      .toArray((err, documents) => {
        if (documents.length) {
          res.send(false);
        } else {
          categoryCollectino.insertOne(register).then((result) => {
            if (result.insertedCount > 0) {
              res.send(true);
            } else {
              res.send(false);
            }
          });
        }
      });
  });
  //Create Admin
  app.delete("/delete-category/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    categoryCollectino.deleteOne({ _id: ObjectId(id) }, function (err, result) {
      if (result.deletedCount > 0) {
        res.send({ status: true, message: "Successfully Delete One" });
      } else {
        res.send({ status: false, message: err });
      }
    });
  });
  //Create Admin
  app.get("/all-category", (req, res) => {
    categoryCollectino.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // All Admin
  app.get("/admin_", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // Get Specific COures
  app.get("/one_course/:id", (req, res) => {
    let courseId = req.params.id;

    courseCollection
      .find({ _id: ObjectId(courseId) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  //Course Create
  app.post("/add-course", (req, res) => {
    const register = req.body;

    try {
      courseCollection.insertOne(register).then((result) => {
        console.log({ result });
        if (result.acknowledged) {
          res.send({ status: true });
        }
      });
    } catch (e) {
      res.send({ status: false, message: err });
    }
  });

  //Course Upadte FOr COmments
  app.patch("/comment-approve/:id", (req, res) => {
    const courseId = req.params.id;
    const indexComment = req.body.index;
    const statusFromBody = req.body.status;
    const targetComment = `comments.${indexComment}.approve`;

    courseCollection.updateOne(
      { _id: ObjectId(courseId) },
      { $set: { [targetComment]: statusFromBody } },
      function (err, documents) {
        if (err === null) {
          res.send({ status: "success", message: "Comment Show in UI." });
        } else {
          res.send({ status: "failed", message: "Comment Approve Failed." });
        }
      }
    );
  });

  //Course Upadte FOr COmments
  app.post("/update-course/:id", (req, res) => {
    const courseId = req.params.id;
    const newComment = { ...req.body, commentId: uuid.v4() };
    courseCollection
      .update(
        { _id: ObjectId(courseId) },
        {
          $push: {
            comments: newComment,
          },
        }
      )
      .then(() => {
        res.send({ status: true, message: "Added Commnet." });
      })
      .catch((err) => {
        res.send({ status: false, message: err });
      });
  });
  //DeLETE COURSE BY Admin
  app.delete("/delete_course/:id", (req, res) => {
    const id = req.params.id;
    courseCollection.deleteOne({ _id: ObjectId(id) }, function (err, result) {
      if (result.deletedCount > 0) {
        res.send({ status: true, message: "Successfully Delete One" });
      } else {
        res.send({ status: false, message: err });
      }
    });
  });
  //Get ALl Course
  app.get("/all-course", (req, res) => {
    courseCollection.find({}).toArray((err, documents) => {
      res.send({ result: documents });
    });
  });
});
app.get("/", (req, res) => {
  res.send(
    "Hello world It's working. This URL is working Fine. don't hajitaed nothing."
  );
});
app.get("/auth", function (req, res) {
  var result = imagekit.getAuthenticationParameters();
  res.send(result);
});
app.listen(process.env.PORT || port, () =>
  console.log(`Server running ${process.env.PORT || port}`)
);
