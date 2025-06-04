import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
// import { useSelector, useDispatch } from 'react-redux';

import {
  setTaskColId,
  setTaskState,
  setIsModalOpen,
  setModalName,
} from '../../../store/slices/modalSlice';
import { setProjectTasks } from '../../../store/slices/projectSlice';

import Column from './Column';
import { SERVER_URL } from '../../../Constants';

type ProjectTask = {
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

type TASKSColumn = {
  _id: string;
  id: string;
  title: string;
  count: number;
  isActive: boolean;
  complete_task: boolean;
};

const DragnDrop = () => {
  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const tasks = useAppSelector((state) => state.project.projectTasks);
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as TASKSColumn[];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [droppingItem, setDroppingItem] = useState<ProjectTask | null>({
    id: '',
  });
  const [currentContainer, setCurrentContainer] =
    useState<HTMLDivElement | null>(null);

  const openTaskModal = (type: string) => {
    dispatch(setIsModalOpen(true));
    dispatch(setModalName(`${type}-task`));
  };

  const handleAddTask = (colId: string) => {
    dispatch(setTaskColId(colId));
    openTaskModal('add');
  };

  const handleEditTask = (colId: string, task: ProjectTask) => {
    dispatch(setTaskColId(colId));
    dispatch(setTaskState(task));
    openTaskModal('edit');
  };

  const handleDeleteTask = (colId: string, taskId: string) => {
    const url = `${SERVER_URL}/api/v1/projects/task`;

    toast.promise(
      axios
        .delete(url, {
          data: {
            id: taskId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        .then(() => {
          deleteTask(taskId, colId);
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Deleting task...',
        success: 'Task deleted!',
        error: 'Cannot delete task!',
      }
    );
  };

  const deleteTask = (taskId: string, colId: string) => {
    const newTasks = {
      ...tasks,
      [selectedProject as string]: {
        ...tasks[selectedProject as string],
        [colId]: tasks[selectedProject as string][colId].filter(
          (task) => (task as ProjectTask).id !== taskId
        ),
      },
    };
    dispatch(setProjectTasks(newTasks));
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    colId: string,
    idx: number
  ) => {
    e.preventDefault();
    (e.target as HTMLElement).innerText = 'Drag your task here...';
    if (!droppingItem) return;

    const foundColumn = columns.find((col) => col.id === colId);
    // const statusTitle = foundColumn?.title?.toLowerCase() || 'Unknown';
    // Update task status
    changeTaskStatus(colId, (droppingItem as ProjectTask).id);

    // console.log("tasks", tasks);
    // Delete the task
    const newTasksAfterDelete = {
      ...tasks,
      [selectedProject as string]: {
        ...tasks[selectedProject as string],
        [droppingItem.status as string]: tasks[selectedProject as string][
          (droppingItem.status as string) || 'todo'
        ].filter((task) => (task as ProjectTask).id !== droppingItem.id),
      },
    };
    // console.log(columns.find((col) => col.id === colId).title.toLowerCase());
    // Prepare the task to be added
    const updatedDroppingItem = {
      ...droppingItem,
      status: colId,
      ...(foundColumn?.complete_task === true && {
        completedMilestones: droppingItem.milestones,
      }),
    };

    // Add the task to the new column
    const columnTasks = [
      ...newTasksAfterDelete[selectedProject as string][colId],
    ];
    if (idx === -1) {
      columnTasks.push(updatedDroppingItem);
    } else {
      columnTasks.splice(idx, 0, updatedDroppingItem);
    }

    const newTasksAfterAdd = {
      ...newTasksAfterDelete,
      [selectedProject as string]: {
        ...newTasksAfterDelete[selectedProject as string],
        [colId]: columnTasks,
      },
    };

    // Dispatch the final state update
    dispatch(setProjectTasks(newTasksAfterAdd));

    // Reset drag/drop state
    if (currentContainer !== null) {
      currentContainer.style.zIndex = '1';
    }
    setCurrentContainer(null);
    setDroppingItem(null);
  };

  const changeTaskStatus = (newStatus: string, taskId: string) => {
    const url = `${SERVER_URL}/api/v1/projects/task/status`;
    axios
      .patch(
        url,
        { id: taskId, status: newStatus, projectId: selectedProject },
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      )
      .then((response) => {
        const dd = response.data;
        if (dd.status === 'error') {
          toast.error('Cannot update task!');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-1 flex overflow-auto mx-5 my-3 gap-4 font-semibold whitespace-nowrap"
    >
      {tasks &&
        columns.map((column) => {
          const key = column.id;

          return (
            <Column
              key={key}
              colId={key}
              tasks={tasks?.[selectedProject as string]?.[key] as ProjectTask[]}
              addTask={handleAddTask}
              handleDrop={handleDrop}
              containerRef={containerRef}
              deleteTask={handleDeleteTask}
              handleEditTask={handleEditTask}
              title={column?.title as string}
              setDroppingItem={setDroppingItem}
              itemsLen={tasks?.[selectedProject as string]?.[key]?.length}
              setCurrentContainer={setCurrentContainer}
            />
          );
        })}
    </motion.div>
  );
};

export default DragnDrop;
