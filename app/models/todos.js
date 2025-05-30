import { client, ObjectId } from "../.server/mongo";

let db = client.db("todos");
let collection = db.collection("todos");

export async function createTodoItem(item) {
  return collection.insertOne(item);
}

export async function getTodoItems() {
  return collection.find().toArray();
}

export async function toggleIscompleted(id) {
  return collection.updateOne({ _id: ObjectId.createFromHexString(id) }, [
    {
      $set: {
        isComplete: {
          $cond: {
            if: "$isComplete",
            then: false,
            else: true,
          },
        },
      },
    },
  ]);
}
