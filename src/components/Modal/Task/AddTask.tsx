import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { useSelector, useDispatch } from "react-redux";
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

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

const AddTask = ({
  mainTitle,
  closeModal,
}: {
  mainTitle?: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const taskColId = useAppSelector((state) => state.modal.taskColId);
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const projects = useAppSelector(
    (state) => state.project.features['PROJECTS']
  ) as Record<string, { id: string }>;
  const tasks = useAppSelector((state) => state.project.projectTasks);
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as Array<{ id: string; title: string; complete_task: boolean }>;

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subTasks, setSubTasks] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [status, setStatus] = useState(taskColId || '');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !note.trim() ||
      !subTasks.trim() ||
      !selectDate.trim() ||
      !selectedProject ||
      !status
    )
      return;

    const url = `${SERVER_URL}/api/v1/projects/task`;
    toast.promise(
      axios
        .post(
          url,
          {
            projectId: projects[selectedProject].id,
            title: title,
            note: note,
            milestones: subTasks.split(','),
            completedMilestones: [],
            assignedDate: selectDate,
            comments: [],
            pinned: [],
            collaborators: [],
            status: status,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        .then((response) => {
          const dd = response.data;
          const task: Task = {
            id: dd.data._id,
            title: title,
            note: note,
            milestones: subTasks.split(','),
            completedMilestones: [],
            assignedDate: selectDate,
            comments: [],
            pinned: [],
            collaborators: [],
            status: status,
          };
          if (status) {
            addTask(status, task);
          }
          closeModal();
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Creating tasks...',
        success: 'Tasks created!',
        error: 'Cannot create tasks!',
      }
    );
  };

  const addTask = (colId: string, task: unknown) => {
    // console.log("Adding task to column:", colId, task, tasks);
    if (!selectedProject) return;
    const projectTasks = tasks as Record<string, Record<string, unknown[]>>;
    const newTasks = {
      ...projectTasks,
      [selectedProject]: {
        ...(projectTasks[selectedProject] || {}),
        [colId]: [...(projectTasks[selectedProject][colId] || []), task],
      },
    };
    dispatch(setProjectTasks(newTasks));
  };

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="hidden">{mainTitle}</div>
      <div>
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
        <label htmlFor="note" className="block text-lg font-medium mb-1">
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
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label htmlFor="status" className="block text-lg font-medium mb-1">
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
        <label htmlFor="subtasks" className="block text-lg font-medium mb-1">
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
        <label htmlFor="date" className="block text-lg font-medium mb-1">
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

export default AddTask;
