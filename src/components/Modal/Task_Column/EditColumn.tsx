import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowUp as ArrowUp,
  FaArrowDown as ArrowDown,
} from 'react-icons/fa6';
import { FaRegTrashAlt as Trash2 } from 'react-icons/fa';
// import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
// import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

import {
  setTasks,
  setProjects,
  setProjectTasks,
} from '../../../store/slices/projectSlice';

import { SERVER_URL } from '../../../Constants';

type Column = {
  _id?: string;
  id: string;
  title: string;
  count: number;
  complete_task: boolean;
  isActive: boolean;
};

type Task = {
  _id?: string;
  id: string;
  title: string;
  note: string;
  milestones: string[];
  completedMilestones: string[];
  assignedDate: string;
  comments: string[];
  pinned: boolean;
  collaborators: string[];
  status: string;
};

const EditColumn = ({
  mainTitle,
  closeModal,
}: {
  mainTitle?: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as Column[];
  const projectTasks = useAppSelector((state) => state.project.projectTasks);
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  ) as string;
  const projects = useAppSelector((state) => state.project.features.PROJECTS);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    if (!tasks) return;
    const newColumns = tasks.map(
      (col): Column => ({
        _id: col._id,
        id: String(col._id),
        title: col.title,
        count: col.count,
        complete_task: col.complete_task,
        isActive: false,
      })
    );
    setColumns(newColumns);
  }, [tasks]);

  const handleTitleChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].title = value;
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        id: uuidv4(),
        title: '',
        count: 0,
        complete_task: false,
        isActive: false,
      },
    ]);
  };

  const deleteColumn = (index: number) => {
    if (columns.length <= 3) return;
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const moveColumnUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns];
    [newColumns[index - 1], newColumns[index]] = [
      newColumns[index],
      newColumns[index - 1],
    ];
    setColumns(newColumns);
  };

  const moveColumnDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newColumns = [...columns];
    [newColumns[index + 1], newColumns[index]] = [
      newColumns[index],
      newColumns[index + 1],
    ];
    setColumns(newColumns);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("Columns to submit:", columns);

    const url = `${SERVER_URL}/api/v1/projects/`;
    toast.promise(
      axios
        .patch(
          url,
          { id: selectedProject, columns: columns },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        .then(async (response) => {
          const dd = response.data;
          if (dd.status === 'error') {
            throw new Error();
          } else {
            // console.log(dd.data);
            const newColumns = dd.data.columns.reduce(
              (acc: Column[], col: Column) => {
                acc.push({
                  _id: col._id,
                  id: String(col._id),
                  title: col.title,
                  count: 0,
                  complete_task: col.complete_task,
                  isActive: false,
                });
                return acc;
              },
              []
            );
            // console.log(newColumns);

            // dispatch(setTasks(newColumns));
            await reloadProjectTasks(newColumns);
            closeModal();
          }
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Updating project...',
        success: 'Project updated!',
        error: 'Cannot update project!',
      }
    );
  };

  const reloadProjectTasks = async (newColumns: Column[]) => {
    const url = `${SERVER_URL}/api/v1/projects/${selectedProject}/task`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
      },
    });

    const dd = response.data;
    const newProjectTasks = newColumns.reduce(
      (acc: Record<string, unknown[]>, col: Column) => {
        acc[col.id] = [];
        return acc;
      },
      {}
    );

    // interface TasksStructure {
    //   [projectId: string]: {
    //     [columnId: string]: Task[];
    //   };
    // }
    // const newTasks: TasksStructure = {
    //   ...(tasks || []),
    //   [String(selectedProject)]: newProjectTasks,
    // };

    const newTasks = {
      ...projectTasks,
      [String(selectedProject)]: newProjectTasks,
    };

    dd.data.forEach((item: Task) => {
      newTasks[String(selectedProject)][String(item.status)].push({
        id: String(item._id),
        title: item.title,
        note: item.note,
        milestones: item.milestones,
        completedMilestones: item.completedMilestones,
        assignedDate: item.assignedDate,
        comments: item.comments,
        pinned: item.pinned,
        collaborators: item.collaborators,
        status: item.status,
      });
    });

    dispatch(setProjectTasks(newTasks));
    // console.log('New Columns:', newColumns);
    dispatch(setTasks(newColumns));
    dispatch(
      setProjects({
        ...projects,
        [selectedProject]: {
          ...(projects[selectedProject] || {}),
          columns: newColumns,
        },
      })
    );
  };

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className='space-y-6'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className='hidden'>{mainTitle}</div>
      <motion.div layout className='space-y-4'>
        <AnimatePresence>
          {columns &&
            columns.map((col, index) => (
              <motion.div
                key={col.id}
                layout
                className='flex items-center space-x-2'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type='text'
                  value={col.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  placeholder={`Column ${index + 1} title...`}
                  required
                  className='w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500'
                />
                {/* Arrows button */}
                <motion.button
                  type='button'
                  whileHover={{ scale: index === 0 ? 1 : 1.2 }}
                  disabled={index === 0}
                  onClick={() => moveColumnUp(index)}
                  className={`p-1 rounded ${
                    index === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <ArrowUp size={20} />
                </motion.button>
                <motion.button
                  type='button'
                  whileHover={{ scale: index === columns.length - 1 ? 1 : 1.2 }}
                  disabled={index === columns.length - 1}
                  onClick={() => moveColumnDown(index)}
                  className={`p-1 rounded ${
                    index === columns.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <ArrowDown size={20} />
                </motion.button>

                {/* Delete button */}
                <motion.button
                  type='button'
                  whileHover={{ scale: columns.length > 3 ? 1.2 : 1 }}
                  disabled={columns.length <= 3 || col.complete_task === true}
                  onClick={() => deleteColumn(index)}
                  className={`p-1 rounded ${
                    columns.length <= 3 || col.complete_task === true
                      ? 'opacity-30 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <Trash2 size={20} />
                </motion.button>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      <div className='flex justify-between'>
        <motion.button
          type='button'
          onClick={addColumn}
          whileHover={{ scale: 1.1 }}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg'
        >
          Add Column
        </motion.button>
      </div>

      <div className='flex justify-end space-x-4'>
        <motion.button
          type='button'
          onClick={() => closeModal()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg'
        >
          Cancel
        </motion.button>
        <motion.button
          type='submit'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg'
        >
          Save
        </motion.button>
      </div>
    </motion.form>
  );
};

export default EditColumn;
