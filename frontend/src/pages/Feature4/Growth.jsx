function Growth({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>
      <p>{data.content.intro}</p>

      <div style={{ marginTop: "20px" }}>
        {data.content.milestones.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            <h4>{item.phase}</h4>
            <p><strong>Goal:</strong> {item.goal}</p>

            <ul>
              {item.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Growth;