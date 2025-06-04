import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { useAppSelector } from '../../../../store/hooks';
// import { useEffect } from 'react';

Chart.register(...registerables, ChartDataLabels);

const BarGraphBox = ({
  title,
  labels,
  barValues,
}: {
  title: string;
  labels: string[];
  barValues: number[];
}) => {
  const isDarkMode = useAppSelector((state) => state.navigation.theme);

  //   useEffect(() => console.log(barValues), [barValues]);

  return (
    <div className='max-h-[350px] max-w-[600px] flex-1 py-1 px-3 rounded-md flex flex-col justify-between border dark:border-[#ffffff21] dark:bg-[#24262C]'>
      <h1 className='text-xl'>{title}</h1>
      <Bar
        data={{
          //   labels: ['Todo', 'In Progress', 'Completed'],
          labels: labels,
          datasets: [
            {
              //   data: [0, 2, 1],
              data: barValues,
              backgroundColor: 'rgba(75, 192, 192, 1)',
              borderRadius: 4,
              barThickness: 40,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
              labels: { color: isDarkMode === 'dark' ? 'white' : 'black' },
            },
            datalabels: {
              display: true,
              color: isDarkMode === 'dark' ? 'white' : 'black',
              anchor: 'end',
              align: 'top',
              offset: 0,
              font: {
                weight: 'bold',
                size: 14,
              },
              formatter: (value) => value,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
                // color:
                //   isDarkMode === 'dark'
                //     ? 'rgba(255, 255, 255, 0.1)'
                //     : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color:
                  isDarkMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(0, 0, 0, 0.7)',
                font: { size: 16 },
              },
              border: {
                display: false,
              },
            },
            y: {
              grid: {
                color:
                  isDarkMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
              },
              border: { display: false },
              ticks: {
                color:
                  isDarkMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(0, 0, 0, 0.7)',
                stepSize: 1,
                precision: 0,
                font: { size: 11 },
              },
              beginAtZero: true,
              //   max: 4,
              //   min: 4,
            },
          },
          layout: {
            padding: {
              top: 20,
              bottom: 20,
              left: 10,
              right: 10,
            },
          },
        }}
      />
    </div>
  );
};

export default BarGraphBox;
