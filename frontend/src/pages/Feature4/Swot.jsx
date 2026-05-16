function Swot({ data }) {
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h2>{data.section_title}</h2>

      <h4>Strengths</h4>
      <ul>
        {data.content.strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h4>Weaknesses</h4>
      <ul>
        {data.content.weaknesses.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h4>Opportunities</h4>
      <ul>
        {data.content.opportunities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h4>Threats</h4>
      <ul>
        {data.content.threats.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Swot;