import { TopBar } from "../components/TopBar";

// HistoryPage — reads the last run straight from localStorage (written each
// generation by useSimulation) and shows the per-generation fitness table.
export default function HistoryPage() {
  const generation = localStorage.getItem("generation");
  const eliteDNA = localStorage.getItem("eliteDNA");
  const history = JSON.parse(localStorage.getItem("statsHistory") || "[]");

  return (
    <div className="app">
      <TopBar title="Run History" />
      <main className="layout">
        <section className="content">
          {!generation ? (
            <p className="muted">No saved runs yet. Run the simulator first.</p>
          ) : (
            <div className="panel">
              <p>Last reached generation: <strong>{generation}</strong></p>
              <p>Elite DNA genes stored: <strong>{eliteDNA ? JSON.parse(eliteDNA).length : 0}</strong></p>
              <h3>Per-generation fitness</h3>
              <table className="history-table">
                <thead>
                  <tr><th>Gen</th><th>Max Fitness</th><th>Avg Fitness</th></tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.gen}>
                      <td>{h.gen}</td>
                      <td>{h.max.toFixed(4)}</td>
                      <td>{h.avg.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
