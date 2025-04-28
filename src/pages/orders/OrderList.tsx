import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Tooltip,
  Divider,
  Spin,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UndoOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Order, OrderFilterParams, OrderStatus, SortByOption, getOrderStatusName } from '../../models/Order';
import { ordersApiService } from '../../services/api/orders.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filters, setFilters] = useState<OrderFilterParams>({
    pageNumber: Number(searchParams.get('pageNumber')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 10,
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
    status: searchParams.get('status') || undefined,
    searchTerm: searchParams.get('searchTerm') || undefined,
    sortBy: searchParams.get('sortBy') || 'CreatedAt',
    isDescending: searchParams.get('isDescending') !== 'false',
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch orders when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await ordersApiService.getOrders(filters);
        setOrders(response.orders);
        setTotalItems(response.totalCount);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        message.error('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);

  }, [filters, setSearchParams]);

  // Handlers
  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize
    }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value === 'All' ? undefined : value,
      pageNumber: 1,
    }));
  };

  const handleSortByChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: value,
      pageNumber: 1,
    }));
  };

  const handleSortDirectionChange = () => {
    setFilters(prev => ({
      ...prev,
      isDescending: !prev.isDescending,
      pageNumber: 1,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
      pageNumber: 1,
    }));
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setFilters(prev => ({
      ...prev,
      fromDate: dateStrings[0] ? dateStrings[0] : undefined,
      toDate: dateStrings[1] ? dateStrings[1] : undefined,
      pageNumber: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'CreatedAt',
      isDescending: true,
    });
  };

  const handleViewOrder = (orderId: string) => {
    // Chuyển đến trang chi tiết đơn hàng
    navigate(`/orders/${orderId}`);
  };

  // Helper function to get status tag color
  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case OrderStatus.Pending:
        return 'warning';
      case OrderStatus.Processing:
        return 'processing';
      case OrderStatus.Shipped:
        return 'blue';
      case OrderStatus.Delivered:
        return 'success';
      case OrderStatus.Cancelled:
        return 'error';
      case OrderStatus.Returned:
        return 'default';
      case OrderStatus.Refunded:
        return 'purple';
      default:
        return 'default';
    }
  };

  // Format date to local format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text: number) => formatCurrency(text),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>
          {getOrderStatusName(status)}
        </Tag>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Order) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={4}>Danh sách đơn hàng</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, mã đơn hàng..."
              prefix={<SearchOutlined />}
              value={filters.searchTerm || ''}
              onChange={handleSearchChange}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status || 'All'}
              onChange={handleStatusChange}
            >
              <Option value="All">Tất cả</Option>
              {Object.entries(OrderStatus)
                .filter(([key]) => isNaN(Number(key))) // Lọc ra chỉ các key là tên
                .map(([key, value]) => (
                <Option key={value} value={value.toString()}>
                  {getOrderStatusName(value as number)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Sắp xếp theo"
              style={{ width: '100%' }}
              value={filters.sortBy || 'CreatedAt'}
              onChange={handleSortByChange}
            >
              <Option value={SortByOption.CreatedAt}>Ngày tạo</Option>
              <Option value={SortByOption.OrderNumber}>Mã đơn hàng</Option>
              <Option value={SortByOption.CustomerName}>Tên khách hàng</Option>
              <Option value={SortByOption.TotalAmount}>Tổng tiền</Option>
            </Select>
          </Col>
          <Col xs={8} md={3}>
            <Button
              icon={filters.isDescending ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={handleSortDirectionChange}
            >
              {filters.isDescending ? "Giảm dần" : "Tăng dần"}
            </Button>
          </Col>
          <Col xs={8} md={2}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Lọc
            </Button>
          </Col>
          <Col xs={8} md={3}>
            <Button
              icon={<UndoOutlined />}
              onClick={handleResetFilters}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        {showFilters && (
          <>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  format="YYYY-MM-DD"
                  value={[
                    filters.fromDate ? dayjs(filters.fromDate) : null,
                    filters.toDate ? dayjs(filters.toDate) : null
                  ]}
                  onChange={handleDateRangeChange}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
            onChange: handlePageChange,
            pageSizeOptions: ['5', '10', '25', '50'],
          }}
        />
      </Card>
    </div>
  );
};

export default OrderList; 