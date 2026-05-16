function SocialMedia({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>
      <p>{data.content.intro}</p>

      <div style={{ marginTop: "20px" }}>
        {data.content.schedule.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            <h4>{item.day}</h4>
            <p><strong>Platform:</strong> {item.platform}</p>
            <p><strong>Content:</strong> {item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialMedia;
