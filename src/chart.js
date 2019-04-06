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
    var margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    const width = viewportWidthToPixels(100);
    const height = width;
    const radius = width / 2;

    const diagonal = d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y);

    const tree = d3.cluster()
      .size([2 * Math.PI, radius - 100]);

    const root = tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));
    root.children.forEach(collapse);
    //document.body.appendChild(svg.node());
    root.x0 = height / 2;
    root.y0 = 0;
    const gNode = d3.select('#tree')
      .append('g')
      .attr('id', 'nodes')
      .attr('cursor', 'pointer');
    const gLink = d3.select('#tree')
      .append('g')
      .attr('id', 'links')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    update(root);

    d3.select('#tree')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `-${radius} -${radius-50} ${radius * 2} ${radius * 2}`)

    function update(source) {
      console.log(source)
      tree(root);
      const nodes = root.descendants()
      //.reverse();
      const links = root.links();
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      /*
      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });
      */
      /*
      const transition = d3.select('#tree')
        .transition()
        .duration(duration)
        .attr('height', height)
        .attr('viewBox', [-margin.left, left.x - margin.top, width, height])
        .tween('resize', window.ResizeObserver ? null : () => () => d3.select('#tree')
          .dispatch('toggle'));
          */
      const node = gNode.selectAll('g')
        .data(nodes, function (d, i) {
          return d.id || (d.id = ++i);
        });

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter()
        .append('g')
        /*.attr('transform', d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `)*/
        //.attr('fill-opacity', 0)
        //.attr('stroke-opacity', 0)
        /*.on('click', d => {
          d.children = d.children ? null : d._children;
          update(d);
        });*/
        .on('click', toggleChildren);

      nodeEnter.append('circle')
        .attr('r', 2.5)
        .attr('fill', d => d._children ? '#555' : '#999');

      nodeEnter.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
        .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
        .text(d => d.data.name)
      /*.clone(true)
      .lower()
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .attr('stroke', 'white');*/
      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter)
        .transition()
        .duration(duration)
        .attr('transform', d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit()
        .transition()
        .duration(duration)
        .remove()
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // Update the links…
      const link = gLink.selectAll('path')
        .data(links, d => d.target.id);
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter()
        .append('path')
        .attr('d', d => {
          const o = {
            x: source.x0,
            y: source.y0
          };
          return diagonal({
            source: o,
            target: o
          });
        });
      // Transition links to their new position.
      link.merge(linkEnter)
        //.transition(transition)
        .transition()
        .duration(duration)
        .attr('d', diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit()
        .transition()
        .duration(duration)
        .attr('d', d => {
          const o = {
            x: source.x,
            y: source.y
          };
          return diagonal({
            source: o,
            target: o
          });
        })
        .remove();
    }

    function toggleChildren(d, clickType) {
      console.log(d)
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }

      var type = typeof clickType == undefined ? 'node' : clickType;

      //Activities on node click
      update(d);
      //highlightNodeSelections(d);

      //highlightRootToNodePath(d, type);
    }

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    return d3.select('#tree')
      .node();

  }
}