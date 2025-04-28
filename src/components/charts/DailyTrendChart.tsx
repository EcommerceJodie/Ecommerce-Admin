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
  TimeScale,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { vi } from 'date-fns/locale';
import { DailyRevenue } from '../../services/api/product-revenue.service';

// Đăng ký các components cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface DailyTrendChartProps {
  dailyRevenue: DailyRevenue[];
  startDate: Date;
  endDate: Date;
  title?: string;
}

interface DataPoint {
  x: Date;
  y: number;
}

const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ 
  dailyRevenue, 
  startDate, 
  endDate, 
  title = 'Doanh thu theo ngày'
}) => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    datasets: []
  });
  
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
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
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd/MM/yyyy',
          displayFormats: {
            day: 'dd/MM'
          }
        },
        adapters: {
          date: {
            locale: vi
          }
        },
        title: {
          display: true,
          text: 'Ngày'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value as number);
          }
        }
      }
    },
    elements: {
      point: {
        radius: 0, // Loại bỏ các điểm trên đường line
        hitRadius: 10, // Vẫn giữ vùng tương tác khi di chuột qua
        hoverRadius: 5, // Hiển thị điểm khi hover
      },
      line: {
        tension: 0, // Đặt thành 0 để có đường thẳng (không cong)
      }
    }
  });
  
  useEffect(() => {
    if (!dailyRevenue || dailyRevenue.length === 0) return;
    
    // Tạo mảng các ngày từ startDate đến endDate
    const dateRange: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Chuyển đổi mảng dailyRevenue thành đối tượng để dễ tra cứu
    const revenueMap: Record<string, DailyRevenue> = {};
    dailyRevenue.forEach(item => {
      const date = new Date(item.date);
      const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      revenueMap[dateKey] = item;
    });
    
    // Tạo dữ liệu cho biểu đồ, bao gồm các ngày không có doanh thu (giá trị = 0)
    const revenueDataPoints: DataPoint[] = dateRange.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const revenue = revenueMap[dateKey]?.totalRevenue || 0;
      return { x: date, y: revenue };
    });
    
    const quantityDataPoints: DataPoint[] = dateRange.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const quantity = revenueMap[dateKey]?.quantitySold || 0;
      return { x: date, y: quantity };
    });
    
    const orderDataPoints: DataPoint[] = dateRange.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const orders = revenueMap[dateKey]?.orderCount || 0;
      return { x: date, y: orders };
    });
    
    setChartData({
      datasets: [
        {
          label: 'Doanh thu',
          data: revenueDataPoints,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 2,
          tension: 0, // Đường thẳng
          pointRadius: 0, // Không hiển thị điểm
          pointHoverRadius: 5,
          yAxisID: 'y'
        },
        {
          label: 'Số lượng bán',
          data: quantityDataPoints,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderWidth: 2,
          tension: 0, // Đường thẳng
          pointRadius: 0, // Không hiển thị điểm
          pointHoverRadius: 5,
          yAxisID: 'quantityAxis'
        },
        {
          label: 'Đơn hàng',
          data: orderDataPoints,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderWidth: 2,
          tension: 0, // Đường thẳng
          pointRadius: 0, // Không hiển thị điểm
          pointHoverRadius: 5,
          yAxisID: 'orderAxis',
          hidden: true // Ẩn mặc định
        }
      ]
    });
    
    setChartOptions(prev => ({
      ...prev,
      scales: {
        ...prev.scales,
        y: {
          ...prev.scales?.y,
          position: 'left' as const,
          beginAtZero: true
        },
        quantityAxis: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Số lượng'
          }
        },
        orderAxis: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Đơn hàng'
          }
        }
      }
    }));
  }, [dailyRevenue, startDate, endDate, title]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4" style={{ height: '500px' }}>
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default DailyTrendChart; 