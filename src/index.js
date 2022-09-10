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
  },
  onAdd: function (map) {
    this._map = map;
    this._layer = L.featureGroup().addTo(this._map);
    const container = (this._container = L.DomUtil.create(
      "div",
      `${this._className} leaflet-bar`
    ));
    container.innerHTML = controlTemplate(this);

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const toggle = container.querySelector(".measure-toggle");
    this._toggle = toggle;
    const controls = container.querySelector(".leaflet-multi-measure-controls");
    this._controls = controls;

    const pointStart = container.querySelector("#start-point");
    const lineStart = container.querySelector("#start-line");
    const areaStart = container.querySelector("#start-area");

    this._collapse();

    L.DomEvent.on(toggle, "click", L.DomEvent.stop);
    L.DomEvent.on(toggle, "click", this._expand, this);
    L.DomEvent.on(controls, "click", L.DomEvent.stop);
    L.DomEvent.on(controls, "click", this._collapse, this);
    L.DomEvent.on(pointStart, "click", L.DomEvent.stop);
    L.DomEvent.on(pointStart, "click", this._measurePoint, this);
    return this._container;
  },
  onRemove: function () {
    this._map.removeLayer(this._layer);
  },
  _expand: function () {
    // hide svg
    // show controls
    this._toggle.setAttribute("style", "display:none;");
    this._controls.removeAttribute("style");
  },
  _collapse: function () {
    this._toggle.removeAttribute("style");
    this._controls.setAttribute("style", "display:none;");
    // this._controls.setAttribute('style', 'display:none;');
  },
  _measurePoint: function () {
    console.log("Point");
  },
  _measureLine: function () {
    console.log("Line");
  },
  _measureArea: function () {
    console.log("Area");
  },
});

L.control.multiMeasure = function (options) {
  return new L.Control.MultiMeasure(options);
};
