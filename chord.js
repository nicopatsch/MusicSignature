chart = {
  const root = tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));

  const map = new Map(root.leaves().map(d => [id(d), d]));

  const context = DOM.context2d(width, width - 40);
  context.canvas.style.display = "block";
  context.canvas.style.maxWidth = "100%";
  context.canvas.style.margin = "auto";
  context.translate(width / 2, width / 2);
  line.context(context);

  for (const leaf of root.leaves()) {
    context.save();
    context.rotate(leaf.x - Math.PI / 2);
    context.translate(leaf.y, 0);
    if (leaf.x >= Math.PI) {
      context.textAlign = "right";
      context.rotate(Math.PI);
      context.translate(-3, 0);
    } else {
      context.textAlign = "left";
      context.translate(3, 0);
    }
    context.fillText(leaf.data.name, 0, 3);
    context.restore();
  }

  context.globalCompositeOperation = "multiply";
  context.strokeStyle = "lightsteelblue";
  for (const leaf of root.leaves()) {
    for (const i of leaf.data.imports) {
      context.beginPath();
      line(leaf.path(map.get(i)));
      context.stroke();
    }
  }

  return context.canvas;
}