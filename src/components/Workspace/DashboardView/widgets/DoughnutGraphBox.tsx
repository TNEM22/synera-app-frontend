import { Doughnut } from 'react-chartjs-2';
import { useAppSelector } from '../../../../store/hooks';

type Props = {
  title: string;
  incompleteTasks: number | string;
  completedTasks: number | string;
};

const DoughnutGraphBox = ({
  title,
  incompleteTasks,
  completedTasks,
}: Props) => {
  const isDarkMode = useAppSelector((state) => state.navigation.theme);

  return (
    <div className='max-h-[350px] max-w-[600px] flex-1 py-1 px-3 rounded-md flex flex-col border dark:border-[#ffffff21] dark:bg-[#24262C]'>
      <h1 className='text-xl'>{title}</h1>
      <div className='w-full max-h-[350px] flex items-center justify-center'>
        <Doughnut
          data={{
            labels: ['Incomplete', 'Completed'],
            datasets: [
              {
                data: [incompleteTasks, completedTasks],
                //   backgroundColor: 'rgba(75, 192, 192, 1)',
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
              legend: {
                position: 'right',
                align: 'center',
                labels: {
                  color: isDarkMode === 'dark' ? 'white' : 'black',
                  usePointStyle: true,
                  padding: 20,
                  font: { size: 14 },
                },
              },
              datalabels: {
                color: isDarkMode === 'dark' ? 'white' : 'black',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default DoughnutGraphBox;
