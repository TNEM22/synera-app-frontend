import { useState, useRef, useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { useAppSelector } from '../../../store/hooks';
import { motion } from 'framer-motion';

import Card from './Card';

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

type ColumnProps = {
  colId: string;
  title: string;
  tasks: Task[];
  addTask: (colId: string) => void;
  itemsLen: number;
  deleteTask: (colId: string, taskId: string) => void;
  handleDrop: (
    e: React.DragEvent<HTMLDivElement>,
    colId: string,
    idx: number
  ) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleEditTask: (taskId: string, task: Task) => void;
  setDroppingItem: (item: Task) => void;
  setCurrentContainer: React.Dispatch<
    React.SetStateAction<HTMLDivElement | null>
  >;
};

const Column = ({
  colId,
  title,
  tasks,
  addTask,
  itemsLen,
  deleteTask,
  handleDrop,
  containerRef,
  handleEditTask,
  setDroppingItem,
  setCurrentContainer,
}: ColumnProps) => {
  const isFilterActive = useAppSelector(
    (state) => state.operation.isFilterActive
  );
  const isSortActive = useAppSelector((state) => state.operation.isSortActive);
  const sortType = useAppSelector((state) => state.operation.sortType);

  const [sortedTasks, setSortedTasks] = useState(tasks || []);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const colContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tasks) return;
    if (isSortActive === true && tasks.length > 0 && sortType !== null) {
      let sortedTasks;
      switch (sortType) {
        case 'A-Z':
          sortedTasks = [...tasks].sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
          });
          break;
        case 'Z-A':
          sortedTasks = [...tasks].sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleB.localeCompare(titleA);
          });
          break;
        case 'Date':
          sortedTasks = [...tasks].sort((a, b) => {
            const aDate = a.assignedDate
              ? new Date(a.assignedDate)
              : new Date(0);
            const bDate = b.assignedDate
              ? new Date(b.assignedDate)
              : new Date(0);
            return aDate.getTime() - bDate.getTime();
          });
          break;
        case 'Progress':
          sortedTasks = [...tasks].sort((a, b) => {
            const completedA = a.completedMilestones?.length || 0;
            const completedB = b.completedMilestones?.length || 0;
            return completedA - completedB;
          });
          break;
      }
      setSortedTasks(sortedTasks as Task[]);
    } else {
      setSortedTasks(tasks);
    }
  }, [tasks, isSortActive, sortType]);

  function handleDragStart(e: React.DragEvent<HTMLElement>, item: Task) {
    setCurrentContainer(colContainer.current);
    if (colContainer.current) colContainer.current.style.zIndex = '0';

    const target = e.target as HTMLElement;

    if (target.parentNode?.parentNode) {
      (target.parentNode.parentNode as HTMLElement).style.zIndex = '0';
    }
    setDroppingItem({ ...item });
    setIsDragging(true);
    target.style.cursor = 'pointer';

    const rect = target.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleDrag(e: React.DragEvent<HTMLElement>) {
    if (isDragging === false) return;
    const target = e.target as HTMLElement;

    target.style.position = 'fixed';
    target.style.cursor = 'pointer';

    // Prevent updating when the event has no coordinates (e.g., when the drag ends)
    if (e.clientX === 0 && e.clientY === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const threshold = 100;
    const y = e.clientY - position.y;
    const x = e.clientX - position.x;

    if (e.clientY > rect.top && e.clientY < rect.bottom)
      target.style.top = y + 'px';
    if (e.clientX > rect.left && e.clientX < rect.right)
      target.style.left = x + 'px';

    // Right edge check
    if (mouseX > rect.right - threshold) {
      container.scrollLeft += 10;
    }
    // Left edge check
    else if (mouseX < rect.left + threshold) {
      container.scrollLeft -= 10;
    }

    // Top edge check
    if (mouseY < rect.top + threshold) {
      container.scrollTop -= 10;
    }
    // Bottom edge check
    if (mouseY > rect.bottom - threshold) {
      container.scrollTop += 10;
    }
  }

  function handleDragEnd(e: React.DragEvent<HTMLElement>) {
    setCurrentContainer(null);
    const target = e.target as HTMLElement;
    if (colContainer.current) colContainer.current.style.zIndex = '1';
    if (target.parentNode?.parentNode) {
      (target.parentNode.parentNode as HTMLElement).style.zIndex = '1';
    }
    setIsDragging(false);
    target.style.position = 'relative';
    // target.style.backgroundColor = "white";
    target.style.top = 0 + 'px';
    target.style.left = 0 + 'px';
  }

  function handleDragEnter(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    (e.target as HTMLElement).innerText = '';
  }

  function handleDragLeave(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    (e.target as HTMLElement).innerText = 'Drag your task here...';
  }

  function handleDragOver(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  return (
    <motion.div
      id="task-status-column"
      ref={colContainer}
      style={{ zIndex: 1 }}
      className="min-w-[350px] max-w-[350px] min-h-fit flex-shrink-0 flex-1 rounded-lg p-4 border-3 border-dashed border-[#1C1D2214] dark:bg-[#24262C]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: 'spring', visualDuration: 0.4, bounce: 0.0 },
      }}
    >
      {/* Header */}
      <div className="w-full mb-4 flex justify-between select-none">
        <h1 className="text-[#1C1D2280] dark:text-[#FFFFFF80]">
          {title}&nbsp;({itemsLen || 0})
        </h1>
        <div
          className="flex items-center cursor-pointer text-[#1C1D2280] dark:text-white"
          onClick={() => addTask(colId)}
        >
          <h1 className="px-2 w-[20px] h-[20px] text-lg font-bold rounded-full leading-[1] flex justify-center bg-[#1C1D2214] text-[#1c1d225b] dark:bg-[#FFFFFF14] dark:text-[#ffffff69]">
            +
          </h1>
          &nbsp; Add new task
        </div>
      </div>
      {/* Body */}
      <div className="relative min-w-[313px] max-w-[313px] flex flex-col gap-2">
        {/* Card */}
        {sortedTasks &&
          sortedTasks.map((item, idx) => (
            <Card
              key={item.id + colId}
              handleDrag={handleDrag}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              item={item}
              idx={idx}
              colId={colId}
              handleEditTask={handleEditTask}
              deleteTask={deleteTask}
            />
          ))}

        {/* Drop Space */}
        {(sortedTasks === undefined || sortedTasks.length < 4) &&
          isFilterActive && (
            <div className="w-full mt-1 min-h-[178px] max-h-[178px] grid">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colId, -1)}
                onDragOver={handleDragOver}
                className="absolute w-full min-h-[178px] max-h-[178px] border-2 border-dashed rounded-lg flex justify-center items-center text-lg border-[#1C1D2214] text-[#1C1D2280] dark:border-[#FFFFFF1A] dark:text-[#FFFFFF80]"
              >
                Drag your task here...
              </div>
            </div>
          )}
      </div>
    </motion.div>
  );
};

export default Column;
