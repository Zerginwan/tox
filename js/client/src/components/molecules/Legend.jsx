import getColor from "../../lib/GetColor";

const styles = {
  container: {
    marginBottom: "40px",
  },
  content: {
    backgroundColor: "whitesmoke",
    padding: "0 18px 18px 18px",
    borderRadius: "20px",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  colorIndicator: {
    width: 12,
    heigth: 12,
    marginRight: 12,
  },
};

const Legend = (props) => {
  const { indexes } = props;

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{ marginBottom: "40px" }}
    >
      <div className="leaflet-control leaflet-bar" style={styles.content}>
        <h3 style={{ marginBottom: 8 }}>Условные обозначения:</h3>
        {indexes
          .sort((a, b) => b.id - a.id)
          .map((x) => {
            return (
              <div style={styles.row} key={x.id}>
                <div
                  style={{
                    ...styles.colorIndicator,
                    backgroundColor: getColor(x.id),
                  }}
                ></div>
                {x.display}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Legend;
