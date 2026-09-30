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

import proliantBlackLogo from "../../assets/logos/ProliantBlack/proliant_black.png";
import pinIcon from "../../assets/images/WhoweAre/Maps/Pin.png";

import "maplibre-gl/dist/maplibre-gl.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

setWorkerUrl(maplibreWorker);

const LocationsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const countryMarkers = useRef([]);
  const officeMarkers = useRef([]);

  const popup = useRef(null);

  const level = useRef("world");
  const selectedCountry = useRef(null);
  const automaticTransition = useRef(false);

  const initialView = useRef({
    center: [0, 20],
    zoom: 1.45,
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    /* =========================================================
       MAP INITIALIZATION
    ========================================================= */

    const isMobile = window.innerWidth < 768;

    const mapInstance = new Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: initialView.current.center,
      zoom: initialView.current.zoom,
      minZoom: isMobile ? -1 : 1.35,
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

    mapInstance.scrollZoom.disable();
    mapInstance.doubleClickZoom.disable();
    mapInstance.touchZoomRotate.enable();

    /* =========================================================
       RESPONSIVE RESIZE
    ========================================================= */

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!map.current) {
              return;
            }

            requestAnimationFrame(() => {
              if (!map.current) {
                return;
              }

              try {
                map.current.resize();
              } catch (error) {
                console.warn(
                  "Map resize skipped:",
                  error
                );
              }
            });
          })
        : null;

    if (resizeObserver && mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    const escapeHtml = (value) => {
      if (value === null || value === undefined) {
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
       COUNTRY NORMALIZATION
    ========================================================= */

    const normalizeCountry = (name) => {
      if (!name) {
        return "";
      }

      const normalized = String(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z]/g, "");

      const aliases = {
        usa: "unitedstatesofamerica",
        us: "unitedstatesofamerica",
        unitedstates: "unitedstatesofamerica",
        uae: "unitedarabemirates",
        dubai: "unitedarabemirates",
      };

      return aliases[normalized] || normalized;
    };

    /* =========================================================
       GEOJSON COUNTRY NAME
    ========================================================= */

    const getCountryName = (feature) => {
      return (
        feature?.properties?.ADMIN ||
        feature?.properties?.NAME ||
        feature?.properties?.name ||
        ""
      );
    };

    /* =========================================================
       COUNTRY BOUNDS
    ========================================================= */

    const getCountryBounds = (feature) => {
      if (!feature?.geometry) {
        return null;
      }

      const bounds = new LngLatBounds();

      const addCoordinates = (coordinates) => {
        if (!Array.isArray(coordinates)) {
          return;
        }

        if (
          typeof coordinates[0] === "number" &&
          typeof coordinates[1] === "number"
        ) {
          bounds.extend(coordinates);
          return;
        }

        coordinates.forEach((item) => {
          addCoordinates(item);
        });
      };

      addCoordinates(feature.geometry.coordinates);

      return bounds.isEmpty() ? null : bounds;
    };

    /* =========================================================
       CLOSE POPUP
    ========================================================= */

    const closePopup = () => {
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }
    };

    /* =========================================================
       CLEAR OFFICE HIGHLIGHTS
    ========================================================= */

    const clearOfficeHighlights = () => {
      officeMarkers.current.forEach((marker) => {
        const element = marker.getElement();

        if (!element) {
          return;
        }

        const image = element.querySelector("img");

        if (!image) {
          return;
        }

        image.classList.remove(
          "scale-[1.2]",
          "drop-shadow-2xl"
        );
      });
    };

    /* =========================================================
       CLEAR COUNTRY HIGHLIGHTS
    ========================================================= */

    const clearCountryHighlights = () => {
      countryMarkers.current.forEach((marker) => {
        const element = marker.getElement();

        if (!element) {
          return;
        }

        const image = element.querySelector("img");

        if (!image) {
          return;
        }

        image.classList.remove(
          "scale-[1.18]",
          "drop-shadow-2xl"
        );
      });
    };

    /* =========================================================
       CREATE WORLD LOCATION PIN
       Slightly reduced size
    ========================================================= */

    const createCountryMarker = () => {
      const element = document.createElement("div");

      element.className =
        "group relative block h-10 w-7 cursor-pointer";

      const image = document.createElement("img");

      image.src = pinIcon;
      image.alt = "Location";

      image.className =
        "block h-full w-full origin-bottom object-contain transition duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-xl";

      element.appendChild(image);

      return element;
    };

    /* =========================================================
       CREATE OFFICE LOCATION PIN
       Slightly reduced size
    ========================================================= */

    const createOfficeMarker = () => {
      const element = document.createElement("div");

      element.className =
        "group relative block h-10 w-7 cursor-pointer";

      const image = document.createElement("img");

      image.src = pinIcon;
      image.alt = "Office location";

      image.className =
        "block h-full w-full origin-bottom object-contain transition duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-xl";

      element.appendChild(image);

      return element;
    };

    /* =========================================================
       OFFICE CARD
    ========================================================= */

    const createOfficeCard = (location) => {
      const companyName =
        location.companyName?.trim() ||
        "Proliant Data";

      const country =
        location.country?.trim() || "";

      const address =
        location.address?.trim() || "";

      const phone =
        location.phone?.trim() || "";

      const email =
        location.email?.trim() ||
        "hr@proliantdatallc.com";

      return `
        <div
          class="
            w-80
            max-w-full
            overflow-hidden
            rounded-2xl
            bg-black
            text-white
            shadow-2xl
          "
        >

          <!-- CARD HEADER -->

          <div
            class="
              flex
              min-h-26.25
              w-full
              items-center
              justify-center
              overflow-hidden
              bg-white
              px-5
              py-3
            "
          >

            <img
              src="${proliantBlackLogo}"
              alt="Proliant Data"
              class="
                block
                h-auto
                max-h-15
                w-48
                max-w-full
                object-contain
                object-center
              "
            />

          </div>

          <!-- CARD BODY -->

          <div
            class="
              w-full
              bg-black
              px-7
              pb-6
              pt-7
            "
          >

            <h3
              class="
                m-0
                wrap-break-word
                text-xl
                font-bold
                leading-snug
                text-white
              "
            >
              ${escapeHtml(companyName)}
            </h3>

            <div
              class="
                mt-1
                text-sm
                leading-snug
                text-neutral-400
              "
            >
              ${escapeHtml(country)}
            </div>

            <!-- ADDRESS -->

            <div
              class="
                mt-5
                flex
                w-full
                items-stretch
                gap-3
              "
            >

              <div
                class="
                  w-1
                  shrink-0
                  self-stretch
                  rounded-sm
                  bg-[#EF3B3A]
                "
              ></div>

              <p
                class="
                  m-0
                  min-w-0
                  flex-1
                  wrap-break-word
                  text-sm
                  leading-relaxed
                  text-neutral-200
                "
              >
                ${escapeHtml(address)}
              </p>

            </div>

            <!-- ACTIONS -->

            <div
              class="
                mt-5
                w-full
              "
            >

              <!-- GET DIRECTIONS -->

              <button
                type="button"
                class="
                  group
                  flex
                  min-h-14
                  w-full
                  items-center
                  gap-3.5
                  rounded
                  border
                  border-transparent
                  bg-transparent
                  px-3
                  py-3
                  text-left
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  transition
                  duration-300
                  hover:bg-[#EF3B3A]/5
                  hover:text-[#EF3B3A]
                  focus:bg-transparent
                  focus:text-white
                  focus:outline-none
                  focus:ring-0
                "
                data-action="directions"
              >

                <span
                  class="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    leading-none
                    text-[#EF3B3A]
                  "
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="block h-5 w-5 -translate-y-[1px]"
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

                <span class="leading-none">
                  GET DIRECTIONS
                </span>

              </button>

              <!-- EMAIL US -->

              <a
                href="mailto:${escapeHtml(email)}"
                class="
                  mt-1
                  flex
                  min-h-14
                  w-full
                  items-center
                  gap-3.5
                  rounded
                  border
                  border-transparent
                  bg-transparent
                  px-1
                  py-3
                  text-left
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  no-underline
                  transition
                  duration-300
                  hover:bg-[#EF3B3A]/5
                  hover:text-[#EF3B3A]
                  focus:border-white
                  focus:outline-none
                  focus:ring-0
                "
                data-action="email"
              >

                <span
                  class="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    leading-none
                    text-[#EF3B3A]
                  "
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="block h-5 w-5"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path d="m3 7 9 6 9-6" />
                  </svg>

                </span>

                <span class="leading-none">
                  EMAIL US
                </span>

              </a>

              <!-- CONTACT US -->

              ${
                phone
                  ? `
                    <a
                      href="tel:${escapeHtml(phone)}"
                      class="
                        mt-1
                        flex
                        min-h-14
                        w-full
                        items-center
                        gap-3.5
                        rounded
                        border
                        border-transparent
                        bg-transparent
                        px-1
                        py-3
                        text-left
                        text-[13px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-white
                        no-underline
                        transition
                        duration-300
                        hover:bg-[#EF3B3A]/5
                        hover:text-[#EF3B3A]
                        focus:border-white
                        focus:outline-none
                        focus:ring-0
                      "
                      data-action="contact"
                    >

                      <span
                        class="
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          leading-none
                          text-[#EF3B3A]
                        "
                      >

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="block h-5 w-5 translate-y-[1px]"
                        >
                          <path
                            d="
                              M22 16.92v3
                              a2 2 0 0 1-2.18 2
                              19.79 19.79 0 0 1-8.63-3.07
                              19.5 19.5 0 0 1-6-6
                              19.79 19.79 0 0 1-3.07-8.67
                              A2 2 0 0 1 4.11 2h3
                              a2 2 0 0 1 2 1.72
                              12.84 12.84 0 0 0 .7 2.81
                              2 2 0 0 1-.45 2.11
                              L8.09 9.91
                              a16 16 0 0 0 6 6l1.27-1.27
                              a2 2 0 0 1 2.11-.45
                              12.84 12.84 0 0 0 2.81.7
                              A2 2 0 0 1 22 16.92Z
                            "
                          />
                        </svg>

                      </span>

                      <span class="leading-none">
                        CONTACT US
                      </span>

                    </a>
                  `
                  : ""
              }

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
      if (
        !map.current ||
        !mapContainer.current
      ) {
        return;
      }

      closePopup();

      const markerPoint =
        mapInstance.project(
          marker.getLngLat()
        );

      const mapWidth =
        mapContainer.current.clientWidth;

      const mapHeight =
        mapContainer.current.clientHeight;

      const isLeftSide =
        markerPoint.x < mapWidth / 2;

      let anchor;

      if (window.innerWidth < 768) {
        if (
          markerPoint.y >
          mapHeight * 0.62
        ) {
          anchor = "bottom";
        } else {
          anchor = isLeftSide
            ? "left"
            : "right";
        }
      } else {
        anchor = isLeftSide
          ? "left"
          : "right";
      }

      popup.current =
        new Popup({
          closeButton: false,
          closeOnClick: false,
          closeOnMove: false,
          maxWidth: "none",
          anchor,
          offset:
            window.innerWidth < 768
              ? 16
              : 22,
        })
          .setLngLat(marker.getLngLat())
          .setHTML(
            createOfficeCard(location)
          )
          .addTo(mapInstance);

      /* =======================================================
         OVERRIDE MAPLIBRE POPUP DEFAULTS
      ======================================================= */

      const popupElement =
        popup.current.getElement();

      if (popupElement) {
        const popupContent =
          popupElement.querySelector(
            ".maplibregl-popup-content"
          );

        if (popupContent) {
          popupContent.className =
            "maplibregl-popup-content !max-w-none !overflow-visible !bg-transparent !p-0 !shadow-none";
        }

        const popupTip =
          popupElement.querySelector(
            ".maplibregl-popup-tip"
          );

        if (popupTip) {
          popupTip.className =
            "maplibregl-popup-tip !hidden";
        }
      }

      /* =======================================================
         ACTION BUTTONS
      ======================================================= */

      const popupActions =
        popup.current.getElement();

      const setActiveAction = (activeElement) => {
        if (!popupActions) {
          return;
        }

        popupActions
          .querySelectorAll('[data-action]')
          .forEach((action) => {
            action.classList.remove(
              "border-white"
            );
            action.classList.add(
              "border-transparent"
            );
          });

        if (activeElement) {
          activeElement.classList.remove(
            "border-transparent"
          );
          activeElement.classList.add(
            "border-white"
          );
        }
      };

      const directionsButton =
        popupActions?.querySelector(
          '[data-action="directions"]'
        );

      if (directionsButton) {
        directionsButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            const destinationLatitude =
              Number(location.latitude);

            const destinationLongitude =
              Number(location.longitude);

            if (
              Number.isNaN(destinationLatitude) ||
              Number.isNaN(destinationLongitude)
            ) {
              alert(
                "Office location coordinates are not available."
              );

              return;
            }

            setActiveAction(
              directionsButton
            );

            if (!navigator.geolocation) {
              setActiveAction(null);

              alert(
                "Your browser does not support location services."
              );

              return;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLatitude =
                  position.coords.latitude;

                const userLongitude =
                  position.coords.longitude;

                const origin =
                  `${userLatitude},${userLongitude}`;

                const destination =
                  `${destinationLatitude},${destinationLongitude}`;

                const googleMapsUrl =
                  "https://www.google.com/maps/dir/" +
                  "?api=1" +
                  `&origin=${encodeURIComponent(origin)}` +
                  `&destination=${encodeURIComponent(destination)}` +
                  "&travelmode=driving";

                /* Open Google Maps in the SAME TAB */
                window.location.href = googleMapsUrl;
              },
              (error) => {
                setActiveAction(null);

                if (error.code === 1) {
                  alert(
                    "Location permission was denied. Please allow location access to get directions."
                  );
                } else if (error.code === 2) {
                  alert(
                    "Your current location could not be determined. Please try again."
                  );
                } else if (error.code === 3) {
                  alert(
                    "Location request timed out. Please try again."
                  );
                } else {
                  alert(
                    "Unable to get your current location. Please try again."
                  );
                }
              },
              {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 15000,
              }
            );
          }
        );
      }

      const emailButton =
        popupActions?.querySelector(
          '[data-action="email"]'
        );

      if (emailButton) {
        emailButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            setActiveAction(emailButton);

            const emailHref =
              emailButton.getAttribute("href");

            if (emailHref) {
              setTimeout(() => {
                window.location.href = emailHref;
              }, 80);
            }
          }
        );
      }

      const contactButton =
        popupActions?.querySelector(
          '[data-action="contact"]'
        );

      if (contactButton) {
        contactButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            setActiveAction(contactButton);

            const contactHref =
              contactButton.getAttribute("href");

            if (contactHref) {
              setTimeout(() => {
                window.location.href = contactHref;
              }, 80);
            }
          }
        );
      }
    };

    /* =========================================================
       MAP LOAD
    ========================================================= */

    mapInstance.on(
      "load",
      async () => {
        if (!map.current) {
          return;
        }

        try {
          /* =====================================================
             MAP COLOR THEME + ENGLISH LABELS

             Only the basemap styling is changed here.
             Pins, cards, directions and interactions stay the same.
          ===================================================== */

          const baseStyleLayers =
            mapInstance.getStyle()?.layers || [];

          baseStyleLayers.forEach((layer) => {
            try {
              /* ---------------------------------------------
                 MAP BACKGROUND / WATER
              --------------------------------------------- */

              if (layer.type === "background" &&
                  layer.layout?.visibility !== "none") {
                mapInstance.setPaintProperty(
                  layer.id,
                  "background-color",
                  "#2A2B2E"
                );
              }

              if (
                layer.type === "fill" &&
                layer.sourceLayer === "water"
              ) {
                mapInstance.setPaintProperty(
                  layer.id,
                  "fill-color",
                  "#24262A"
                );
              }

              if (
                layer.type === "line" &&
                layer.sourceLayer === "waterway"
              ) {
                mapInstance.setPaintProperty(
                  layer.id,
                  "line-color",
                  "#3A4148"
                );
              }

              /* ---------------------------------------------
                 COUNTRY / ADMINISTRATIVE BORDERS
              --------------------------------------------- */

              if (
                layer.type === "line" &&
                layer.sourceLayer === "boundary"
              ) {
                const isCountryBorder =
                  layer.id.toLowerCase().includes("country") ||
                  layer.id.toLowerCase().includes("disputed");

                mapInstance.setPaintProperty(
                  layer.id,
                  "line-color",
                  isCountryBorder
                    ? "#747C84"
                    : "#5F6870"
                );
              }

              /* ---------------------------------------------
                 ENGLISH-ONLY LABELS

                 No fallback to local-language name.
                 If an English name is unavailable, the label
                 is left empty instead of using a local name.
              --------------------------------------------- */

              if (
                layer.type === "symbol" &&
                layer.layout?.["text-field"]
              ) {
                mapInstance.setLayoutProperty(
                  layer.id,
                  "text-field",
                  [
                    "coalesce",
                    ["get", "name:en"],
                    "",
                  ]
                );

                const layerId =
                  layer.id.toLowerCase();

                let textColor = "#C6CBD0";

                if (layerId.includes("country")) {
                  textColor = "#FFFFFF";
                } else if (layerId.includes("city")) {
                  textColor = "#F3F4F5";
                } else if (layerId.includes("place")) {
                  textColor = "#D9DDE1";
                }

                if (
                  layer.paint &&
                  layer.paint["text-color"] !== undefined
                ) {
                  mapInstance.setPaintProperty(
                    layer.id,
                    "text-color",
                    textColor
                  );
                }

                if (
                  layer.paint &&
                  layer.paint["text-halo-color"] !== undefined
                ) {
                  mapInstance.setPaintProperty(
                    layer.id,
                    "text-halo-color",
                    "#17181A"
                  );
                }

                if (
                  layer.paint &&
                  layer.paint["text-halo-width"] !== undefined
                ) {
                  mapInstance.setPaintProperty(
                    layer.id,
                    "text-halo-width",
                    layerId.includes("country") ? 2 : 1.5
                  );
                }
              }
            } catch (error) {
              console.warn(
                "Map theme layer update skipped:",
                layer.id,
                error
              );
            }
          });

          if (window.innerWidth < 768) {
            mapInstance.fitBounds(
              [
                [-180, -60],
                [180, 80],
              ],
              {
                padding: 0,
                duration: 0,
                maxZoom: 0,
              }
            );
          }

          /* =====================================================
             LOAD COUNTRY GEOJSON
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

          if (!map.current) {
            return;
          }

          /* =====================================================
             COUNTRY SOURCE
          ===================================================== */

          if (
            !mapInstance.getSource(
              "countries"
            )
          ) {
            mapInstance.addSource(
              "countries",
              {
                type: "geojson",
                data: countryData,
              }
            );
          }

          /* =====================================================
             COUNTRY LAND COLOR

             Countries use a blue-gray tone while the surrounding
             map background remains dark charcoal. The layer is
             placed below the basemap line and label layers so
             borders, roads and labels remain visible.
          ===================================================== */

          if (
            !mapInstance.getLayer(
              "countries-theme-fill"
            )
          ) {
            const firstLineLayerId =
              mapInstance
                .getStyle()
                ?.layers
                ?.find((layer) =>
                  layer.type === "line"
                )
                ?.id;

            mapInstance.addLayer(
              {
                id: "countries-theme-fill",
                type: "fill",
                source: "countries",
                paint: {
                  "fill-color": "#68737D",
                  "fill-opacity": 0.90,
                  "fill-antialias": true,
                },
              },
              firstLineLayerId
            );
          }

          /* =====================================================
             COUNTRY CLICK LAYER
          ===================================================== */

          if (
            !mapInstance.getLayer(
              "countries-clickable"
            )
          ) {
            mapInstance.addLayer({
              id: "countries-clickable",
              type: "fill",
              source: "countries",
              paint: {
                "fill-color":
                  "#FFFFFF",
                "fill-opacity": 0,
              },
            });
          }

          /* =====================================================
             SELECTED COUNTRY FILL

             Red fill removed completely.
             Country remains transparent.
          ===================================================== */

          if (
            !mapInstance.getLayer(
              "selected-country-fill"
            )
          ) {
            mapInstance.addLayer({
              id: "selected-country-fill",
              type: "fill",
              source: "countries",
              filter: [
                "==",
                ["get", "ADMIN"],
                "",
              ],
              paint: {
                "fill-color":
                  "#FFFFFF",
                "fill-opacity": 0,
              },
            });
          }

          /* =====================================================
             SELECTED COUNTRY OUTLINE

             White outline replaced with a minimal soft-gray outline.
          ===================================================== */

          if (
            !mapInstance.getLayer(
              "selected-country-outline"
            )
          ) {
            mapInstance.addLayer({
              id: "selected-country-outline",
              type: "line",
              source: "countries",
              filter: [
                "==",
                ["get", "ADMIN"],
                "",
              ],
              paint: {
                "line-color":
                  "#AEB6BE",
                "line-width": 1,
                "line-opacity": 0.45,
              },
            });
          }

          /* =====================================================
             LOAD LOCATIONS FROM BACKEND API
          ===================================================== */

          let locations = [];

            try {
              const locationsResponse = await fetch(
                `${API_BASE_URL}/locations`
              );

              if (!locationsResponse.ok) {
                throw new Error(
                  `Locations API failed with status ${locationsResponse.status}`
                );
              }

              const locationsResult =
                await locationsResponse.json();

              if (!map.current) {
                return;
              }

              if (
                locationsResult?.success !== true ||
                !Array.isArray(locationsResult?.locations)
              ) {
                throw new Error(
                  "Invalid locations response from backend"
                );
              }

              locations = locationsResult.locations;

              console.log(
                "Proliant locations from API:",
                locations
              );
            } catch (error) {
              console.error(
                "Failed to load Proliant locations:",
                error
              );

              locations = [];
            }

          /* =====================================================
             VALID LOCATIONS
          ===================================================== */

          const validLocations =
            locations.filter(
              (location) => {
                const latitude =
                  Number(
                    location.latitude
                  );

                const longitude =
                  Number(
                    location.longitude
                  );

                return (
                  !Number.isNaN(
                    latitude
                  ) &&
                  !Number.isNaN(
                    longitude
                  )
                );
              }
            );

          /* =====================================================
             GROUP LOCATIONS BY COUNTRY
          ===================================================== */

          const locationsByCountry =
            {};

          validLocations.forEach(
            (location) => {
              const country =
                location.country?.trim();

              if (!country) {
                return;
              }

              const key =
                normalizeCountry(
                  country
                );

              if (
                !locationsByCountry[
                  key
                ]
              ) {
                locationsByCountry[
                  key
                ] = [];
              }

              locationsByCountry[
                key
              ].push(location);
            }
          );

          /* =====================================================
             FIND COUNTRY FEATURE
          ===================================================== */

          const getCountryFeature =
            (countryName) => {
              const countryKey =
                normalizeCountry(
                  countryName
                );

              return (
                countryData.features?.find(
                  (feature) =>
                    normalizeCountry(
                      getCountryName(
                        feature
                      )
                    ) === countryKey
                ) || null
              );
            };

          /* =====================================================
             WORLD LOCATIONS

             EXACTLY:
             USA
             Germany
             India
             UAE
          ===================================================== */

          const worldLocations = Object.values(
            locationsByCountry
          ).map(
            (countryLocations) =>
              countryLocations[0]
          );

          /* =====================================================
             INITIAL COUNTRY HIGHLIGHTS

             No country fill/highlight at startup.
          ===================================================== */

          if (
            mapInstance.getLayer(
              "selected-country-fill"
            )
          ) {
            mapInstance.setFilter(
              "selected-country-fill",
              [
                "==",
                ["get", "ADMIN"],
                "",
              ]
            );
          }

          if (
            mapInstance.getLayer(
              "selected-country-outline"
            )
          ) {
            mapInstance.setFilter(
              "selected-country-outline",
              [
                "==",
                ["get", "ADMIN"],
                "",
              ]
            );
          }

          /* =====================================================
             CREATE WORLD LOCATION PINS

             IMPORTANT:
             World pins use EXACT CSV coordinates.
          ===================================================== */

          worldLocations.forEach(
            (location) => {
              if (!map.current) {
                return;
              }

              const countryName =
                location.country?.trim();

              if (!countryName) {
                return;
              }

              const countryKey =
                normalizeCountry(
                  countryName
                );

              const countryFeature =
                getCountryFeature(
                  countryName
                );

              if (!countryFeature) {
                console.warn(
                  "Country not found in GeoJSON:",
                  countryName
                );

                return;
              }

              const latitude =
                Number(
                  location.latitude
                );

              const longitude =
                Number(
                  location.longitude
                );

              if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)
              ) {
                return;
              }

              const element =
                createCountryMarker();

              const marker =
                new Marker({
                  element,
                  anchor: "bottom",
                })
                  .setLngLat([
                    longitude,
                    latitude,
                  ])
                  .addTo(mapInstance);

              marker.__countryName =
                countryName;

              marker.__countryKey =
                countryKey;

              marker.__countryFeature =
                countryFeature;

              marker.__countryLocations =
                locationsByCountry[
                  countryKey
                ] || [location];

              /* =================================================
                 WORLD PIN CLICK
              ================================================= */

              element.addEventListener(
                "click",
                (event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (!map.current) {
                    return;
                  }

                  const country =
                    marker.__countryName;

                  const feature =
                    marker.__countryFeature;

                  const countryLocations =
                    marker.__countryLocations;

                  selectedCountry.current =
                    country;

                  level.current =
                    "country";

                  clearCountryHighlights();
                  clearOfficeHighlights();

                  const image =
                    element.querySelector(
                      "img"
                    );

                  if (image) {
                    image.classList.add(
                      "scale-[1.18]",
                      "drop-shadow-2xl"
                    );
                  }

                  closePopup();

                  /* =============================================
                     HIGHLIGHT COUNTRY
                  ============================================= */

                  const geoCountryName =
                    getCountryName(
                      feature
                    );

                  if (
                    mapInstance.getLayer(
                      "selected-country-fill"
                    )
                  ) {
                    mapInstance.setFilter(
                      "selected-country-fill",
                      [
                        "==",
                        [
                          "get",
                          "ADMIN",
                        ],
                        geoCountryName,
                      ]
                    );
                  }

                  if (
                    mapInstance.getLayer(
                      "selected-country-outline"
                    )
                  ) {
                    mapInstance.setFilter(
                      "selected-country-outline",
                      [
                        "==",
                        [
                          "get",
                          "ADMIN",
                        ],
                        geoCountryName,
                      ]
                    );
                  }

                  /* =============================================
                     HIDE WORLD PINS
                  ============================================= */

                  countryMarkers.current.forEach(
                    (countryMarker) => {
                      const countryElement =
                        countryMarker.getElement();

                      if (countryElement) {
                        countryElement.style.display =
                          "none";
                      }
                    }
                  );

                  /* =============================================
                     SHOW SELECTED COUNTRY OFFICE PINS
                  ============================================= */

                  officeMarkers.current.forEach(
                    (officeMarker) => {
                      const officeElement =
                        officeMarker.getElement();

                      if (!officeElement) {
                        return;
                      }

                      const officeLocation =
                        officeMarker
                          .__proliantLocation;

                      const officeCountry =
                        officeLocation?.country;

                      if (
                        normalizeCountry(
                          officeCountry
                        ) === countryKey
                      ) {
                        officeElement.style.display =
                          "block";
                      } else {
                        officeElement.style.display =
                          "none";
                      }
                    }
                  );

                  /* =============================================
                     COUNTRY ZOOM

                     Center on EXACT office coordinates
                  ============================================= */

                  const latitude =
                    Number(
                      location.latitude
                    );

                  const longitude =
                    Number(
                      location.longitude
                    );

                  automaticTransition.current =
                    true;

                  mapInstance.flyTo({
                    center: [
                      longitude,
                      latitude,
                    ],
                    zoom:
                      window.innerWidth < 768
                        ? 5
                        : 5.2,
                    speed: 0.85,
                    curve: 1.35,
                    essential: true,
                  });

                  mapInstance.once(
                    "moveend",
                    () => {
                      if (!map.current) {
                        return;
                      }

                      automaticTransition.current =
                        false;
                    }
                  );
                }
              );

              countryMarkers.current.push(
                marker
              );
            }
          );

          /* =====================================================
             CREATE OFFICE LOCATION PINS

             EXACT CSV COORDINATES
          ===================================================== */

          validLocations.forEach(
            (location) => {
              if (!map.current) {
                return;
              }

              const latitude =
                Number(
                  location.latitude
                );

              const longitude =
                Number(
                  location.longitude
                );

              const element =
                createOfficeMarker();

              const marker =
                new Marker({
                  element,
                  anchor: "bottom",
                })
                  .setLngLat([
                    longitude,
                    latitude,
                  ])
                  .addTo(mapInstance);

              marker.__proliantLocation =
                location;

              element.style.display =
                "none";

              /* =================================================
                 OFFICE PIN HOVER
              ================================================= */

              element.addEventListener(
                "mouseenter",
                () => {
                  if (!map.current) {
                    return;
                  }

                  const officeCountry =
                    location.country;

                  if (
                    selectedCountry.current &&
                    normalizeCountry(
                      officeCountry
                    ) !==
                      normalizeCountry(
                        selectedCountry.current
                      )
                  ) {
                    return;
                  }

                  mapInstance
                    .getCanvas()
                    .style.cursor =
                    "pointer";

                  clearOfficeHighlights();

                  const image =
                    element.querySelector(
                      "img"
                    );

                  if (image) {
                    image.classList.add(
                      "scale-[1.2]",
                      "drop-shadow-2xl"
                    );
                  }

                  showOfficeCard(
                    location,
                    marker
                  );
                }
              );

              /* =================================================
                 OFFICE PIN CLICK
              ================================================= */

              element.addEventListener(
                "click",
                (event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (!map.current) {
                    return;
                  }

                  const officeCountry =
                    location.country;

                  if (
                    selectedCountry.current &&
                    normalizeCountry(
                      officeCountry
                    ) !==
                      normalizeCountry(
                        selectedCountry.current
                      )
                  ) {
                    return;
                  }

                  level.current =
                    "office";

                  clearOfficeHighlights();

                  const image =
                    element.querySelector(
                      "img"
                    );

                  if (image) {
                    image.classList.add(
                      "scale-[1.2]",
                      "drop-shadow-2xl"
                    );
                  }

                  closePopup();

                  automaticTransition.current =
                    true;

                  mapInstance.flyTo({
                    center:
                      marker.getLngLat(),
                    zoom:
                      window.innerWidth < 768
                        ? 12
                        : 13,
                    speed: 0.85,
                    curve: 1.35,
                    essential: true,
                  });

                  mapInstance.once(
                    "moveend",
                    () => {
                      if (!map.current) {
                        return;
                      }

                      automaticTransition.current =
                        false;

                      showOfficeCard(
                        location,
                        marker
                      );
                    }
                  );
                }
              );

              /* =================================================
                 OFFICE PIN LEAVE
              ================================================= */

              element.addEventListener(
                "mouseleave",
                () => {
                  if (!map.current) {
                    return;
                  }

                  mapInstance
                    .getCanvas()
                    .style.cursor =
                    "";
                }
              );

              officeMarkers.current.push(
                marker
              );
            }
          );

          /* =====================================================
             WORLD INITIAL STATE
          ===================================================== */

          countryMarkers.current.forEach(
            (marker) => {
              const element =
                marker.getElement();

              if (element) {
                element.style.display =
                  "block";
              }
            }
          );

          officeMarkers.current.forEach(
            (marker) => {
              const element =
                marker.getElement();

              if (element) {
                element.style.display =
                  "none";
              }
            }
          );

          /* =====================================================
             RESET TO INITIAL WORLD STATE
          ===================================================== */

          const resetToWorldState = (
            restoreView = false
          ) => {
            if (!map.current) {
              return;
            }

            level.current = "world";
            selectedCountry.current = null;

            clearCountryHighlights();
            clearOfficeHighlights();
            closePopup();

            /* =============================================
               REMOVE SELECTED COUNTRY HIGHLIGHT
            ============================================= */

            if (
              mapInstance.getLayer(
                "selected-country-fill"
              )
            ) {
              mapInstance.setFilter(
                "selected-country-fill",
                [
                  "==",
                  ["get", "ADMIN"],
                  "",
                ]
              );
            }

            if (
              mapInstance.getLayer(
                "selected-country-outline"
              )
            ) {
              mapInstance.setFilter(
                "selected-country-outline",
                [
                  "==",
                  ["get", "ADMIN"],
                  "",
                ]
              );
            }

            /* =============================================
               SHOW ALL 4 COUNTRY PINS
            ============================================= */

            countryMarkers.current.forEach(
              (marker) => {
                const element =
                  marker.getElement();

                if (element) {
                  element.style.display =
                    "block";
                }
              }
            );

            /* =============================================
               HIDE ALL OFFICE PINS
            ============================================= */

            officeMarkers.current.forEach(
              (marker) => {
                const element =
                  marker.getElement();

                if (element) {
                  element.style.display =
                    "none";
                }
              }
            );

            /* =============================================
               RESET MAP VIEW
            ============================================= */

            if (restoreView) {
              automaticTransition.current =
                true;

              mapInstance.easeTo({
                center:
                  initialView.current
                    .center,
                zoom:
                  initialView.current.zoom,
                duration: 500,
                essential: true,
              });

              mapInstance.once(
                "moveend",
                () => {
                  automaticTransition.current =
                    false;
                }
              );
            }
          };

          /* =====================================================
             COUNTRY LAYER HOVER
          ===================================================== */

          mapInstance.on(
            "mouseenter",
            "countries-clickable",
            () => {
              if (!map.current) {
                return;
              }

              if (
                level.current !==
                "world"
              ) {
                return;
              }

              mapInstance
                .getCanvas()
                .style.cursor =
                "pointer";
            }
          );

          mapInstance.on(
            "mouseleave",
            "countries-clickable",
            () => {
              if (!map.current) {
                return;
              }

              mapInstance
                .getCanvas()
                .style.cursor =
                "";
            }
          );

          /* =====================================================
             MAP ZOOM CHANGE

             Country / office → world reset
          ===================================================== */

          mapInstance.on(
            "zoomend",
            () => {
              if (
                !map.current ||
                automaticTransition.current
              ) {
                return;
              }

              const currentZoom =
                mapInstance.getZoom();

              if (
                level.current !==
                  "world" &&
                currentZoom <= 2.2
              ) {
                resetToWorldState(true);
              }
            }
          );

          /* =====================================================
             MAP MOVE START
          ===================================================== */

          mapInstance.on(
            "movestart",
            () => {
              if (
                popup.current &&
                !automaticTransition.current
              ) {
                closePopup();
              }
            }
          );

          /* =====================================================
             MAP BACKGROUND CLICK

             Clicking empty map space closes the office card.
             Marker clicks stop propagation, so selecting another
             location still works normally.
          ===================================================== */

          mapInstance.on(
            "click",
            (event) => {
              if (!map.current || !popup.current) {
                return;
              }

              const clickedElement =
                event.originalEvent?.target;

              if (
                clickedElement?.closest?.(
                  ".maplibregl-popup"
                )
              ) {
                return;
              }

              closePopup();
              clearOfficeHighlights();

              mapInstance
                .getCanvas()
                .style.cursor = "";
            }
          );

          /* =====================================================
             INITIAL SAFE RESIZE
          ===================================================== */

          requestAnimationFrame(() => {
            if (!map.current) {
              return;
            }

            try {
              map.current.resize();
            } catch (error) {
              console.warn(
                "Initial map resize skipped:",
                error
              );
            }
          });

          /* =====================================================
             DELAYED SAFE RESIZE
          ===================================================== */

          setTimeout(() => {
            if (!map.current) {
              return;
            }

            try {
              map.current.resize();
            } catch (error) {
              console.warn(
                "Delayed map resize skipped:",
                error
              );
            }
          }, 300);

          setTimeout(() => {
            if (!map.current) {
              return;
            }

            try {
              map.current.resize();
            } catch (error) {
              console.warn(
                "Final map resize skipped:",
                error
              );
            }
          }, 1000);
        } catch (error) {
          console.error(
            "Locations map initialization failed:",
            error
          );
        }
      }
    );

    /* =========================================================
       MAP ERROR
    ========================================================= */

    mapInstance.on(
      "error",
      (event) => {
        if (event?.error) {
          console.warn(
            "MapLibre map error:",
            event.error
          );
        }
      }
    );

    /* =========================================================
       WINDOW RESIZE
    ========================================================= */

    const handleResize = () => {
      if (!map.current) {
        return;
      }

      requestAnimationFrame(() => {
        if (!map.current) {
          return;
        }

        try {
          map.current.resize();
        } catch (error) {
          console.warn(
            "Window map resize skipped:",
            error
          );
        }
      });
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "orientationchange",
      handleResize
    );

    /* =========================================================
       CLEANUP
    ========================================================= */

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "orientationchange",
        handleResize
      );

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      closePopup();

      countryMarkers.current.forEach(
        (marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn(
              "Country marker cleanup skipped:",
              error
            );
          }
        }
      );

      officeMarkers.current.forEach(
        (marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn(
              "Office marker cleanup skipped:",
              error
            );
          }
        }
      );

      countryMarkers.current = [];
      officeMarkers.current = [];

      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.warn(
            "Map cleanup skipped:",
            error
          );
        }

        map.current = null;
      }

      level.current = "world";
      selectedCountry.current = null;
      automaticTransition.current = false;
    };
  }, []);

  /* ===========================================================
     SECTION UI
  =========================================================== */

  return (
    <section
      id="locations"
      className="
        relative
        overflow-hidden
        bg-black
        py-12
        text-white
      "
    >
      {/* =======================================================
          MAP
      ======================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-0
          sm:px-4
          md:px-6
          lg:px-8
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-none
            border-y
            border-white/10
            bg-neutral-950
            sm:rounded-2xl
            sm:border
          "
        >
          <div
            ref={mapContainer}
            className="
              h-75
              w-full
              sm:h-100
              md:h-135
              xl:h-155
            "
          />

          {/* ===================================================
              SUBTLE MAP OVERLAY
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              bg-linear-to-b
              from-black/10
              via-transparent
              to-black/20
            "
          />

        </div>
      </div>
    </section>
  );
};

export default LocationsMap;
