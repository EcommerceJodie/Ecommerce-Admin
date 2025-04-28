import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DailyRevenue } from '../../services/api/product-revenue.service';

// Đăng ký các components cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyRevenueChartProps {
  dailyRevenue: DailyRevenue[];
  productName: string;
}

const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ dailyRevenue, productName }) => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'>>({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Doanh thu theo ngày - ${productName}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value as number);
          }
        },
        title: {
          display: true,
          text: 'Doanh thu'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Ngày'
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 5,
      },
      line: {
        tension: 0,
      }
    }
  });
  
  useEffect(() => {
    if (!dailyRevenue || dailyRevenue.length === 0) return;
    
    // Format dates
    const formattedDates = dailyRevenue.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('vi-VN');
    });
    
    // Create chart data
    const data = {
      labels: formattedDates,
      datasets: [
        {
          label: 'Doanh thu',
          data: dailyRevenue.map(item => item.totalRevenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0,
          pointRadius: 0
        },
        {
          label: 'Số lượng bán',
          data: dailyRevenue.map(item => item.quantitySold),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          tension: 0,
          pointRadius: 0,
          yAxisID: 'quantityAxis'
        }
      ],
    };
    
    // Update chart options
    const options = {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        quantityAxis: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Số lượng'
          }
        }
      }
    };
    
    setChartData(data);
    setChartOptions(options);
  }, [dailyRevenue, productName]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default DailyRevenueChart; 