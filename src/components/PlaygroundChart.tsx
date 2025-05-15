
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Playground } from '@/types/playground';

interface PlaygroundChartProps {
  type: 'current' | 'peak';
  playground: Playground;
}

const PlaygroundChart = ({ type, playground }: PlaygroundChartProps) => {
  // Generate mock data for demonstration
  const generateCurrentData = () => {
    return [
      { name: 'Ora', players: playground.currentPlayers },
    ];
  };
  
  const generatePeakData = () => {
    // Generate sample peak hours data (would come from backend in real app)
    return [
      { name: '8-10', players: Math.floor(Math.random() * 10) + 1 },
      { name: '10-12', players: Math.floor(Math.random() * 10) + 3 },
      { name: '12-14', players: Math.floor(Math.random() * 10) + 2 },
      { name: '14-16', players: Math.floor(Math.random() * 10) + 5 },
      { name: '16-18', players: Math.floor(Math.random() * 10) + 8 },
      { name: '18-20', players: Math.floor(Math.random() * 10) + 6 },
      { name: '20-22', players: playground.hasLighting ? Math.floor(Math.random() * 10) + 4 : 0 },
    ];
  };
  
  const data = type === 'current' ? generateCurrentData() : generatePeakData();
  
  const colors = ['#9b87f5', '#F97316', '#0EA5E9', '#D946EF', '#FBBF24', '#10B981'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#fff', fontSize: 10 }}
          axisLine={{ stroke: '#9b87f5' }}
        />
        <YAxis 
          tick={{ fill: '#fff', fontSize: 10 }}
          axisLine={{ stroke: '#9b87f5' }}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            border: '1px solid #9b87f5',
            borderRadius: '4px',
            color: '#fff',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '10px'
          }}
        />
        <Bar dataKey="players" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlaygroundChart;
