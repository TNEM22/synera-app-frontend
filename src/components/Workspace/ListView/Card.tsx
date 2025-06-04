import { motion } from 'framer-motion';
import { useAppSelector } from '../../../store/hooks';

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

const Card = ({
  task,
  setSelectedTaskId,
}: {
  task: Task;
  setSelectedTaskId: () => void;
}) => {
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as Array<{ id: string; title: string; complete_task: boolean }>;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        duration: 0.4,
        scale: { type: 'spring', visualDuration: 0.4, bounce: 0.0 },
      }}
      className="w-full p-3 rounded bg-white dark:bg-[#292B31] cursor-pointer"
      onClick={setSelectedTaskId}
    >
      {/* Header */}
      <div>
        <div className="w-full flex justify-between">
          <h1 className="font-bold dark:text-white">{task.title}</h1>
          <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
            {columns.find((col) => col.id === task.status)?.title || 'Unknown'}
          </span>
        </div>
        <h3 className="font-normal text-[15px] text-[#1C1D2280] dark:text-[#FFFFFF80] text-wrap line-clamp-3">
          {task.note}
        </h3>
      </div>
      {/* Progress */}
      <div>
        <div className="flex justify-between">
          <div className="flex items-center text-[#1C1D2280] dark:text-[#FFFFFF80]">
            <ProgressIcon />
            &nbsp;Progress
          </div>
          <div className="dark:text-white">
            {task.completedMilestones?.length}/{task.milestones?.length}
          </div>
        </div>
        <div className="h-[4px] w-full rounded-lg mt-2 bg-[#1C1D2214] dark:bg-[#FFFFFF1A]">
          <div
            className={
              task.milestones?.length != task.completedMilestones?.length
                ? 'h-full w-[3%] bg-[#FFA048] rounded-lg'
                : 'h-full w-[3%] bg-[#78D700] rounded-lg'
            }
            style={{
              width:
                ((task.completedMilestones?.length || 0) /
                  (task.milestones?.length || 1) || 0.03) *
                  100 +
                '%',
            }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const ProgressIcon = () => {
  const theme = useAppSelector((state) => state.navigation.theme);
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* <!-- First bullet and line --> */}
      <rect
        x="2"
        y="3"
        width="3"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />
      <rect
        x="7"
        y="3"
        width="11"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />

      {/* <!-- Second bullet and line --> */}
      <rect
        x="2"
        y="7"
        width="3"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />
      <rect
        x="7"
        y="7"
        width="11"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />

      {/* <!-- Third bullet and line --> */}
      <rect
        x="2"
        y="11"
        width="3"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />
      <rect
        x="7"
        y="11"
        width="11"
        height="2"
        rx="1"
        fill={theme === 'dark' ? '#FFFFFF80' : '#1C1D2280'}
      />
    </svg>
  );
};

export default Card;
