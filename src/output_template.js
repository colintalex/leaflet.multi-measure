function outputTemplate(model, title) {
  var text;
  if (model == null) {
    text = 0.0;
  } else {
    text = model;
  }
  return `
  <div>
    <h3>${title}</h3>
    <h6>${text.toFixed(2)} miles</h6>
  </div>`;
}
function pointOutputTemplate(coords) {
  return `
  <div>
    <h3>Length</h3>
    <h6>${coords.lat.toFixed(5)} / ${coords.lng.toFixed(5)}</h6>
  </div>`;
}
function lengthOutputTemplate(length) {
  return `
  <div>
    <h3>Length</h3>
    <h6>${length.toFixed(2)} sq/miles</h6>
  </div>`;
}
function areaOutputTemplate(area) {
  return `
  <div>
    <h3>Area</h3>
    <h6>${area.toFixed(2)} sq/miles</h6>
  </div>`;
}

units = {
  acres: {
    factor: 0.00024711,
    display: "acres",
    decimals: 2,
  },
  feet: {
    factor: 3.2808,
    display: "feet",
    decimals: 0,
  },
  kilometers: {
    factor: 0.001,
    display: "kilometers",
    decimals: 2,
  },
  hectares: {
    factor: 0.0001,
    display: "hectares",
    decimals: 2,
  },
  meters: {
    factor: 1,
    display: "meters",
    decimals: 0,
  },
  miles: {
    factor: 3.2808 / 5280,
    display: "miles",
    decimals: 2,
  },
  sqfeet: {
    factor: 10.7639,
    display: "sqfeet",
    decimals: 0,
  },
  sqmeters: {
    factor: 1,
    display: "sqmeters",
    decimals: 0,
  },
  sqmiles: {
    factor: 0.000000386102,
    display: "sqmiles",
    decimals: 2,
  },
};
