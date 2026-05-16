function Overview({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>

      <p>{data.content.summary}</p>

      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          marginTop: "30px"
        }}
      >
        {data.content.kpis.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "24px",
              borderRadius: "12px",
              width: "260px",
              minHeight: "170px",
              backgroundColor: "#ffffff"
            }}
          >
            <h3 style={{ fontSize: "34px", marginBottom: "14px" }}>{item.value}</h3>
            <p style={{ fontSize: "20px", marginBottom: "12px" }}>{item.title}</p>
            <small style={{ fontSize: "15px", lineHeight: "1.5" }}>{item.note}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
