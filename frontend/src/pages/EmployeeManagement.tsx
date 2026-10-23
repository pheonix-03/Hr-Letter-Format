// ============================================================
// Employee Management Page
// ============================================================
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Drawer,
  Form,
  Row,
  Col,
  DatePicker,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { db, generateId, getCurrentTimestamp } from '../store/db';
import { useApp } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { logAction } from '../services/auditService';
import type { Employee } from '../types';

const { Text } = Typography;

export const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompanyId, user } = useApp();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  // Reactive Dexie query
  const employees = useLiveQuery(async () => {
    if (!currentCompanyId) return [];
    return await db.employees.where('companyId').equals(currentCompanyId).toArray();
  }, [currentCompanyId]);

  const filteredEmployees = (employees ?? []).filter((emp) => {
    const matchesSearch =
      emp.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDrawer = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      form.setFieldsValue({
        ...emp,
        joiningDate: emp.joiningDate ? dayjs(emp.joiningDate) : undefined,
        probationEndDate: emp.probationEndDate ? dayjs(emp.probationEndDate) : undefined,
      });
    } else {
      setEditingEmployee(null);
      form.resetFields();
      form.setFieldsValue({
        status: 'active',
        employmentType: 'full_time',
        joiningDate: dayjs(),
      });
    }
    setDrawerVisible(true);
  };

  const handleSaveEmployee = async () => {
    try {
      const values = await form.validateFields();
      if (!currentCompanyId) {
        message.error('Please select an active company first');
        return;
      }

      const now = getCurrentTimestamp();
      const empData: Employee = {
        ...values,
        id: editingEmployee ? editingEmployee.id : generateId(),
        companyId: currentCompanyId,
        joiningDate: values.joiningDate ? values.joiningDate.format('YYYY-MM-DD') : '',
        probationEndDate: values.probationEndDate ? values.probationEndDate.format('YYYY-MM-DD') : '',
        createdAt: editingEmployee ? editingEmployee.createdAt : now,
        updatedAt: now,
      };

      if (editingEmployee) {
        await db.employees.put(empData);
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'update',
          'employee',
          empData.id,
          { name: empData.fullName },
        );
        message.success('Employee updated successfully');
      } else {
        await db.employees.add(empData);
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'create',
          'employee',
          empData.id,
          { name: empData.fullName },
        );
        message.success('Employee created successfully');
      }

      setDrawerVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await db.employees.delete(id);
      if (currentCompanyId) {
        await logAction(
          currentCompanyId,
          user?.id || 'anonymous',
          user?.name || 'User',
          'delete',
          'employee',
          id,
          { name },
        );
      }
      message.success('Employee deleted');
    } catch (err) {
      message.error('Failed to delete employee');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'on_notice':
        return <Tag color="orange">On Notice</Tag>;
      case 'separated':
        return <Tag color="gray">Separated</Tag>;
      case 'suspended':
        return <Tag color="red">Suspended</Tag>;
      case 'absconding':
        return <Tag color="volcano">Absconding</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Employee) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<FileAddOutlined />}
            onClick={() => navigate(`/generate?employeeId=${record.id}`)}
          >
            Issue Letter
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
          <Popconfirm
            title="Delete Employee"
            description="Are you sure you want to delete this employee record?"
            onConfirm={() => handleDelete(record.id, record.fullName)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        subtitle="Manage employee records and employment particulars for automated document generation."
        extra={
          <Space>
            <Button onClick={() => navigate('/employees/batch-upload')}>
              Excel Batch Upload
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenDrawer()}
            >
              Add Employee
            </Button>
          </Space>
        }
      />

      <div
        style={{
          backgroundColor: '#fff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by name, ID, role, department..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '320px' }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '160px' }}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'on_notice', label: 'On Notice' },
            { value: 'separated', label: 'Separated' },
            { value: 'absconding', label: 'Absconding' },
          ]}
        />
      </div>

      <Table
        dataSource={filteredEmployees}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ backgroundColor: '#fff', borderRadius: '8px' }}
      />

      {/* Add / Edit Drawer */}
      <Drawer
        title={editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSaveEmployee}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="fullName"
                label="Full Legal Name"
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input placeholder="e.g. Tanisha Roy" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="employeeId"
                label="Employee ID / Staff Code"
                rules={[{ required: true, message: 'Employee ID is required' }]}
              >
                <Input placeholder="e.g. ESL028" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="designation"
                label="Designation / Role"
                rules={[{ required: true, message: 'Designation is required' }]}
              >
                <Input placeholder="e.g. Customer Support Executive" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Input placeholder="e.g. Operations / Customer Service" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reportingManager" label="Reporting Manager">
                <Input placeholder="e.g. Amit Sharma" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Employment Status">
                <Select
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'on_notice', label: 'On Notice' },
                    { value: 'separated', label: 'Separated' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'absconding', label: 'Absconding / Unauthorized Absence' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="joiningDate" label="Date of Joining">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probationEndDate" label="Probation End Date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Official / Contact Email"
                rules={[{ type: 'email', message: 'Enter a valid email' }]}
              >
                <Input placeholder="e.g. tanisha.roy@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone / Mobile Number">
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Residential Address">
            <Input.TextArea rows={2} placeholder="Full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salary" label="Current Monthly Gross / CTC">
                <Input placeholder="e.g. ₹35,000/-" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employmentType" label="Employment Type">
                <Select
                  options={[
                    { value: 'full_time', label: 'Full Time' },
                    { value: 'part_time', label: 'Part Time' },
                    { value: 'contract', label: 'Contractor' },
                    { value: 'intern', label: 'Intern' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};
