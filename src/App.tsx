"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Trash2, Plus } from 'lucide-react'

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [filter, setFilter] = useState("all"); // all, active, completed
    const [loading, setLoading] = useState(false);

    // Зареждане на задачите при стартиране
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/tasks");
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    // Добавяне на задача
    const addTask = async () => {
        if (!newTask.trim()) return;

        try {
            const response = await fetch("http://localhost:8080/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTask,
                    completed: false
                })
            });

            if (response.ok) {
                const createdTask = await response.json();
                setTasks([createdTask, ...tasks]);
                setNewTask("");
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    // Изтриване на задача
    const deleteTask = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    // Актуализиране на задача
    const updateTask = async (id, completed) => {
        try {
            const response = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !completed })
            });

            if (response.ok) {
                setTasks(tasks.map(t =>
                    t.id === id ? { ...t, completed: !completed } : t
                ));
            }
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    // Филтриране на задачи
    const filteredTasks = tasks.filter(task => {
        if (filter === "active") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    // Статистика
    const stats = {
        total: tasks.length,
        active: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">TaskMaster Pro</h1>
                    <p className="text-gray-600">Организирай задачите си ефективно</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-sm text-gray-500">Общо задачи</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                        <div className="text-sm text-gray-500">Активни</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-sm text-gray-500">Завършени</div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {/* Add Task Form */}
                    <div className="mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Добави нова задача..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            />
                            <button
                                onClick={addTask}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Добави
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-200">
                        {[
                            { value: "all", label: "Всички" },
                            { value: "active", label: "Активни" },
                            { value: "completed", label: "Завършени" }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`px-4 py-2 font-medium transition ${
                                    filter === tab.value
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Зареждане...</div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎉</div>
                                <p className="text-gray-400 text-lg">
                                    {filter === "completed"
                                        ? "Няма завършени задачи"
                                        : filter === "active"
                                            ? "Няма активни задачи"
                                            : "Няма задачи. Добави нова!"}
                                </p>
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`group flex items-center gap-3 p-4 rounded-lg border transition hover:shadow-md ${
                                        task.completed
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-white border-gray-200 hover:border-blue-300"
                                    }`}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => updateTask(task.id, task.completed)}
                                        className="flex-shrink-0"
                                    >
                                        {task.completed ? (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-300 hover:text-blue-500 transition" />
                                        )}
                                    </button>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium ${
                                            task.completed
                                                ? "line-through text-gray-400"
                                                : "text-gray-800"
                                        }`}>
                                            {task.title}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Info */}
                    {filteredTasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                            Показани {filteredTasks.length} от {tasks.length} задачи
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;