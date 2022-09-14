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
    <p>${text.toFixed(2)} miles</p>
  </div>`;
}
function pointOutputTemplate(coords) {
  return `
  <div>
    <h3>Length</h3>
    <p>${coords.lat.toFixed(5)} / ${coords.lng.toFixed(5)}</p>
  </div>`;
}
function lengthOutputTemplate(length, secondary) {
  var commas = secondary.toLocaleString("en-US");

  return `
  <div>
    <h3>Length</h3>
    <p>${length.toFixed(2)} miles</p>
    <p>${commas} meters</p>
  </div>`;
}
function areaOutputTemplate(area, secondary) {
  var commas = secondary.toLocaleString("en-US");

  return `
  <div>
    <h3>Area</h3>
    <p>${area.toFixed(2)} sq/miles</p>
    <p>${commas} sq/meters</p>
  </div>`;
}

const units = {
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
