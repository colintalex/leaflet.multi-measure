function outputTemplate(model, title) {
  console.log(model);
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
