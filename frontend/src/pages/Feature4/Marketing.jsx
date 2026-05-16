function Marketing({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>

      <p>{data.content.intro}</p>

      <div style={{ marginTop: "20px" }}>
        {data.content.campaigns.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            <h4>{item.title}</h4>
            <p><strong>Idea:</strong> {item.idea}</p>
            <p><strong>Goal:</strong> {item.goal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketing;