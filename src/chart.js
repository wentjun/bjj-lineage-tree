class LineageTree {
  constructor() {
    this.loadData()
      .then(data => {
        this.generateTree(data);
      });
  }

  loadData() {
    const filePath = 'tree.json'
    return d3.json(filePath);
  }

  generateTree(data) {
    const viewportWidthToPixels = v => {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      return (v * w) / 100;
    };
    const width = viewportWidthToPixels(100);
    const radius = width / 2;

    const tree = d3.cluster()
      .size([2 * Math.PI, radius - 100]);
    const root = tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));

    const svg = d3.select('#tree')
      .attr('width', width)
      .attr('height', width)
      .style('padding', '10px')
      .style('box-sizing', 'border-box')
      .style('font', '10px sans-serif');

    const g = svg.append('g')
      .attr('transform', `translate(${radius},${radius})`);

    const link = g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    const node = g.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants()
        .reverse())
      .enter()
      .append('g')
      .attr('transform', d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);

    node.append('circle')
      .attr('fill', d => d.children ? '#555' : '#999')
      .attr('r', 2.5);

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .text(d => d.data.name)
      .filter(d => d.children)
      .clone(true)
      .lower()
      .attr('stroke', 'white');

    document.body.appendChild(svg.node());


    return svg.node();


  }
}