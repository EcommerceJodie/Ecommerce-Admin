import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ProductRevenue } from '../../services/api/product-revenue.service';

// Đăng ký các components cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  products: ProductRevenue[];
  title?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ products, title = 'Biểu đồ doanh thu sản phẩm' }) => {
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: []
  });
  
  const [chartOptions, setChartOptions] = useState<ChartOptions<'bar'>>({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
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
        }
      }
    }
  });
  
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Tạo dữ liệu cho biểu đồ
    const data = {
      labels: products.map(product => product.productName),
      datasets: [
        {
          label: 'Doanh thu',
          data: products.map(product => product.totalRevenue),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Số lượng bán',
          data: products.map(product => product.totalQuantitySold),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          yAxisID: 'quantityAxis'
        }
      ],
    };
    
    // Cập nhật tùy chọn biểu đồ
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
  }, [products]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
};

export default RevenueChart; 