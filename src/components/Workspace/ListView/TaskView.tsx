import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { FaRegEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setProjectTasks } from '../../../store/slices/projectSlice';
import { SERVER_URL } from '../../../Constants';

type Task = {
  _id?: string;
  id: string;
  title?: string;
  note?: string;
  milestones?: string[];
  completedMilestones?: string[];
  assignedDate?: string;
  comments?: string[];
  pinned?: string[];
  collaborators?: string[];
  status?: string;
};

const TaskView = ({
  taskIds,
  setSelectedTaskId,
}: {
  taskIds: { id: string; colId: string };
  setSelectedTaskId: () => void;
}) => {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as Array<{ id: string; title: string; complete_task: boolean }>;
  const tasks = useAppSelector((state) => state.project.projectTasks) as Record<
    string,
    Record<string, Task[]>
  >;

  let task: Task | undefined = undefined;
  const projectTasks = useAppSelector(
    (state) => state.project.projectTasks[selectedProject as string]
  );

  if (projectTasks && projectTasks[taskIds.colId]) {
    task = (projectTasks[taskIds.colId] as Task[]).find(
      (t) => t.id === taskIds.id
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subTasks, setSubTasks] = useState('');
  const [status, setStatus] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  // Update state when task changes
  useEffect(() => {
    if (!task) return;
    setTitle(task.title || '');
    setNote(task.note || '');
    setSubTasks(task.milestones?.join(',') || '');
    setStatus(task.status || '');
    setSelectDate(task.assignedDate?.split('T')[0] || '');
    setCompletedMilestones(task.completedMilestones || []);
  }, [task]);

  if (!task) return null;

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !note.trim() ||
      !subTasks.trim() ||
      !selectDate.trim() ||
      !status ||
      !selectedProject
    )
      return;

    const url = `${SERVER_URL}/api/v1/projects/task`;
    toast.promise(
      axios
        .patch(
          url,
          {
            id: task.id,
            title: title,
            desc: note,
            milestones: subTasks.split(','),
            completedMilestones: completedMilestones,
            assignedDate: selectDate,
            status: status,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        .then(() => {
          // If status has changed, we need to move the task to a different column
          if (status !== taskIds.colId) {
            moveTaskToNewStatus(task.id, taskIds.colId, status, {
              id: task.id,
              title: title,
              note: note,
              milestones: subTasks.split(','),
              completedMilestones: completedMilestones,
              assignedDate: selectDate,
              comments: task.comments || [],
              pinned: task.pinned || [],
              collaborators: task.collaborators || [],
              status: status,
            });
          } else {
            // Just update the task in the current column
            editTask(task.id, taskIds.colId, {
              title: title,
              note: note,
              milestones: subTasks.split(','),
              completedMilestones: completedMilestones,
              assignedDate: selectDate,
            });
          }
          setIsEditing(false);
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Updating task...',
        success: 'Task updated!',
        error: 'Cannot update task!',
      }
    );
  };

  const handleCancelEdit = () => {
    // Reset form fields to original values
    if (!task) return;
    setTitle(task.title || '');
    setNote(task.note || '');
    setSubTasks(task.milestones?.join(',') || '');
    setStatus(task.status || '');
    setSelectDate(task.assignedDate?.split('T')[0] || '');
    setCompletedMilestones(task.completedMilestones || []);
    setIsEditing(false);
  };

  const editTask = (taskId: string, colId: string, updatedFields: unknown) => {
    if (!selectedProject) return;
    const columnTasks = tasks[selectedProject][colId];
    const updatedTasks = columnTasks.map((task) =>
      task.id === taskId ? { ...task, ...(updatedFields as object) } : task
    );

    const newTasks = {
      ...tasks,
      [selectedProject]: {
        ...tasks[selectedProject],
        [colId]: updatedTasks,
      },
    };

    dispatch(setProjectTasks(newTasks));
  };

  const moveTaskToNewStatus = (
    taskId: string,
    oldColId: string,
    newColId: string,
    updatedTask: Task
  ) => {
    if (!selectedProject) return;

    // Remove from old column
    const oldColumnTasks = tasks[selectedProject][oldColId].filter(
      (task) => task.id !== taskId
    );

    // Add to new column
    const newColumnTasks = [
      ...(tasks[selectedProject][newColId] || []),
      updatedTask,
    ];

    const newTasks = {
      ...tasks,
      [selectedProject]: {
        ...tasks[selectedProject],
        [oldColId]: oldColumnTasks,
        [newColId]: newColumnTasks,
      },
    };

    dispatch(setProjectTasks(newTasks));
    // Close the task view after moving
    setSelectedTaskId();
  };

  const toggleSubtaskCompletion = (subtask: string) => {
    const updatedCompletedMilestones = [...completedMilestones];

    if (updatedCompletedMilestones.includes(subtask)) {
      // Remove from completed
      const index = updatedCompletedMilestones.indexOf(subtask);
      updatedCompletedMilestones.splice(index, 1);
    } else {
      // Add to completed
      updatedCompletedMilestones.push(subtask);
    }

    setCompletedMilestones(updatedCompletedMilestones);

    if (!isEditing) {
      // Update in database immediately if not in edit mode
      const url = `${SERVER_URL}/api/v1/projects/task`;
      axios
        .patch(
          url,
          {
            id: task.id,
            completedMilestones: updatedCompletedMilestones,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        .then(() => {
          editTask(task.id, taskIds.colId, {
            completedMilestones: updatedCompletedMilestones,
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to update subtask');
        });
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    task.milestones && task.milestones.length > 0
      ? Math.round((completedMilestones.length / task.milestones.length) * 100)
      : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white dark:bg-[#24262C]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-100 dark:bg-[#17191d] border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <button
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          onClick={setSelectedTaskId}
        >
          <IoIosArrowRoundBack size={32} />
          &nbsp;Back
        </button>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FaTimes className="text-red-500" />
              </button>
              <button
                form="taskEditForm"
                type="submit"
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FaCheck className="text-green-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleEdit}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <FaRegEdit className="text-blue-500" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-grow">
        {isEditing ? (
          <motion.form
            id="taskEditForm"
            onSubmit={handleFormSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div>
              <label
                htmlFor="title"
                className="block text-lg font-medium mb-1 dark:text-gray-200"
              >
                Task Title
              </label>
              <motion.input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Type your task title..."
                required
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-lg font-medium mb-1 dark:text-gray-200"
              >
                Task Description
              </label>
              <motion.textarea
                name="note"
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Set your task description..."
                required
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-lg font-medium mb-1 dark:text-gray-200"
              >
                Task Status
              </label>
              <motion.select
                name="status"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              >
                <option value="">Select status</option>
                {columns &&
                  columns.length > 0 &&
                  columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
              </motion.select>
            </div>

            <div>
              <label
                htmlFor="subtasks"
                className="block text-lg font-medium mb-1 dark:text-gray-200"
              >
                Sub Tasks
                <span className="text-sm text-blue-300 ml-2">
                  (Separate subtasks by commas)
                </span>
              </label>
              <motion.input
                type="text"
                name="subtasks"
                id="subtasks"
                value={subTasks}
                onChange={(e) => setSubTasks(e.target.value)}
                placeholder="Define your subtasks..."
                required
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-lg font-medium mb-1 dark:text-gray-200"
              >
                Completion date
              </label>
              <motion.input
                type="date"
                name="date"
                id="date"
                value={selectDate}
                onChange={(e) => setSelectDate(e.target.value)}
                required
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
            </div>

            {task.milestones && task.milestones.length > 0 && (
              <div>
                <label className="block text-lg font-medium mb-2 dark:text-gray-200">
                  Subtask Progress
                </label>
                <div className="space-y-2 ml-2">
                  {task.milestones.map((subtask, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`subtask-${index}`}
                        checked={completedMilestones.includes(subtask)}
                        onChange={() => toggleSubtaskCompletion(subtask)}
                        className="h-5 w-5 text-green-500 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor={`subtask-${index}`}
                        className={`ml-2 dark:text-gray-200 ${
                          completedMilestones.includes(subtask)
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : ''
                        }`}
                      >
                        {subtask}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.form>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold dark:text-white">{task.title}</h1>
            <div className="px-3 py-2 overflow-x-auto bg-gray-100 dark:bg-gray-800 rounded-lg dark:text-gray-200">
              <p className="whitespace-pre-wrap">{task.note}</p>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </h3>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {completedMilestones.length}/{task.milestones?.length || 0}{' '}
                  subtasks ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Subtasks checklist */}
            {task.milestones && task.milestones.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2 dark:text-white">
                  Subtasks
                </h3>
                <div className="space-y-2 ml-2">
                  {task.milestones.map((subtask, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`view-subtask-${index}`}
                        checked={completedMilestones.includes(subtask)}
                        onChange={() => toggleSubtaskCompletion(subtask)}
                        className="h-5 w-5 text-green-500 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor={`view-subtask-${index}`}
                        className={`ml-2 dark:text-gray-200 ${
                          completedMilestones.includes(subtask)
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : ''
                        }`}
                      >
                        {subtask}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due date */}
            {task.assignedDate && (
              <div className="flex items-center mt-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Due date:{' '}
                </span>
                <span className="ml-2 dark:text-white">
                  {new Date(task.assignedDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Current status */}
            <div className="flex items-center mt-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Status:{' '}
              </span>
              <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
                {columns.find((col) => col.id === task.status)?.title ||
                  'Unknown'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TaskView;
