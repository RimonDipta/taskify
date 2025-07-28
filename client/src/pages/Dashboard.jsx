import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { sidebarOpenIcon, sidebarCloseIcon, plusIcon } from "../assets/icons";

function Dashboard() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setshowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("Please enter a task title");

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/tasks/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:5000/api/tasks", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ title: "", description: "" });
      setEditId(null);
      fetchTasks();
    } catch (error) {
      console.error("Task submit failed", error);
    }
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description });
    setEditId(task._id);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedTasks = reorder(
      tasks,
      result.source.index,
      result.destination.index
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background-light shadow-md p-4 flex flex-col justify-between transition-transform duration-300 z-5 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-blue-600">Taskify</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-10 py-1 px-2 hover:bg-hover-gray rounded"
          >
            <img src={sidebarCloseIcon} alt="sidebarClozseIcon" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-hover-gray w-full text-left py-2 px-2 rounded"
          >
            Dashboard
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded mt-4"
        >
          Logout
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 flex justify-center items-center transition-all duration-300 ${
          sidebarOpen ? "ml-64" : ""
        }`}
      >
        <div className="w-full max-w-md px-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 left-4 hover:bg-hover-gray w-10 py-1 px-2"
            >
              <img src={sidebarOpenIcon} alt="sidebar_open" />
            </button>
          )}

          {showEditModal && (
            <div className="fixed inset-0 bg-background-light/70 flex justify-center items-center z-50">
              <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Task Title"
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Task Description (Optional)"
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setForm({ title: "", description: "" });
                        setEditId(null);
                      }}
                      className="bg-gray-400 text-white py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4 text-center">
            Welcome to your Dashboard
          </h2>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasklist">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="group bg-background flex justify-between items-start border-b border-white/20 py-4"
                        >
                          <div>
                            <h2 className="font-semibold">{task.title}</h2>
                            {task.description && (
                              <p className="text-white-light text-sm whitespace-pre-wrap break-words">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-sm text-blue-500 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="text-sm text-red-500 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {!showForm && (
            <button
              onClick={() => setshowForm(true)}
              className="group mt-10 cursor-pointer flex gap-2 items-center"
            >
              {" "}
              <img
                src={plusIcon}
                alt="plusIcon"
                className="w-7 group-hover:bg-oxford-blue rounded-full p-1"
              />{" "}
              Add Task{" "}
            </button>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-background shadow-md p-4 rounded-md mt-4"
            >
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <textarea
                name="description"
                placeholder="Task Description (Optional)"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded"
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded"
                >
                  {editId ? "Update Task" : "Add Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setshowForm(false);
                    setForm({ title: "", description: "" });
                    setEditId(null);
                  }}
                  className="bg-gray-400 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
