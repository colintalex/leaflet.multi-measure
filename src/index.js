L.Control.MultiMeasure = L.Control.extend({
  _className: "leaflet-control-multi-measure",
  options: {
    units: {},
    position: "topright",
    primaryLengthUnit: "feet",
  },
  initialize: function (options) {
    L.setOptions(this, options);
  },
  onAdd: function (map) {
    this._map = map;
    this._layer = L.featureGroup().addTo(this._map);
    this._container = L.DomUtil.create("div", this._className);

    this._container.innerHTML = controlTemplate(this);
    return this._container;
  },
  onRemove: function () {
    this._map.removeLayer(this._layer);
  },
});

L.control.multiMeasure = function (options) {
  return new L.Control.MultiMeasure(options);
};
