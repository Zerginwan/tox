import L from 'leaflet';

import Marker from './marker.svg';

const iconPerson = new L.Icon({
  iconUrl: Marker,
  iconRetinaUrl: Marker,
  iconSize: new L.Point(30, 30),
});

export { iconPerson };
