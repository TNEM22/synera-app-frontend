import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../../store/hooks';

import NumberBox from './widgets/NumberBox';
import BarGraphBox from './widgets/BarGraphBox';
import DoughnutGraphBox from './widgets/DoughnutGraphBox';

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

const DashboardView = () => {
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const tasks = useAppSelector((state) => state.project.projectTasks) as Record<
    string,
    Record<string, Task[]>
  >;
  const projects = useAppSelector(
    (state) => state.project.features.PROJECTS
  ) as Record<string, { columns: { _id: string; title: string }[] }>;
  const projectCols = useAppSelector((state) => state.project.features.TASKS);
  //   const columns = useAppSelector((state) => state.project.features.TASKS);

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [incompleteTasks, setIncompleteTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  const [labels, setLabels] = useState<string[]>([]);
  const [barValues, setBarValues] = useState<number[]>([]);

  useEffect(() => {
    // console.log('columns:', columns);
    // (columns as { id: string; title: string }[]).forEach((col) =>
    //   console.log(`Column ID: ${col.id}, Title: ${col.title}`)
    //   );

    // console.log('Selected Project:', selectedProject);
    // console.log('Tasks:', tasks);
    let tasksCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    if (!selectedProject) return;
    Object.keys(tasks[selectedProject] || {}).forEach((colId) => {
      tasks[selectedProject][colId].forEach((task: Task) => {
        // console.log(`Task ID: ${task.id}, Title: ${task.title}`);
        if (task.milestones?.length === task.completedMilestones?.length)
          completedCount++;
        // console.log(task.assignedDate, new Date().toISOString());
        // if (task.assignedDate)
        //   console.log(task.assignedDate < new Date().toISOString());
        if (
          task.assignedDate &&
          task.assignedDate < new Date().toISOString().split('T')[0]
        )
          overdueCount++;
        tasksCount++;
      });
    });

    setTotalTasks(tasksCount);
    setCompletedTasks(completedCount);
    setIncompleteTasks(tasksCount - completedCount);
    setOverdueTasks(overdueCount);
    // console.log('Selected Project:', projects[selectedProject]?.columns);
    // setColumns(projects[selectedProject]?.columns || []);
    setLabels(projects[selectedProject]?.columns.map((col) => col.title) || []);
    // console.log('ProjectCols:', projectCols);
    // console.log((projectCols as { count: number }[]).map((col) => col.count));
    setBarValues((projectCols as { count: number }[]).map((col) => col.count));
  }, [selectedProject, tasks, projects, projectCols]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className='flex-1 flex flex-col overflow-auto mx-5 my-3 gap-4 whitespace-nowrap'
    >
      <div className='w-full flex gap-4'>
        <NumberBox title='Completed tasks' value={completedTasks} />
        <NumberBox title='Incomplete tasks' value={incompleteTasks} />
        <NumberBox title='Overdue tasks' value={overdueTasks} />
        <NumberBox title='Total tasks' value={totalTasks} />
      </div>
      <div className='w-full flex flex-1 gap-4'>
        <BarGraphBox
          title='Total Tasks'
          labels={labels}
          barValues={barValues}
        />
        <DoughnutGraphBox
          title='Task completion status'
          completedTasks={completedTasks}
          incompleteTasks={incompleteTasks}
        />
      </div>
    </motion.div>
  );
};

export default DashboardView;
