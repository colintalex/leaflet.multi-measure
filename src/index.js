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

    L.DomEvent.on(toggle, "click", L.DomEvent.stop);
    L.DomEvent.on(toggle, "click", this._expand, this);
    L.DomEvent.on(controls, "click", L.DomEvent.stop);
    L.DomEvent.on(controls, "click", this._collapse, this);
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

    return this._container;
  },
  _undoLast: function () {
    var length = this._layerHistory.length - 1;
    this._layer.removeLayer(this._layerHistory[length]);
    this._layerHistory.pop();
    this._handleEditControls();
  },
  _clearAll: function () {
    this._layer.clearLayers();
    this._tempLayer.clearLayers().addTo(this._layer);
    this._tempPoints.clearLayers().addTo(this._layer);
    this._layerHistory = [];
    this._handleEditControls();
  },
  onRemove: function () {
    this._map.removeLayer(this._layer);
  },
  _expand: function () {
    // hide svg
    // show controls
    this._toggle.setAttribute("style", "display:none;");
    this._controls.removeAttribute("style");
    this._outputs.setAttribute("style", "display:none;");
    this._measure_actions.setAttribute("style", "display:none;");

    this._handleEditControls();
  },
  _handleEditControls: function () {
    if (this._layerHistory.length < 1) {
      this._edit_controls.forEach(function (ele) {
        ele.setAttribute("style", "display:none;");
      });
    } else {
      this._edit_controls.forEach(function (ele) {
        ele.removeAttribute("style");
      });
    }
  },
  _collapse: function () {
    this._toggle.removeAttribute("style");
    this._controls.setAttribute("style", "display:none;");
    this._outputs.setAttribute("style", "display:none;");
    this._measure_actions.setAttribute("style", "display:none;");
    this._measure_start_menu.removeAttribute("style");
  },
  _measure: function (evt) {
    this._measure_type = evt.target.id;
    this._enableMeasureView();
  },
  _enableMeasureView: function () {
    switch (this._measure_type) {
      case "start-point":
        this._measure_start_menu.setAttribute("style", "display:none;");
        this._outputs.removeAttribute("style");
        this._measure_actions.removeAttribute("style");
        this._subcursor.on("click", this._placeMarker, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = pointStartTemplate();
        break;
      case "start-line":
        this._measure_start_menu.setAttribute("style", "display:none;");
        this._outputs.removeAttribute("style");
        this._measure_actions.removeAttribute("style");
        this._subcursor.on("click", this._placeLinePoint, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = lineStartTemplate();
        break;
      case "start-area":
        this._measure_start_menu.setAttribute("style", "display:none;");
        this._outputs.removeAttribute("style");
        this._measure_actions.removeAttribute("style");
        this._subcursor.on("click", this._placeLinePoint, this);
        this._map.on("mousemove", this._updateSubCursorPos, this);
        this._outputs.innerHTML = areaStartTemplate();
        break;
    }
  },
  _backToMenu: function () {
    this._controls.removeAttribute("style");
    this._measure_start_menu.removeAttribute("style");
    this._measure_actions.setAttribute("style", "display:none;");
    this._outputs.setAttribute("style", "display:none;");
    this._handleEditControls();

    this._subcursor.off("click", this._placeMarker, this);
    this._subcursor.off("click", this._placeLinePoint, this);
    this._map.off("mousemove", this._updateSubCursorPos, this);
    this._tempLayer.clearLayers();
    this._subcursor.addTo(this._tempLayer);
    this._tempPoints.clearLayers();
  },
  _startPoint: function () {},
  _updateSubCursorPos: function (evt) {
    if (!this._subcursor) {
      this._subcursor = L.circleMarker(evt.latlng, { opacity: 1.0 }).addTo(
        this._tempLayer
      );
    } else {
      this._subcursor.setLatLng(evt.latlng);
    }
  },
  _placeMarker: function (evt) {
    if (!this._tempMarker) {
      this._tempMarker = new L.CircleMarker(evt.latlng).addTo(this._tempLayer);
    }
    this._tempMarker.addTo(this._tempLayer);
    this._tempMarker.setLatLng(evt.latlng);

    // Update Output Template
    this._outputs.innerHTML = pointResultsTemplate(evt.latlng);
  },
  _placeLinePoint: function (evt) {
    L.circleMarker(evt.latlng).addTo(this._tempPoints);
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
      this._outputs.innerHTML = lineResultsTemplate(length);
    }
    if (this._measure_type == "start-area" && line_parts.length > 2) {
      var temp_parts = line_parts;
      temp_parts.push(temp_parts[0]);
      console.log(line_parts);
      var polygon = turf.polygon([temp_parts]);
      var area = turf.area(polygon);
      var miles = area / 2589988.11;
      this._outputs.innerHTML = areaResultsTemplate(miles);

      this._tempArea ||= L.polygon([], { color: "blue", stroke: false }).addTo(
        this._tempLayer
      );
      this._tempArea.setLatLngs(this._tempLine.getLatLngs());
    }
  },
  _saveMeasure: function () {
    switch (this._measure_type) {
      case "start-point":
        var coords = this._tempMarker.getLatLng();
        var marker = L.circleMarker(coords, { color: "green" }).addTo(
          this._layer
        );
        this._layerHistory.push(marker._leaflet_id);
        this._tempLayer.clearLayers();
        this._subcursor.addTo(this._tempLayer);
        this._outputs.innerHTML = pointStartTemplate();
        break;
      case "start-line":
        var path = L.featureGroup();
        this._tempPoints.getLayers().forEach((lyr) => {
          L.circleMarker(lyr.getLatLng(), { color: "green" }).addTo(path);
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
          L.circleMarker(lyr.getLatLng(), { color: "green" }).addTo(path);
        });
        var line_parts = this._tempLine.toGeoJSON().geometry.coordinates;
        var temp_parts = line_parts;
        console.log(line_parts);

        temp_parts.push(temp_parts[0]);
        var poly_parts = turf.polygon([temp_parts]);
        var area = turf.area(poly_parts);
        var miles = area / 2589988.11;
        this._outputs.innerHTML = areaStartTemplate(miles);

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
