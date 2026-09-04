import { useEffect, useRef } from "react";

import {
  Map,
  Marker,
  NavigationControl,
  Popup,
  LngLatBounds,
  setWorkerUrl,
} from "maplibre-gl";

import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import Papa from "papaparse";

import proliantBlackLogo from "../../assets/logos/ProliantBlack/proliant_black.png";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(maplibreWorker);

const LocationsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const markers = useRef([]);
  const popup = useRef(null);

  const level = useRef("world");
  const automaticTransition = useRef(false);

  const selectedCountry = useRef(null);
  const selectedState = useRef(null);

  useEffect(() => {
    if (map.current) return;

    /* =========================================================
       CARD STYLES
    ========================================================= */

    const addCardStyles = () => {
      if (
        document.getElementById(
          "proliant-location-card-styles"
        )
      ) {
        return;
      }

      const style = document.createElement("style");

      style.id = "proliant-location-card-styles";

      style.innerHTML = `
        .proliant-location-popup {
          width: 340px;
          max-width: calc(100vw - 40px);

          background: #000000;
          color: #ffffff;

          border-radius: 20px;

          overflow: hidden;

          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.55),
            0 0 25px rgba(218, 56, 56, 0.10);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          box-sizing: border-box;
        }

        .proliant-card-header {
          width: 100%;

          min-height: 110px;

          background: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 12px 20px;

          box-sizing: border-box;

          overflow: hidden;
        }

        .proliant-card-logo {
          display: block;

          width: 190px;

          height: auto;

          max-width: 100%;

          max-height: 60px;

          object-fit: contain;

          object-position: center;

          margin: 0 auto;
        }

        .proliant-card-body {
          width: 100%;

          background: #000000;

          padding: 26px 28px 24px;

          box-sizing: border-box;
        }

        .proliant-card-company {
          margin: 0;

          padding: 0;

          color: #ffffff;

          font-size: 21px;

          line-height: 1.35;

          font-weight: 700;

          white-space: normal;

          overflow-wrap: break-word;

          word-break: normal;
        }

        .proliant-card-country {
          margin-top: 5px;

          color: #bdbdbd;

          font-size: 14px;

          line-height: 1.4;

          white-space: normal;
        }

        .proliant-card-address-wrapper {
          display: flex;

          align-items: stretch;

          gap: 12px;

          width: 100%;

          margin-top: 22px;

          box-sizing: border-box;
        }

        .proliant-card-address-line {
          width: 3px;

          min-width: 3px;

          background: #DA3838;

          border-radius: 2px;

          align-self: stretch;
        }

        .proliant-card-address {
          flex: 1;

          min-width: 0;

          margin: 0;

          padding: 0;

          color: #e5e5e5;

          font-size: 14px;

          line-height: 1.6;

          white-space: normal;

          overflow: visible;

          overflow-wrap: break-word;

          word-break: normal;
        }

        .proliant-card-actions {
          width: 100%;

          margin-top: 22px;
        }

        .proliant-card-action {
          width: 100%;

          min-height: 54px;

          display: flex;

          align-items: center;

          gap: 14px;

          padding: 13px 4px;

          box-sizing: border-box;

          color: #ffffff;

          text-decoration: none;

          border-top:
            1px solid
            rgba(255, 255, 255, 0.10);

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.8px;

          transition:
            background 0.25s ease,
            color 0.25s ease,
            padding-left 0.25s ease;
        }

        .proliant-card-action:first-child {
          border-top: none;

          border:
            1px solid
            rgba(255, 255, 255, 0.8);

          border-radius: 5px;

          padding-left: 10px;

          padding-right: 10px;

          margin-bottom: 4px;
        }

        .proliant-card-action:hover {
          color: #DA3838;

          background:
            rgba(218, 56, 56, 0.06);

          padding-left: 9px;
        }

        .proliant-card-action:first-child:hover {
          padding-left: 14px;
        }

        .proliant-card-icon {
          width: 20px;

          height: 20px;

          min-width: 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #DA3838;
        }

        .proliant-card-icon svg {
          width: 20px;

          height: 20px;

          display: block;
        }

        .maplibregl-popup {
          max-width: none !important;
        }

        .maplibregl-popup-content {
          padding: 0 !important;

          background: transparent !important;

          box-shadow: none !important;

          overflow: visible !important;
        }

        .maplibregl-popup-tip {
          display: none !important;
        }

        @media (max-width: 600px) {
          .proliant-location-popup {
            width: 300px;

            max-width:
              calc(100vw - 30px);
          }

          .proliant-card-header {
            min-height: 70px;

            padding:
              10px 16px;
          }

          .proliant-card-logo {
            width: 150px;

            max-height: 46px;
          }

          .proliant-card-body {
            padding:
              22px 22px 20px;
          }

          .proliant-card-company {
            font-size: 18px;
          }

          .proliant-card-country {
            font-size: 13px;
          }

          .proliant-card-address {
            font-size: 13px;

            line-height: 1.55;
          }

          .proliant-card-action {
            font-size: 12px;
          }
        }
      `;

      document.head.appendChild(style);
    };

    addCardStyles();

    /* =========================================================
       MAP
    ========================================================= */

    const mapInstance = new Map({
      container: mapContainer.current,

      style:
        "https://tiles.openfreemap.org/styles/dark",

      center: [0, 20],

      zoom: 1,

      renderWorldCopies: false,

      attributionControl: false,
    });

    map.current = mapInstance;

    /* =========================================================
       NAVIGATION CONTROL
    ========================================================= */

    mapInstance.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      "bottom-right"
    );

    /* =========================================================
       ZOOM BEHAVIOR
    ========================================================= */

    mapInstance.scrollZoom.disable();

    mapInstance.doubleClickZoom.disable();

    mapInstance.touchZoomRotate.enable();

    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    const escapeHtml = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    /* =========================================================
       CREATE OFFICE CARD
    ========================================================= */

    const createOfficeCard = (location) => {
      const companyName =
        location.location?.trim() ||
        "Proliant Data";

      const country =
        location.country?.trim() ||
        "";

      const address =
        location.address?.trim() ||
        "";

      const latitude =
        Number(location.latitude);

      const longitude =
        Number(location.longitude);

      const phone =
        location.phone?.trim() ||
        "";

      const email =
        location.email?.trim() ||
        "hr@proliantdatallc.com";

      const googleMapsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

      return `
        <div class="proliant-location-popup">

          <div class="proliant-card-header">

            <img
              src="${proliantBlackLogo}"
              alt="Proliant Data"
              class="proliant-card-logo"
            />

          </div>

          <div class="proliant-card-body">

            <h3 class="proliant-card-company">
              ${escapeHtml(companyName)}
            </h3>

            <div class="proliant-card-country">
              ${escapeHtml(country)}
            </div>

            <div class="proliant-card-address-wrapper">

              <div
                class="proliant-card-address-line"
              ></div>

              <p
                class="proliant-card-address"
              >
                ${escapeHtml(address)}
              </p>

            </div>

            <div class="proliant-card-actions">

              <!-- GET DIRECTIONS -->

              <a
                href="${googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="proliant-card-action"
              >

                <span
                  class="proliant-card-icon"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >

                    <path
                      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                    />

                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                    />

                  </svg>

                </span>

                <span>
                  GET DIRECTIONS
                </span>

              </a>

              <!-- EMAIL -->

              <a
                href="mailto:${escapeHtml(email)}"
                class="proliant-card-action"
              >

                <span
                  class="proliant-card-icon"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >

                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path
                      d="m3 7 9 6 9-6"
                    />

                  </svg>

                </span>

                <span>
                  EMAIL US
                </span>

              </a>

              <!-- CONTACT -->

              <a
                href="tel:${escapeHtml(phone)}"
                class="proliant-card-action"
              >

                <span
                  class="proliant-card-icon"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >

                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2
                      19.79 19.79 0 0 1-8.63-3.07
                      19.5 19.5 0 0 1-6-6
                      19.79 19.79 0 0 1-3.07-8.67
                      A2 2 0 0 1 4.11 2h3
                      a2 2 0 0 1 2 1.72
                      12.84 12.84 0 0 0 .7 2.81
                      2 2 0 0 1-.45 2.11L8.09 9.91
                      a16 16 0 0 0 6 6l1.27-1.27
                      a2 2 0 0 1 2.11-.45
                      12.84 12.84 0 0 0 2.81.7
                      A2 2 0 0 1 22 16.92Z"
                    />

                  </svg>

                </span>

                <span>
                  CONTACT US
                </span>

              </a>

            </div>

          </div>

        </div>
      `;
    };

    /* =========================================================
       SHOW OFFICE CARD
    ========================================================= */

    const showOfficeCard = (
      location,
      marker
    ) => {

      if (popup.current) {
        popup.current.remove();

        popup.current = null;
      }

      const cardHTML =
        createOfficeCard(location);

      const markerPoint =
        mapInstance.project(
          marker.getLngLat()
        );

      const mapWidth =
        mapContainer.current.clientWidth;

      /*
        LEFT HALF  → CARD OPENS RIGHT
        RIGHT HALF → CARD OPENS LEFT
      */

      const isLeftSide =
        markerPoint.x <
        mapWidth / 2;

      const popupAnchor =
        isLeftSide
          ? "left"
          : "right";

      popup.current =
        new Popup({
          closeButton: false,

          closeOnClick: false,

          closeOnMove: false,

          maxWidth: "none",

          anchor: popupAnchor,

          offset: 22,
        })
          .setLngLat(
            marker.getLngLat()
          )
          .setHTML(
            cardHTML
          )
          .addTo(
            mapInstance
          );
    };

    /* =========================================================
       MAP LOAD
    ========================================================= */

    mapInstance.on(
      "load",
      async () => {

        try {

          /* =====================================================
             ENGLISH COUNTRY LABELS
          ===================================================== */

          const countryLayers = [
            "place_country_major",
            "place_country_minor",
            "place_country_other",
          ];

          countryLayers.forEach(
            (layerId) => {

              if (
                mapInstance.getLayer(
                  layerId
                )
              ) {

                mapInstance.setLayoutProperty(
                  layerId,
                  "text-field",
                  [
                    "coalesce",
                    ["get", "name_en"],
                    ["get", "name"],
                  ]
                );

              }

            }
          );

          /* =====================================================
             COUNTRY GEOJSON
          ===================================================== */

          const countryResponse =
            await fetch(
              "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json"
            );

          if (!countryResponse.ok) {
            throw new Error(
              "Failed to load country GeoJSON"
            );
          }

          const countryData =
            await countryResponse.json();

          /* =====================================================
             COUNTRY SOURCE
          ===================================================== */

          mapInstance.addSource(
            "countries",
            {
              type: "geojson",

              data: countryData,
            }
          );

          /* =====================================================
             CLICKABLE COUNTRY LAYER
          ===================================================== */

          mapInstance.addLayer({
            id: "countries-clickable",

            type: "fill",

            source: "countries",

            paint: {
              "fill-color":
                "#DA3838",

              "fill-opacity":
                0,
            },
          });

          /* =====================================================
             LOAD CSV
          ===================================================== */

          const csvResponse =
            await fetch(
              "/data/locations.csv"
            );

          if (!csvResponse.ok) {
            throw new Error(
              "Failed to load locations.csv"
            );
          }

          const csvText =
            await csvResponse.text();

          const parsedCSV =
            Papa.parse(
              csvText,
              {
                header: true,

                skipEmptyLines: true,
              }
            );

          const locations =
            parsedCSV.data;

          console.log(
            "Locations loaded from CSV:",
            locations
          );

          /* =====================================================
             NORMALIZE COUNTRY
          ===================================================== */

          const normalizeCountry = (
            name
          ) => {

            if (!name) {
              return "";
            }

            const normalized =
              name
                .toLowerCase()
                .trim()
                .replace(
                  /[^a-z]/g,
                  ""
                );

            const aliases = {
              usa:
                "unitedstatesofamerica",

              us:
                "unitedstatesofamerica",

              unitedstates:
                "unitedstatesofamerica",

              uae:
                "unitedarabemirates",

              dubai:
                "unitedarabemirates",
            };

            return (
              aliases[
                normalized
              ] ||
              normalized
            );
          };

          /* =====================================================
             GET GEOJSON COUNTRY NAME
          ===================================================== */

          const getGeoJSONCountryName =
            (feature) => {

              return (
                feature.properties?.ADMIN ||
                feature.properties?.NAME ||
                feature.properties?.name ||
                ""
              );

            };

          /* =====================================================
             LOCATIONS BY COUNTRY
          ===================================================== */

          const locationsByCountry =
            {};

          locations.forEach(
            (location) => {

              const country =
                location.country?.trim();

              if (!country) {
                return;
              }

              const countryKey =
                normalizeCountry(
                  country
                );

              if (
                !locationsByCountry[
                  countryKey
                ]
              ) {

                locationsByCountry[
                  countryKey
                ] = [];

              }

              locationsByCountry[
                countryKey
              ].push(
                location
              );

            }
          );

          console.log(
            "Locations by country:",
            locationsByCountry
          );

          /* =====================================================
             LOCATIONS BY STATE
          ===================================================== */

          const locationsByState =
            {};

          locations.forEach(
            (location) => {

              const country =
                location.country?.trim();

              const state =
                location.state?.trim();

              if (
                !country ||
                !state
              ) {
                return;
              }

              const countryKey =
                normalizeCountry(
                  country
                );

              const stateKey =
                state
                  .toLowerCase()
                  .trim();

              const key =
                `${countryKey}__${stateKey}`;

              if (
                !locationsByState[
                  key
                ]
              ) {

                locationsByState[
                  key
                ] = [];

              }

              locationsByState[
                key
              ].push(
                location
              );

            }
          );

          console.log(
            "Locations by state:",
            locationsByState
          );

          /* =====================================================
             CREATE MARKER
          ===================================================== */

          const createMarker =
            () => {

              const element =
                document.createElement(
                  "div"
                );

              element.style.width =
                "16px";

              element.style.height =
                "16px";

              element.style.background =
                "#DA3838";

              element.style.borderRadius =
                "50%";

              element.style.boxShadow =
                "0 0 12px rgba(218, 56, 56, 0.8)";

              element.style.cursor =
                "pointer";

              element.style.pointerEvents =
                "auto";

              return element;
            };

          /* =====================================================
             CREATE OFFICE MARKERS
          ===================================================== */

          locations.forEach(
            (location) => {

              const latitude =
                Number(
                  location.latitude
                );

              const longitude =
                Number(
                  location.longitude
                );

              if (
                Number.isNaN(
                  latitude
                ) ||
                Number.isNaN(
                  longitude
                )
              ) {
                return;
              }

              const element =
                createMarker();

              const marker =
                new Marker({
                  element,

                  anchor: "center",
                })
                  .setLngLat([
                    longitude,
                    latitude,
                  ])
                  .addTo(
                    mapInstance
                  );

              /* Initially hidden */

              element.style.display =
                "none";

              /* =================================================
                 CURRENT CARD BEHAVIOR:
                 HOVER → SHOW CARD
              ================================================= */

              element.addEventListener(
                "mouseenter",
                () => {

                  level.current =
                    "office";

                  selectedCountry.current =
                    location.country;

                  selectedState.current =
                    location.state;

                  console.log(
                    "Hovered office:",
                    location.location
                  );

                  showOfficeCard(
                    location,
                    marker
                  );

                }
              );

              markers.current.push(
                marker
              );

            }
          );

          /* =====================================================
             SHOW ALL MARKERS
          ===================================================== */

          const showAllMarkers =
            () => {

              markers.current.forEach(
                (marker) => {

                  marker
                    .getElement()
                    .style.display =
                    "block";

                }
              );

            };

          /* =====================================================
             HIDE ALL MARKERS
          ===================================================== */

          const hideAllMarkers =
            () => {

              markers.current.forEach(
                (marker) => {

                  marker
                    .getElement()
                    .style.display =
                    "none";

                }
              );

            };

          /* =====================================================
             WORLD LEVEL
          ===================================================== */

          showAllMarkers();

          /* =====================================================
             COUNTRY CLICK
             
             THIS IS THE IMPORTANT PART
             
             CLICK COUNTRY
             ↓
             FIND PROLIANT COUNTRY
             ↓
             GET COUNTRY GEOMETRY
             ↓
             CALCULATE BOUNDS
             ↓
             SMOOTHLY ZOOM INTO COUNTRY
          ===================================================== */

          mapInstance.on(
            "click",
            "countries-clickable",
            (event) => {

              /* Only allow country
                 clicks at world level */

              if (
                level.current !==
                "world"
              ) {
                return;
              }

              if (
                !event.features ||
                !event.features.length
              ) {
                return;
              }

              const country =
                event.features[0];

              /* -----------------------------------------------
                 GET GEOJSON COUNTRY NAME
              ------------------------------------------------ */

              const geoCountry =
                getGeoJSONCountryName(
                  country
                );

              console.log(
                "Clicked GeoJSON country:",
                geoCountry
              );

              /* -----------------------------------------------
                 NORMALIZE NAME
              ------------------------------------------------ */

              const countryKey =
                normalizeCountry(
                  geoCountry
                );

              /* -----------------------------------------------
                 FIND PROLIANT LOCATIONS
              ------------------------------------------------ */

              const countryLocations =
                locationsByCountry[
                  countryKey
                ];

              /* -----------------------------------------------
                 IGNORE NON-PROLIANT COUNTRIES
              ------------------------------------------------ */

              if (
                !countryLocations ||
                !countryLocations.length
              ) {

                console.log(
                  "Not a Proliant country:",
                  geoCountry
                );

                return;
              }

              /* -----------------------------------------------
                 VALID COORDINATES
              ------------------------------------------------ */

              const validLocations =
                countryLocations.filter(
                  (location) =>
                    !Number.isNaN(
                      Number(
                        location.latitude
                      )
                    ) &&
                    !Number.isNaN(
                      Number(
                        location.longitude
                      )
                    )
                );

              if (
                !validLocations.length
              ) {
                return;
              }

              /* -----------------------------------------------
                 SAVE SELECTED COUNTRY
              ------------------------------------------------ */

              selectedCountry.current =
                countryLocations[0].country;

              level.current =
                "country";

              console.log(
                "Proliant country selected:",
                selectedCountry.current
              );

              automaticTransition.current =
                true;

              /* =================================================
                 COUNTRY ZOOM
              ================================================= */

              const geometry =
                country.geometry;

              if (!geometry) {

                console.log(
                  "Country geometry missing"
                );

                automaticTransition.current =
                  false;

                return;
              }

              /* -----------------------------------------------
                 CREATE EMPTY BOUNDS
              ------------------------------------------------ */

              const bounds =
                new LngLatBounds();

              /* -----------------------------------------------
                 RECURSIVELY READ GEOJSON
                 
                 Handles:
                 Polygon
                 MultiPolygon
              ------------------------------------------------ */

              const addCoordinates =
                (coordinates) => {

                  if (
                    !Array.isArray(
                      coordinates
                    )
                  ) {
                    return;
                  }

                  /* Single coordinate:
                     [longitude, latitude] */

                  if (
                    typeof coordinates[0] ===
                      "number" &&
                    typeof coordinates[1] ===
                      "number"
                  ) {

                    bounds.extend(
                      coordinates
                    );

                    return;
                  }

                  /* Nested coordinates */

                  coordinates.forEach(
                    (item) => {

                      addCoordinates(
                        item
                      );

                    }
                  );
                };

              addCoordinates(
                geometry.coordinates
              );

              /* -----------------------------------------------
                 SAFETY CHECK
              ------------------------------------------------ */

              if (
                bounds.isEmpty()
              ) {

                console.log(
                  "Country bounds are empty"
                );

                automaticTransition.current =
                  false;

                return;
              }

              console.log(
                "Country bounds:",
                bounds
              );

              /* =================================================
                 SMOOTH COUNTRY ZOOM EFFECT
              ================================================= */

              mapInstance.fitBounds(
                bounds,
                {
                  padding: {
                    top: 120,
                    bottom: 120,
                    left: 120,
                    right: 120,
                  },

                  maxZoom: 5.2,

                  duration: 1800,

                  essential: true,
                }
              );

              /* -----------------------------------------------
                 AFTER ZOOM
              ------------------------------------------------ */

              mapInstance.once(
                "moveend",
                () => {

                  automaticTransition.current =
                    false;

                }
              );

            }
          );

          /* =====================================================
             COUNTRY HOVER / CURSOR
          ===================================================== */

          mapInstance.on(
            "mouseenter",
            "countries-clickable",
            (event) => {

              if (
                level.current !==
                "world"
              ) {
                return;
              }

              if (
                !event.features ||
                !event.features.length
              ) {
                return;
              }

              const country =
                event.features[0];

              const geoCountry =
                getGeoJSONCountryName(
                  country
                );

              const countryKey =
                normalizeCountry(
                  geoCountry
                );

              if (
                locationsByCountry[
                  countryKey
                ]
              ) {

                mapInstance
                  .getCanvas()
                  .style.cursor =
                  "pointer";

              }

            }
          );

          mapInstance.on(
            "mouseleave",
            "countries-clickable",
            () => {

              mapInstance
                .getCanvas()
                .style.cursor =
                "";

            }
          );

          /* =====================================================
             ZOOM LEVEL LOGIC
          ===================================================== */

          mapInstance.on(
            "zoomend",
            () => {

              if (
                automaticTransition.current
              ) {
                return;
              }

              const zoom =
                mapInstance.getZoom();

              /* ===============================================
                 OFFICE → STATE
              =============================================== */

              if (
                level.current ===
                  "office" &&
                zoom <= 11
              ) {

                console.log(
                  "OFFICE → STATE"
                );

                level.current =
                  "state";

                automaticTransition.current =
                  true;

                if (popup.current) {

                  popup.current.remove();

                  popup.current =
                    null;
                }

                const center =
                  mapInstance.getCenter();

                mapInstance.flyTo({

                  center: [
                    center.lng,
                    center.lat,
                  ],

                  zoom: 6,

                  speed: 1.2,

                  curve: 1.5,

                  essential: true,

                });

                mapInstance.once(
                  "moveend",
                  () => {

                    automaticTransition.current =
                      false;

                  }
                );

                return;
              }

              /* ===============================================
                 STATE → COUNTRY
              =============================================== */

              if (
                level.current ===
                  "state" &&
                zoom <= 5
              ) {

                console.log(
                  "STATE → COUNTRY"
                );

                level.current =
                  "country";

                automaticTransition.current =
                  true;

                const center =
                  mapInstance.getCenter();

                mapInstance.flyTo({

                  center: [
                    center.lng,
                    center.lat,
                  ],

                  zoom: 4.5,

                  speed: 1.2,

                  curve: 1.5,

                  essential: true,

                });

                mapInstance.once(
                  "moveend",
                  () => {

                    automaticTransition.current =
                      false;

                  }
                );

                return;
              }

              /* ===============================================
                 COUNTRY → WORLD
              =============================================== */

              if (
                level.current ===
                  "country" &&
                zoom <= 3.5
              ) {

                console.log(
                  "COUNTRY → WORLD"
                );

                level.current =
                  "world";

                automaticTransition.current =
                  true;

                if (popup.current) {

                  popup.current.remove();

                  popup.current =
                    null;
                }

                mapInstance.flyTo({

                  center: [
                    0,
                    20,
                  ],

                  zoom: 1,

                  speed: 1.2,

                  curve: 1.5,

                  essential: true,

                });

                mapInstance.once(
                  "moveend",
                  () => {

                    automaticTransition.current =
                      false;

                    showAllMarkers();

                  }
                );

                return;
              }

            }
          );

        } catch (error) {

          console.error(
            "LocationsMap error:",
            error
          );

        }

      }
    );

    /* =========================================================
       CLEANUP
    ========================================================= */

    return () => {

      if (popup.current) {

        popup.current.remove();

        popup.current = null;
      }

      markers.current.forEach(
        (marker) => {

          marker.remove();

        }
      );

      markers.current = [];

      mapInstance.remove();

      map.current = null;

    };

  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[900px]"
    />
  );
};

export default LocationsMap;