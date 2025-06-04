import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { setSelectedView } from '../../store/slices/operationSlice';
import { setProjectTasks, setTasks } from '../../store/slices/projectSlice';
import { SERVER_URL } from '../../Constants';

import SubHeader from './SubHeader';
import BoardView from './BoardView/BoardView';
import ListView from './ListView/ListView';
import DashboardView from './DashboardView/DashboardView';

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

const Workspace = () => {
  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  //   const [selectedView, setSelectedView] = useState("Board");
  const selectedView = useAppSelector(
    (state) => state.operation.selectedView
  ) as 'Board' | 'List' | 'Dashboard';

  const tasks = useAppSelector((state) => state.project.projectTasks);
  const projects = useAppSelector(
    (state) => state.project.features['PROJECTS']
  ) as Record<string, { id: string }>;
  const columns = useAppSelector(
    (state) => state.project.features['TASKS']
  ) as TASKSColumn[];

  // Tasks initialization
  useEffect(() => {
    if (!selectedProject || selectedProject === 'undefined') return;
    if (tasks[selectedProject]) return;
    const id = projects[selectedProject].id;
    const url = `${SERVER_URL}/api/v1/projects/${id}/task`;
    toast.promise(
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        })
        .then((response) => {
          const dd = response.data;
          // Complete this...
          const newProjectTasks = (columns as Array<ProjectTask>).reduce<
            Record<string, ProjectTask[]>
          >((acc, col) => {
            acc[col.id] = [];
            return acc;
          }, {});

          const newTasks = {
            ...tasks,
            [selectedProject]: newProjectTasks,
          };
          dd.data.forEach((item: ProjectTask) => {
            newTasks[selectedProject][String(item.status)].push({
              id: item._id as string,
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
        })
        .catch((err) => {
          console.error(err);
        }),
      {
        pending: 'Loading tasks...',
        success: 'Tasks loaded!',
        error: 'Cannot load tasks!',
      }
    );
  }, [selectedProject, dispatch]);

  // Keep adjusting the numbers in MenuBar
  useEffect(() => {
    if (!selectedProject || !tasks || !tasks[selectedProject]) return;
    const currTasks = tasks[selectedProject];
    const newColumns = columns.map((col) => ({
      ...(col || {}),
      count: currTasks[col.id]?.length || 0,
    }));

    dispatch(setTasks(newColumns));
  }, [tasks, selectedProject]);

  return (
    <div
      className="flex flex-1 flex-col h-full min-h-0"
      style={{ width: window.innerWidth - 314 - 90 }}
    >
      {selectedProject !== null ? (
        <>
          <SubHeader
            selectedView={selectedView}
            setBoardView={() => dispatch(setSelectedView('Board'))}
            setListView={() => dispatch(setSelectedView('List'))}
            setDashboardView={() => dispatch(setSelectedView('Dashboard'))}
          />
          {selectedView === 'Board' && <BoardView />}
          {selectedView === 'List' && <ListView />}
          {selectedView === 'Dashboard' && <DashboardView />}
        </>
      ) : (
        <div className="text-4xl flex flex-1 justify-center items-center text-[#222327] dark:text-white">
          <motion.h1
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-3xl font-extrabold mb-4"
          >
            No Project selected.
          </motion.h1>
        </div>
      )}
    </div>
  );
};

export default Workspace;
