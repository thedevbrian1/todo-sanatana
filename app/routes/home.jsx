import { Form, useNavigation, useSubmit } from "react-router";
import { validateText } from "../.server/validation";
import {
  createTodoItem,
  getTodoItems,
  toggleIscompleted,
} from "../models/todos";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  let result = await getTodoItems();
  let todos = result.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));
  return todos;
}

export async function action({ request }) {
  let formData = await request.formData();
  let action = formData.get("_action");

  console.log({ action });

  // Determine which form was submitted

  switch (action) {
    case "create-item": {
      // Validation
      let newTodo = formData.get("new-todo");

      let fieldError = {
        newTodo: validateText(newTodo),
      };

      if (Object.values(fieldError).some(Boolean)) {
        return { fieldError };
      }
      // Add to the db

      let todoObj = {
        text: newTodo,
        isComplete: false,
      };

      let result = await createTodoItem(todoObj);
      console.log({ result });

      break;
    }
    case "update-item": {
      let itemId = formData.get("todo-item-id");
      console.log({ itemId });

      await toggleIscompleted(itemId);
      break;
    }
  }

  return null;
}

export default function Home({ actionData, loaderData }) {
  let submit = useSubmit();
  let navigation = useNavigation();

  let isSubmitting = navigation.state !== "idle";

  // TODO: Clear form after submission
  return (
    <main className="max-w-2xl mx-auto mt-36">
      <h1 className="font-bold uppercase text-4xl">Todos</h1>
      <Form method="post" className="mt-8">
        <input type="hidden" name="_action" value="create-item" />
        <input
          type="text"
          name="new-todo"
          placeholder="Create a new todo"
          aria-label="new todo item"
          className={`bg-[#25273c] w-full p-4 rounded-lg placeholder:text-gray-500 ${
            actionData?.fieldError ? "border border-red-500" : ""
          }`}
        />
        {actionData?.fieldError ? (
          <p className="text-red-500 mt-2">{actionData.fieldError.newTodo}</p>
        ) : null}
      </Form>

      <ul
        className={`bg-[#25273c] mt-8 p-4 rounded-lg space-y-4 ${
          isSubmitting ? "opacity-50" : ""
        }`}
      >
        {loaderData.length === 0 ? (
          <p>No items yet</p>
        ) : (
          loaderData.map((item) => (
            <li key={item._id}>
              <Form
                method="post"
                // action="/update"
                className="flex gap-3"
                onChange={(event) => {
                  submit(event.currentTarget);
                }}
              >
                <input type="hidden" name="_action" value="update-item" />
                <input type="hidden" name="todo-item-id" value={item._id} />
                <input
                  type="checkbox"
                  name="complete"
                  id={`complete-${item._id}`}
                  defaultChecked={item.isComplete}
                />
                <label
                  htmlFor={`complete-${item._id}`}
                  className={`${
                    item.isComplete ? "line-through text-gray-500" : ""
                  }`}
                >
                  {item.text}
                </label>
              </Form>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
