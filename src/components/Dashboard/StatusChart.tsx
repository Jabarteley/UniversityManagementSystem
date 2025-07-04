import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusChartProps {
  data: Array<{ _id: string; count: number }>;
  title: string;
}

const StatusChart: React.FC<StatusChartProps> = ({ data, title }) => {
  const COLORS = {
    active: '#10B981',
    graduated: '#3B82F6',
    suspended: '#EF4444',
    withdrawn: '#6B7280',
    academic: '#3B82F6',
    administrative: '#8B5CF6',
    support: '#10B981',
  };

  const chartData = data.map(item => ({
    name: item._id,
    value: item.count,
    color: COLORS[item._id as keyof typeof COLORS] || '#6B7280'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium capitalize">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No {title.toLowerCase()} data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600 capitalize">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;