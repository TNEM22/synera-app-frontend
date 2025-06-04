import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

import { setProjectTasks } from '../../../store/slices/projectSlice';
import { SERVER_URL } from '../../../Constants';

const EditTask = ({
  mainTitle,
  closeModal,
}: {
  mainTitle?: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const taskColId = useAppSelector((state) => state.modal.taskColId);
  const taskState = useAppSelector((state) => state.modal.taskState) as {
    id: string;
    title: string;
    note: string;
    milestones: string[];
    completedMilestones?: string[];
    assignedDate: string;
    status?: string;
  } | null;
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as Array<{ id: string; title: string; complete_task: boolean }>;

  const tasks = useAppSelector((state) => state.project.projectTasks) as Record<
    string,
    Record<string, { id: string }[]>
  >;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subTasks, setSubTasks] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [status, setStatus] = useState('');
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  useEffect(() => {
    if (!taskState) return;
    setTitle(taskState.title);
    setDesc(taskState.note);
    setSubTasks(taskState.milestones.join(','));
    setSelectDate(taskState.assignedDate.split('T')[0]);
    setStatus(taskState.status || taskColId || '');
    setCompletedMilestones(taskState.completedMilestones || []);
  }, [taskState, taskColId]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !desc.trim() ||
      !subTasks.trim() ||
      !selectDate.trim() ||
      !taskState ||
      !status
    )
      return;

    const url = `${SERVER_URL}/api/v1/projects/task`;
    toast.promise(
      axios
        .patch(
          url,
          {
            id: taskState.id,
            title: title,
            desc: desc,
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
          if (status !== taskColId) {
            moveTaskToNewStatus(taskState.id, taskColId as string, status, {
              id: taskState.id,
              title: title,
              note: desc,
              milestones: subTasks.split(','),
              completedMilestones: completedMilestones,
              assignedDate: selectDate,
              status: status,
            });
          } else {
            // Just update the task in the current column
            editTask(taskState.id, taskColId as string, {
              title: title,
              note: desc,
              milestones: subTasks.split(','),
              completedMilestones: completedMilestones,
              assignedDate: selectDate,
            });
          }
          closeModal();
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Updating tasks...',
        success: 'Tasks updated!',
        error: 'Cannot update tasks!',
      }
    );
  };

  const editTask = (taskId: string, colId: string, updatedFields: unknown) => {
    if (!selectedProject) return;
    const columnTasks = tasks[selectedProject][colId];
    const updatedTasks = columnTasks.map((task) =>
      task.id === taskId ? { ...task, ...(updatedFields || {}) } : task
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
    updatedTask: unknown
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
  };

  // Calculate progress percentage for milestones
  const milestoneArray = taskState?.milestones || [];
  const progressPercentage =
    milestoneArray.length > 0
      ? Math.round((completedMilestones.length / milestoneArray.length) * 100)
      : 0;

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="hidden">{mainTitle}</div>
      <div className="max-h-[70vh] p-4 overflow-y-auto">
        <label htmlFor="title" className="block text-lg font-medium mb-1">
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
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label htmlFor="desc" className="block text-lg font-medium mb-1 mt-4">
          Task Description
        </label>
        <motion.textarea
          name="desc"
          id="desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Set your task description..."
          required
          whileFocus={{ scale: 1.02 }}
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label htmlFor="status" className="block text-lg font-medium mb-1 mt-4">
          Task Status
        </label>
        <motion.select
          name="status"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          whileFocus={{ scale: 1.02 }}
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
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

        <label
          htmlFor="subtasks"
          className="block text-lg font-medium mb-1 mt-4"
        >
          Sub Tasks&nbsp;
          <span className="text-sm text-blue-300">
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
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Progress bar for subtasks */}
        {taskState &&
          taskState.milestones &&
          taskState.milestones.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </h3>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {completedMilestones.length}/{taskState.milestones.length}{' '}
                  subtasks ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

        {/* Subtask checkboxes */}
        {taskState &&
          taskState.milestones &&
          taskState.milestones.length > 0 && (
            <div className="mt-3 mb-4 ml-1">
              <div className="space-y-1">
                {taskState.milestones.map((subtask, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`subtask-${index}`}
                      checked={completedMilestones.includes(subtask)}
                      onChange={() => toggleSubtaskCompletion(subtask)}
                      className="h-4 w-4 text-green-500 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor={`subtask-${index}`}
                      className={`ml-2 text-sm ${
                        completedMilestones.includes(subtask)
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {subtask}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        <label htmlFor="date" className="block text-lg font-medium mb-1 mt-4">
          Completion date
        </label>
        <motion.input
          type="date"
          name="date"
          id="date"
          value={selectDate}
          onChange={(e) => setSelectDate(e.target.value)}
          placeholder="Type your project title..."
          required
          whileFocus={{ scale: 1.02 }}
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg"
        >
          Submit
        </motion.button>
      </div>
    </motion.form>
  );
};

export default EditTask;
