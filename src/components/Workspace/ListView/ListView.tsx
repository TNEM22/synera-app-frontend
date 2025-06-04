import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

import {
  setTaskColId,
  setIsModalOpen,
  setModalName,
} from '../../../store/slices/modalSlice';

import Card from './Card';
import TaskView from './TaskView';

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

const ListView = () => {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const tasks = useAppSelector((state) => state.project.projectTasks) as Record<
    string,
    Record<string, Task[]>
  >;
  const [selectedTaskId, setSelectedTaskId] = useState<{
    id: string;
    colId: string;
  } | null>(null);
  //   console.log('Tasks;', tasks);
  //   const columns = useAppSelector((state) => state.project.features['TASKS']);

  useEffect(() => setSelectedTaskId(null), [selectedProject]);

  const openTaskModal = (type: string) => {
    dispatch(setIsModalOpen(true));
    dispatch(setModalName(`${type}-task`));
  };

  const handleAddTask = () => {
    dispatch(setTaskColId(null));
    openTaskModal('add');
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-1 overflow-auto mx-5 my-3 font-semibold whitespace-nowrap"
    >
      <div className="flex-1/3 flex flex-col overflow-y-auto dark:bg-[#17191d]">
        {/* Header */}
        <div className="flex p-4 justify-between w-full h-fit dark:bg-[#24262C]">
          <span>(0) Tasks</span>
          <span
            className="flex items-center cursor-pointer text-[#1C1D2280] dark:text-white"
            onClick={() => handleAddTask()}
          >
            <h1 className="px-2 w-[20px] h-[20px] text-lg font-bold rounded-full leading-[1] flex justify-center bg-[#1C1D2214] text-[#1c1d225b] dark:bg-[#FFFFFF14] dark:text-[#ffffff69]">
              +
            </h1>
            &nbsp; Add new task
          </span>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex flex-col p-3 gap-3">
          {tasks[selectedProject as string] &&
            Object.keys(tasks[selectedProject as string]).map((key) =>
              tasks[selectedProject as string][key as string].map((item) => (
                <Card
                  key={item.id}
                  task={item}
                  setSelectedTaskId={() =>
                    setSelectedTaskId({
                      id: item.id,
                      colId: item.status as string,
                    })
                  }
                />
              ))
            )}
        </div>
      </div>
      <div className="flex-1/2 max-w-[40vw] dark:bg-[#24262C]">
        {selectedTaskId ? (
          <TaskView
            taskIds={selectedTaskId}
            setSelectedTaskId={() => setSelectedTaskId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl font-extrabold">
            No Task Selected
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ListView;
