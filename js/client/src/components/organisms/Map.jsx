import { useState, useRef } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvent,
  Marker,
  Popup,
  GeoJSON,
  LayersControl,
  Rectangle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { iconPerson } from "../atoms/leafletIcons/markerIcon";

import ObjectInfoPopup from "../molecules/ObjecInfoPopup";
import AddObjectForm from "../molecules/AddObjectForm";

import { aoJSON } from "../../geo/ao";
import { moJSON } from "../../geo/mo.js";

const ClickHandler = (props) => {
  const { addObject } = props;
  const popupRef = useRef(null);

  const [popupPosition, setPopupPosition] = useState(null);

  const closePopup = () => {
    popupRef.current._closeButton.click();
  };

  const map = useMapEvent("click", (e) => {
    setPopupPosition(e.latlng);
  });

  if (popupPosition) {
    return (
      <Popup ref={popupRef} position={popupPosition}>
        <AddObjectForm
          latLang={popupPosition}
          addObject={addObject}
          onClose={closePopup}
        />
      </Popup>
    );
  }
  return null;
};

const ToxMap = (props) => {
  const { selectedLayer, data, visualProperties } = props;

  const [myObjects, setMyObjects] = useState([]);

  const addObject = (newObject) => {
    setMyObjects((prevState) => [...prevState, newObject]);
  };

  return (
    <MapContainer
      center={[55.751244, 37.618423]}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
    >
      {/* <ClickHandler addObject={addObject} /> */}
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          checked={selectedLayer === 0}
          name="Административные округа"
        >
          <GeoJSON data={aoJSON}></GeoJSON>
          {myObjects.map((object, index) => {
            return (
              <Marker key={index} position={object.position} icon={iconPerson}>
                <ObjectInfoPopup object={object} />
              </Marker>
            );
          })}
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 1} name="Районы">
          <GeoJSON data={moJSON}></GeoJSON>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 2} name="Сектора">
          <Rectangle
            pathOptions={{ color: "red", weight: 1 }}
            bounds={[
              [55.71956889186813, 36.99480218696067],
              [55.72409266871701, 37.00270216166176],
            ]}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </MapContainer>
  );
};

export default ToxMap;
