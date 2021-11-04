const getColor = (index, cell_zid) => {
  switch (index) {
    // значительно ниже норматива
    case 1:
      return "#800026";
    // значительно ниже норматива
    case 2:
      return "#CD5C5C";
    // ниже норматива
    case 3:
      return "#FFA500";
    // незначительно ниже норматива
    case 4:
      return "#FFD700";
    // соответствует нормативу
    case 5:
      return "#9ACD32";
    // превышает норматив
    case 6:
      return "#2E8B57";
    default:
      return;
  }
};

export default getColor;
