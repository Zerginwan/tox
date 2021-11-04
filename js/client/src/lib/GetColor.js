const getColor = (index, cell_zid) => {
  switch (index) {
    // значительно ниже норматива
    case 1:
      return "#CD5C5C";
    // значительно ниже норматива
    case 2:
      return "#FFA500";
    // ниже норматива
    case 3:
      return "#FFD700";
    // незначительно ниже норматива
    case 4:
      return "#9ACD32";
    // соответствует нормативу
    case 5:
      return "#2E8B57";
    // превышает норматив
    default:
      return;
  }
};

export default getColor;
