import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// PerformanceChart — a recharts line chart of max & average fitness per
// generation. `history` is [{ gen, max, avg }, ...]; it's toggled on/off
// from the HUD so the chart only mounts when wanted.
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
        {/* dot={false} keeps the lines clean once many generations accumulate */}
        <Line type="monotone" dataKey="max" stroke="#10b981" name="Max Fitness" dot={false} />
        <Line type="monotone" dataKey="avg" stroke="#a1a1aa" name="Avg Fitness" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
