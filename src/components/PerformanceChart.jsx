import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function PerformanceChart({ history }) {
  if (!history.length) {
    return <p className="muted">No data yet — run a few generations.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={history}>
        <XAxis dataKey="gen" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="max" stroke="#818cf8" name="Max Fitness" dot={false} />
        <Line type="monotone" dataKey="avg" stroke="#22c55e" name="Avg Fitness" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
