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
    container.innerHTML = mainTemplate(this);

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const pointStart = container.querySelector("#start-point");
    const lineStart = container.querySelector("#start-line");
    const areaStart = container.querySelector("#start-area");

    const toggle = container.querySelector(".measure-toggle");
    const cancel = container.querySelector(".link#cancel");
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
    this._outputs.setAttribute("style", "display:none;");
    this._measure_actions.setAttribute("style", "display:none;");
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
        break;
    }
    this._measure_start_menu.setAttribute("style", "display:none;");
    this._outputs.removeAttribute("style");
    this._measure_actions.removeAttribute("style");
  },
  _backToMenu: function () {
    this._controls.removeAttribute("style");
    this._measure_start_menu.removeAttribute("style");
    this._measure_actions.setAttribute("style", "display:none;");
    this._outputs.setAttribute("style", "display:none;");
  },
});

L.control.multiMeasure = function (options) {
  return new L.Control.MultiMeasure(options);
};
