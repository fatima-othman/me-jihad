function Pricing({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>

      <div style={{ marginBottom: "20px" }}>
        <h4>Notes</h4>
        <ul>
          {data.content.notes.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Competitor Comparison</h4>
        {data.content.competitors.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            <h4>{item.name}</h4>
            <p><strong>Price:</strong> {item.price}</p>
            <p><strong>Note:</strong> {item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;