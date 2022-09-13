//= require leaflet

L.Control.MultiMeasure = L.Control.extend({
  _className: "leaflet-control-multi-measure",
  options: {
    units: {},
    position: "topleft",
    primaryLengthUnit: "feet",
  },
  initialize: function (options) {
    L.setOptions(this, options);
    this.options.units = L.extend({}, units, this.options.units);
  },
  onAdd: function (map) {
    this._map = map;
    this._layer = L.featureGroup().addTo(this._map);
    this._tempLayer = L.featureGroup().addTo(this._layer);
    this._tempPoints = L.featureGroup().addTo(this._layer);
    this._tempArea = L.polygon([], { color: "blue", stroke: false }).addTo(
      this._tempLayer
    );
    this._tempLine = L.polyline([]).addTo(this._tempLayer);
    this._subcursor = L.circleMarker(map.getCenter(), {
      color: "transparent",
    }).addTo(this._tempLayer);
    this._layerHistory = [];

    const container = (this._container = L.DomUtil.create(
      "div",
      `${this._className} leaflet-bar`
    ));
    container.innerHTML = mainTemplate(this);

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const pointStart = container.querySelector("#start-point");
    const lineStart = container.querySelector("#start-line");
    const areaStart = container.querySelector("#start-area");

    const toggle = container.querySelector(".measure-toggle");
    const cancel = container.querySelector(".link#cancel");
    const delete_all = container.querySelector(".link#delete-all");
    const undo = container.querySelector(".link#undo-last");
    const save = container.querySelector(".link#save");
    const close = container.querySelector("#close-icon");
    this._save = save;
    this._edit_controls = container.querySelectorAll(".link.existing");
    const controls = container.querySelector(".leaflet-multi-measure-controls");
    const outputs = container.querySelector(".measure-output");
    const measure_start_menu = controls.querySelector(".measure-start-menu");
    const measure_actions = controls.querySelector(".measure-actions");
    this._toggle = toggle;
    this._cancel = cancel;
    this._controls = controls;
    this._outputs = outputs;
    this._measure_start_menu = measure_start_menu;
    this._measure_actions = measure_actions;
    this._collapse();

    L.DomEvent.on(container, "mouseover", L.DomEvent.stop);
    L.DomEvent.on(container, "mouseover", function (e) {
      if (this._subcursor) {
        this._subcursor.off("click mousemove");
      }
    });
    L.DomEvent.on(container, "mouseout", function (e) {
      let type = this._measure_type;
      if (type == "start-point") {
        this._subcursor.on("click", this._placeMarker, this);
      }
      if (type == "start-line" || type == "start-area") {
        this._subcursor.on("click", this._placeMarker, this);
      }
    });

    L.DomEvent.on(toggle, "click", L.DomEvent.stop);
    L.DomEvent.on(toggle, "click", this._expand, this);
    L.DomEvent.on(close, "click", L.DomEvent.stop);
    L.DomEvent.on(close, "click", this._collapse, this);
    L.DomEvent.on(pointStart, "click", L.DomEvent.stop);
    L.DomEvent.on(pointStart, "click", this._measure, this);
    L.DomEvent.on(lineStart, "click", L.DomEvent.stop);
    L.DomEvent.on(lineStart, "click", this._measure, this);
    L.DomEvent.on(areaStart, "click", L.DomEvent.stop);
    L.DomEvent.on(areaStart, "click", this._measure, this);

    L.DomEvent.on(cancel, "click", L.DomEvent.stop);
    L.DomEvent.on(cancel, "click", this._backToMenu, this);
    L.DomEvent.on(save, "click", L.DomEvent.stop);
    L.DomEvent.on(save, "click", this._saveMeasure, this);
    L.DomEvent.on(delete_all, "click", L.DomEvent.stop);
    L.DomEvent.on(delete_all, "click", this._clearAll, this);
    L.DomEvent.on(undo, "click", L.DomEvent.stop);
    L.DomEvent.on(undo, "click", this._undoLast, this);
    L.DomEvent.on(undo, "mouseover", this._highlightLast, this);
    L.DomEvent.on(undo, "mouseout", this._unHighlightLast, this);

    return this._container;
  },
  _unHighlightLast: function () {
    let last_layer = this._layerHistory[this._layerHistory.length - 1];
    if (last_layer == undefined) return;

    if (this._layer.hasLayer(last_layer)) {
      this._layer.getLayer(last_layer).setStyle({ color: "green" });
    }
  },
  _highlightLast: function () {
    let last_layer = this._layerHistory[this._layerHistory.length - 1];
    if (last_layer == undefined) return;
    if (this._layer.hasLayer(last_layer)) {
      this._layer.getLayer(last_layer).setStyle({ color: "red" });
    }
  },
  _undoLast: function () {
    var length = this._layerHistory.length - 1;
    this._layer.removeLayer(this._layerHistory[length]);
    this._layerHistory.pop();
    this._handleEditControls();
    this._highlightLast();
  },
  _clearAll: function () {
    this._layer.clearLayers();
    this._tempLayer.addTo(this._layer).clearLayers();
    this._tempPoints.addTo(this._layer).clearLayers();
    this._tempLayer.clearLayers();
    this._tempArea.addTo(this._tempLayer);
    this._tempLine.setLatLngs([]);
    this._tempArea.setLatLngs([]);
    this._subcursor.addTo(this._tempLayer);
    this._layerHistory = [];
    this._handleEditControls();
  },
  onRemove: function () {
    this._map.removeLayer(this._layer);
  },
  _expand: function () {
    this._toggle.classList.add("measure-hidden");
    this._controls.classList.remove("measure-hidden");
    this._outputs.classList.add("measure-hidden");
    this._measure_actions.classList.add("measure-hidden");

    this._handleEditControls();
  },
  _handleEditControls: function () {
    if (this._layerHistory.length < 1) {
      this._edit_controls.forEach(function (ele) {
        ele.classList.add("measure-hidden");
      });
    } else {
      this._edit_controls.forEach(function (ele) {
        ele.classList.remove("measure-hidden");
      });
    }
  },
  _collapse: function () {
    this._toggle.classList.remove("measure-hidden");
    this._controls.classList.add("measure-hidden");
    this._outputs.classList.add("measure-hidden");
    this._measure_actions.classList.add("measure-hidden");
    this._measure_start_menu.classList.remove("measure-hidden");
    this._tempLayer.remove(this._subcursor);
  },
  _measure: function (evt) {
    this._measure_type = evt.target.id;
    this._subcursor.addTo(map);
    this._tempLayer.addTo(this._map);
    L.DomEvent.off(this._container, "click", this._collapse, this);
    this._enableMeasureView();
  },
  _enableMeasureView: function () {
    switch (this._measure_type) {
      case "start-point":
        this._measure_start_menu.classList.add("measure-hidden");
        this._outputs.classList.remove("measure-hidden");
        this._measure_actions.classList.remove("measure-hidden");
        this._subcursor.on("click", this._placeMarker, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = pointStartTemplate();
        break;
      case "start-line":
        this._measure_start_menu.classList.add("measure-hidden");
        this._outputs.classList.remove("measure-hidden");
        this._measure_actions.classList.remove("measure-hidden");
        this._subcursor.on("click", this._placeLinePoint, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = lineStartTemplate();
        break;
      case "start-area":
        this._measure_start_menu.classList.add("measure-hidden");
        this._outputs.classList.remove("measure-hidden");
        this._measure_actions.classList.remove("measure-hidden");
        this._subcursor.on("click", this._placeLinePoint, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = areaStartTemplate();
        break;
    }
  },
  _backToMenu: function () {
    this._controls.removeAttribute("style");
    this._measure_start_menu.classList.remove("measure-hidden");
    this._measure_actions.classList.add("measure-hidden");
    this._outputs.classList.add("measure-hidden");
    this._handleEditControls();

    this._subcursor.off("click", this._placeMarker, this);
    this._subcursor.off("click", this._placeLinePoint, this);
    this._map.off("mousemove", this._updateSubCursorPos, this);
    this._tempLayer.clearLayers();
    this._tempArea.addTo(this._tempLayer);
    this._tempLine.setLatLngs([]);
    this._tempArea.setLatLngs([]);
    this._subcursor.addTo(this._tempLayer);
    this._tempPoints.clearLayers();
    this._subcursor.off("click");
    this._map.off("mousemove", this._updateSubCursorPos, this);
    L.DomEvent.on(this._container, "click", this._collapse, this);
    this._save.classList.add("measure-hidden");
  },
  _updateSubCursorPos: function (evt) {
    if (!this._subcursor) {
      this._subcursor = L.circleMarker(evt.latlng, { opacity: 1.0 }).addTo(
        this._tempLayer
      );
    }
    if (!this._tempLayer.hasLayer(this._subcursor)) {
      this._subcursor.addTo(this._tempLayer);
    }
    this._subcursor.setLatLng(evt.latlng);
    this._subcursor.setStyle({ color: "blue", radius: 6 });
  },
  _placeMarker: function (evt) {
    if (!this._tempMarker) {
      this._tempMarker = new L.CircleMarker(evt.latlng, { radius: 6 }).addTo(
        this._tempLayer
      );
    }
    this._tempMarker.addTo(this._tempLayer);
    this._tempMarker.setLatLng(evt.latlng);
    this._save.classList.remove("measure-hidden");
    // Update Output Template
    this._outputs.innerHTML = pointResultsTemplate(evt.latlng);
  },
  _placeLinePoint: function (evt) {
    L.circleMarker(evt.latlng, { radius: 6 }).addTo(this._tempPoints);
    if (!this._tempLine) {
      this._tempLine = new L.Polyline([evt.latlng]);
    } else {
      this._tempLine.addLatLng(evt.latlng);
    }

    if (!this._tempLayer.hasLayer(this._tempLine)) {
      this._tempLine.addTo(this._tempLayer);
    }
    var line_parts = this._tempLine.toGeoJSON().geometry.coordinates;
    if (this._measure_type == "start-line" && line_parts.length > 1) {
      var line = turf.lineString(line_parts);
      var length = turf.length(line, { units: "miles" });
      this._save.classList.remove("measure-hidden");
      this._outputs.innerHTML = lineResultsTemplate(length);
    }
    if (this._measure_type == "start-area" && line_parts.length > 2) {
      var temp_parts = line_parts;
      temp_parts.push(temp_parts[0]);
      var polygon = turf.polygon([temp_parts]);
      var area = turf.area(polygon);
      var miles = area / 2589988.11;
      this._save.classList.remove("measure-hidden");
      this._outputs.innerHTML = areaResultsTemplate(miles);
      if (this._tempArea == undefined) {
        this._tempArea = L.polygon(line_parts, {
          color: "red",
          stroke: false,
        }).addTo(this._tempLayer);
      }
      this._tempArea.setLatLngs(this._tempLine.getLatLngs());
    }
  },
  _saveMeasure: function () {
    this._save.classList.add("measure-hidden");

    switch (this._measure_type) {
      case "start-point":
        var coords = this._tempMarker.getLatLng();
        var marker = L.circleMarker(coords, {
          color: "green",
          radius: 6,
        }).addTo(this._layer);
        marker.bindPopup(pointOutputTemplate(coords)).openPopup();
        this._layerHistory.push(marker._leaflet_id);
        this._tempLayer.clearLayers();
        this._subcursor.addTo(this._tempLayer);
        this._outputs.innerHTML = pointStartTemplate();
        break;
      case "start-line":
        var path = L.featureGroup();
        this._tempPoints.getLayers().forEach((lyr) => {
          L.circleMarker(lyr.getLatLng(), { color: "green", radius: 6 }).addTo(
            path
          );
        });
        var line_parts = this._tempLine.toGeoJSON().geometry.coordinates;
        var line = turf.lineString(line_parts);
        var length = turf.length(line, { units: "miles" });
        var polyline = L.polyline(this._tempLine.getLatLngs(), {
          color: "green",
        }).addTo(path);
        path.addTo(this._layer);
        polyline.bindPopup(outputTemplate(length, "Length")).openPopup();
        this._layerHistory.push(path._leaflet_id);
        this._tempPoints.clearLayers();
        this._tempLine.setLatLngs([]);
        this._outputs.innerHTML = lineStartTemplate();
        break;
      case "start-area":
        var path = L.featureGroup();
        this._tempPoints.getLayers().forEach((lyr) => {
          L.circleMarker(lyr.getLatLng(), { color: "green", radius: 6 }).addTo(
            path
          );
        });
        var line_parts = this._tempLine.toGeoJSON().geometry.coordinates;
        line_parts.push(line_parts[0]);
        var area = turf.area(turf.polygon([line_parts])) / 2589988.11;
        this._outputs.innerHTML = areaStartTemplate(area);

        var polyline = L.polygon(this._tempLine.getLatLngs(), {
          color: "green",
        }).addTo(path);
        path.addTo(this._layer);
        polyline.bindPopup(areaOutputTemplate(area)).openPopup();
        this._layerHistory.push(path._leaflet_id);
        this._tempPoints.clearLayers();
        this._tempLine.setLatLngs([]);
        break;
    }
  },
});

L.control.multiMeasure = function (options) {
  return new L.Control.MultiMeasure(options);
};
