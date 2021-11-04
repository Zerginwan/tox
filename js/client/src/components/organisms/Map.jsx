import { useState, useMemo, useRef, useEffect } from "react";

import Legend from "../molecules/Legend";
import YearPicker from "../molecules/YearPicker";

import getColor from "../../lib/GetColor";

import {
  MapContainer,
  TileLayer,
  useMapEvent,
  Marker,
  Polygon,
  Popup,
  GeoJSON,
  LayersControl,
  Circle,
  FeatureGroup,
  LayerGroup,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { iconPerson } from "../atoms/leafletIcons/markerIcon";

import ObjectInfoPopup from "../molecules/ObjecInfoPopup";
import AddObjectForm from "../molecules/AddObjectForm";

import { aoJSON } from "../../geo/ao";
import { moJSON } from "../../geo/mo.js";

const ClickHandler = (props) => {
  const { addObject, selectedInfType, visualProperties } = props;
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
          selectedInfType={selectedInfType}
          addObject={addObject}
          onClose={closePopup}
          visualProperties={visualProperties}
        />
      </Popup>
    );
  }
  return null;
};

const ToxMap = (props) => {
  const {
    selectedLayer,
    selectedInfType,
    data,
    visualProperties,
    addObjectMode,
    objectMode,
    turnOffAddObjectMode,
  } = props;

  const [myObjects, setMyObjects] = useState([]);
  const [objectProp, setObjectProp] = useState({
    name: "",
    position: null,
  });

  const addObject = (newObject) => {
    setMyObjects((prevState) => [...prevState, newObject]);
    turnOffAddObjectMode();
  };

  const objects = useMemo(() => {
    return myObjects
      .filter((x) => x.type === selectedInfType.objectId)
      .map((object, index) => {
        return object.type === 2 ? (
          <Circle
            key={index}
            center={object.position}
            radius={object.range}
            pathOptions={{
              color: "blue",
              opacity: 1,
            }}
          >
            <Circle
              key={index}
              center={object.position}
              radius={100}
              pathOptions={{
                opacity: 0.5,
                color: "blue",
                fillOpacity: 0.5,
              }}
            />
            <ObjectInfoPopup object={object} />
          </Circle>
        ) : (
          <Circle
            key={index}
            center={object.position}
            radius={100}
            pathOptions={{
              opacity: 0.5,
              color: "blue",
              fillOpacity: 0.5,
            }}
          >
            <ObjectInfoPopup object={object} />
          </Circle>
        );
      });
  }, [selectedInfType, myObjects]);

  const polyclinic_child = useMemo(() => {
    return data.objects.polyclinic_child.map((object, index) => (
      <Circle
        key={index}
        center={[object.coorY, object.coorX]}
        radius={1000}
        pathOptions={{
          color: "green",
          opacity: 0.4,
          fillOpacity: 0.2,
        }}
      >
        <Circle
          key={index}
          center={[object.coorY, object.coorX]}
          radius={100}
          pathOptions={{
            opacity: 0.5,
            color: "green",
            fillOpacity: 0.5,
          }}
        />
      </Circle>
    ));
  }, [data.objects.polyclinic_child.length]);

  const mfc = useMemo(() => {
    return data.objects.mfc.map((object, index) => (
      <Circle
        key={index}
        center={[object.coorY, object.coorX]}
        radius={100}
        pathOptions={{
          opacity: 0.5,
          color: "green",
          fillOpacity: 0.5,
        }}
      />
    ));
  }, [data.objects.polyclinic_child.length]);

  return (
    <MapContainer
      center={[55.751244, 37.618423]}
      zoom={10}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {addObjectMode ? (
        <ClickHandler
          addObject={addObject}
          selectedInfType={selectedInfType}
          visualProperties={visualProperties}
        />
      ) : null}
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
                      Number(
                        data.okrugs.find(
                          (okrug) => okrug.okrug_okato === x.properties.OKATO
                        ).index_pop
                      )
                    ),
                  }}
                  data={{
                    features: [x],
                  }}
                ></GeoJSON>
              );
            })}
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
                    color: getColor(
                      Number(
                        data.admZones.find(
                          (admZones) =>
                            admZones.adm_okato === x.properties.OKATO
                        )?.index_pop
                      )
                    ),
                  }}
                ></GeoJSON>
              );
            })}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 2} name="Сектора">
          <LayerGroup>
            {selectedLayer === 2 && selectedInfType.objectId !== 1
              ? data.sectors.map((x, index) => (
                  <Polygon
                    key={index}
                    positions={JSON.parse(x.geometry)}
                    pathOptions={{
                      color: getColor(Number(x.index_pop), x.cell_zid),
                    }}
                  />
                ))
              : null}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.Overlay name="Объекты" checked={objectMode}>
          <FeatureGroup>
            {objects}
            {selectedInfType.objectId === 2 ? polyclinic_child : mfc}
          </FeatureGroup>
        </LayersControl.Overlay>
      </LayersControl>
      {objectProp.name ? (
        <Popup position={objectProp.position}>{objectProp.name}</Popup>
      ) : null}
      <Legend indexes={visualProperties.affinityIndexes} />
      {/* <YearPicker /> */}
    </MapContainer>
  );
};

export default ToxMap;
