import { useState, useMemo, useRef, useEffect } from "react";

import Legend from "../molecules/Legend";

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

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

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
    selectLayer,
    data,
    changeData,
    visualProperties,
    addObjectMode,
    objectMode,
    selectedYear,
    turnOffAddObjectMode,
  } = props;

  const [myObjects, setMyObjects] = useState([]);
  const [objectProp, setObjectProp] = useState({
    name: "",
    position: null,
  });

  const addObject = (newObject) => {
    setMyObjects((prevState) => [...prevState, newObject]);

    fetch("/api/addObject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({
        objectTypeId: selectedInfType.objectId,
        year: selectedYear,
        additionalObjects: [...myObjects, newObject].map((x) => ({
          lat: x.position.lng,
          lon: x.position.lat,
        })),
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        changeData(result.data.new);
      });
    turnOffAddObjectMode();
  };

  const deleteObject = (id) => {
    const filteredObjects = myObjects.filter((x) => x.id !== id);

    fetch("/api/addObject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({
        objectTypeId: selectedInfType.objectId,
        year: selectedYear,
        additionalObjects: filteredObjects.map((x) => ({
          lat: x.position.lng,
          lon: x.position.lat,
        })),
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        changeData(result.data.new ? result.data.new : result.data);
        setMyObjects(filteredObjects);
      });
  };

  const objects = useMemo(() => {
    return myObjects
      .filter((x) => x.type === selectedInfType.objectId)
      .map((object, index) => {
        return object.type === 2 ? (
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
            {!addObjectMode ? (
              <Popup>
                <Typography variant="body2" style={{ marginBottom: "8px" }}>
                  Тип объекта:
                </Typography>
                <Typography variant="body2" style={{ marginTop: "0" }}>
                  {
                    visualProperties.objects.find((x) => x.id === object.type)
                      .display
                  }
                </Typography>
                <Typography variant="body2" style={{ marginBottom: "8px" }}>
                  Коориданты объекта:
                </Typography>
                <Typography variant="body2" style={{ marginTop: "0" }}>
                  {object.position.lng}, {object.position.lat}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    deleteObject(object.id);
                  }}
                >
                  Удалить объект
                </Button>
              </Popup>
            ) : null}
            <Circle
              key={index}
              center={object.position}
              radius={object.range}
              pathOptions={{
                color: "blue",
                opacity: 1,
              }}
            />
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
            {!addObjectMode ? (
              <Popup>
                <Typography variant="body2" style={{ marginBottom: "8px" }}>
                  Тип объекта:
                </Typography>
                <Typography variant="body2" style={{ marginTop: "0" }}>
                  {
                    visualProperties.objects.find((x) => x.id === object.type)
                      .display
                  }
                </Typography>
                <Typography variant="body2" style={{ marginBottom: "8px" }}>
                  Коориданты объекта:
                </Typography>
                <Typography variant="body2" style={{ marginTop: "0" }}>
                  {object.position.lng}, {object.position.lat}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    deleteObject(object.id);
                  }}
                >
                  Удалить объект
                </Button>
              </Popup>
            ) : null}
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
          fillOpacity: 0.05,
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
  }, [data.objects.mfc.length]);

  const [selectedAdmZone, setSelectedAdmZone] = useState(0);
  const [selectedOkrug, setSelectedOkrug] = useState(0);

  const getAnalytics = (regionId, zoneType) => {
    fetch("/py/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Number(regionId),
        zone_type: zoneType,
        object_type_id_list: [1, 2],
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        window.open(result.data);
      });
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
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer
          checked={selectedLayer === 0}
          name="Административные округа"
        >
          <LayerGroup>
            {selectedLayer === 0
              ? aoJSON.features.map((x, index) => {
                  return (
                    <GeoJSON
                      key={index}
                      style={{
                        color: visualProperties.affinityIndexes.find(
                          (item) =>
                            item.id ==
                            data.okrugs.find(
                              (okrug) => okrug.okrug_okato == x.properties.OKATO
                            )?.index_pop
                        ).color,
                      }}
                      data={{
                        features: [x],
                      }}
                    >
                      {!addObjectMode ? (
                        <Popup>
                          <Typography variant="body1" sx={{ fontWeight: 900 }}>
                            {x.properties.NAME}
                          </Typography>
                          <Typography variant="body2">
                            ОКАТО: {x.properties.OKATO}
                          </Typography>
                          {selectedInfType.objectId !== 1 && data.sectors ? (
                            <div>
                              <Typography variant="body2">
                                {"Население: "}
                                {data.sectors
                                  .filter((item) =>
                                    item.okrug_okato.includes(
                                      data.okrugs.find(
                                        (item) =>
                                          item.okrug_okato == x.properties.OKATO
                                      ).okrug_okato
                                    )
                                  )
                                  .reduce(
                                    (population, item) =>
                                      population + Number(item.population),
                                    0
                                  )}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ width: 180 }}
                                onClick={() => {
                                  setSelectedOkrug(
                                    data.okrugs.find(
                                      (item) =>
                                        item.okrug_okato == x.properties.OKATO
                                    ).okrug_okato
                                  );
                                  setSelectedAdmZone(0);
                                  selectLayer(2);
                                }}
                              >
                                Показать сектора
                              </Button>
                            </div>
                          ) : null}
                          <Button
                            variant="outlined"
                            style={{ marginTop: 12 }}
                            sx={{ width: 180 }}
                            size="small"
                            onClick={() => {
                              getAnalytics(x.properties.OKATO, "okrug");
                            }}
                          >
                            Составить записку
                          </Button>
                        </Popup>
                      ) : null}
                    </GeoJSON>
                  );
                })
              : null}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 1} name="Районы">
          <LayerGroup>
            {selectedLayer === 1
              ? moJSON.features.map((x, index) => {
                  return (
                    <GeoJSON
                      key={index}
                      data={{
                        features: [x],
                      }}
                      style={{
                        color: visualProperties.affinityIndexes
                          ? visualProperties.affinityIndexes.find(
                              (item) =>
                                item.id ==
                                data.admZones.find(
                                  (admZones) =>
                                    admZones.adm_okato == x.properties.OKATO
                                )?.index_pop
                            ).color
                          : null,
                      }}
                    >
                      {!addObjectMode ? (
                        <Popup>
                          <Typography variant="body1" sx={{ fontWeight: 900 }}>
                            {x.properties.NAME}
                          </Typography>
                          <Typography variant="body2">
                            ОКАТО: {x.properties.OKATO}
                          </Typography>
                          {selectedInfType.objectId !== 1 && data.sectors ? (
                            <div>
                              <Typography variant="body2">
                                {"Население: "}
                                {data.sectors
                                  .filter((item) =>
                                    item.adm_okato.includes(
                                      data.admZones.find(
                                        (item) =>
                                          item.adm_okato == x.properties.OKATO
                                      ).adm_okato
                                    )
                                  )
                                  .reduce(
                                    (population, item) =>
                                      population + Number(item.population),
                                    0
                                  )}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ width: 180 }}
                                onClick={() => {
                                  setSelectedAdmZone(
                                    data.admZones.find(
                                      (item) =>
                                        item.adm_okato == x.properties.OKATO
                                    ).adm_okato
                                  );
                                  setSelectedOkrug(0);
                                  selectLayer(2);
                                }}
                              >
                                Показать сектора
                              </Button>
                            </div>
                          ) : null}
                          <Button
                            variant="outlined"
                            style={{ marginTop: 12 }}
                            sx={{ width: 180 }}
                            size="small"
                            onClick={() => {
                              getAnalytics(x.properties.OKATO, "adm_zone");
                            }}
                          >
                            Составить записку
                          </Button>
                        </Popup>
                      ) : null}
                    </GeoJSON>
                  );
                })
              : null}
          </LayerGroup>
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={selectedLayer === 2} name="Сектора">
          <LayerGroup>
            {selectedLayer === 2 && selectedInfType.objectId !== 1
              ? selectedOkrug && !selectedAdmZone
                ? data.sectors
                    .filter(
                      (item) =>
                        item.okrug_okato.includes(selectedOkrug) ||
                        item.okrug_okato.includes(Number(selectedOkrug))
                    )
                    .map((x, index) => (
                      <Polygon
                        key={index}
                        positions={JSON.parse(x.geometry)}
                        pathOptions={{
                          color: visualProperties.affinityIndexes.find(
                            (item) => item.id == x.index_pop
                          )?.color,
                        }}
                      >
                        {!addObjectMode ? (
                          <Popup>
                            <Typography variant="body2">
                              Учитываемое население: {x.population}
                            </Typography>
                            <Typography variant="body2">
                              Процент выполнения норматива:{" "}
                              {Math.round(x.weight * 100)}%
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ width: 180 }}
                              onClick={() => {
                                getAnalytics(x.cell_zid, "sector");
                              }}
                            >
                              Составить записку
                            </Button>
                          </Popup>
                        ) : null}
                      </Polygon>
                    ))
                : data.sectors
                    .filter((item) => item.adm_okato.includes(selectedAdmZone))
                    .map((x, index) => (
                      <Polygon
                        key={index}
                        positions={JSON.parse(x.geometry)}
                        pathOptions={{
                          color: visualProperties.affinityIndexes.find(
                            (item) => item.id == x.index_pop
                          )?.color,
                        }}
                      >
                        {!addObjectMode ? (
                          <Popup>
                            <Typography variant="body2">
                              Учитываемое население: {x.population}
                            </Typography>
                            <Typography variant="body2">
                              Процент выполнения норматива:{" "}
                              {Math.round(x.weight * 100)}%
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ width: 180 }}
                              onClick={() => {
                                getAnalytics(x.cell_zid, "sector");
                              }}
                            >
                              Составить записку
                            </Button>
                          </Popup>
                        ) : null}
                      </Polygon>
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
      <Legend indexes={visualProperties.affinityIndexes} />
    </MapContainer>
  );
};

export default ToxMap;
