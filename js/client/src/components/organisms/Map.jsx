import { useState, useRef } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvent,
  Marker,
  Polygon,
  Popup,
  GeoJSON,
  LayersControl,
  Rectangle,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { iconPerson } from "../atoms/leafletIcons/markerIcon";

import ObjectInfoPopup from "../molecules/ObjecInfoPopup";
import AddObjectForm from "../molecules/AddObjectForm";

import { aoJSON } from "../../geo/ao";
import { moJSON } from "../../geo/mo.js";

const getColor = (value) => {
  var hue = (value * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
};

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
  const {
    selectedLayer,
    data,
    visualProperties,
    addObjectMode,
    turnOffAddObjectMode,
  } = props;

  console.log(data);

  const [myObjects, setMyObjects] = useState([]);
  const [objectProp, setObjectProp] = useState({
    name: "",
    position: null,
  });

  const addObject = (newObject) => {
    setMyObjects((prevState) => [...prevState, newObject]);
    turnOffAddObjectMode();
  };

  return (
    <MapContainer
      center={[55.751244, 37.618423]}
      zoom={10}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {addObjectMode ? <ClickHandler addObject={addObject} /> : null}
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          checked={selectedLayer === 0}
          name="Административные округа"
        >
          <LayerGroup>
            {aoJSON.features.map((x, index) => {
              return (
                <GeoJSON
                  eventHandlers={{
                    click: (e) => {
                      setObjectProp({
                        name: x.properties.NAME,
                        position: e.latlng,
                      });
                    },
                  }}
                  key={index}
                  style={{
                    color: getColor(
                      data.okrugs.find(
                        (okrug) => okrug.okrug_okato === x.properties.OKATO
                      ).index_pop
                    ),
                  }}
                  data={{
                    features: [x],
                  }}
                ></GeoJSON>
              );
            })}
            {myObjects.map((object, index) => {
              return (
                <Marker
                  key={index}
                  position={object.position}
                  icon={iconPerson}
                >
                  <ObjectInfoPopup object={object} />
                </Marker>
              );
            })}
            {objectProp.name ? (
              <Popup position={objectProp.position}>{objectProp.name}</Popup>
            ) : null}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 1} name="Районы">
          <LayerGroup>
            {moJSON.features.map((x, index) => {
              return (
                <GeoJSON
                  eventHandlers={{
                    click: (e) => {
                      setObjectProp({
                        name: x.properties.NAME,
                        position: e.latlng,
                      });
                    },
                  }}
                  key={index}
                  data={{
                    features: [x],
                  }}
                  style={{
                    color: getColor(3),
                  }}
                ></GeoJSON>
              );
            })}
            {myObjects.map((object, index) => {
              return (
                <Marker
                  key={index}
                  position={object.position}
                  icon={iconPerson}
                >
                  <ObjectInfoPopup object={object} />
                </Marker>
              );
            })}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 2} name="Сектора">
          <LayerGroup>
            {selectedLayer === 2
              ? data.sectors.map((x, index) => (
                  <Polygon
                    key={index}
                    positions={JSON.parse(x.geometry)}
                    pathOptions={{
                      color: getColor(x.index_pop),
                    }}
                  />
                ))
              : null}
            {myObjects.map((object, index) => {
              return (
                <Marker
                  key={index}
                  position={object.position}
                  icon={iconPerson}
                >
                  <ObjectInfoPopup object={object} />
                </Marker>
              );
            })}
          </LayerGroup>
        </LayersControl.BaseLayer>
      </LayersControl>
    </MapContainer>
  );
};

export default ToxMap;
