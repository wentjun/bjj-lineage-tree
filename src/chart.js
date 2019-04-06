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
    //.nodeSize([10, 162.5])
    data.children.forEach(collapse);
    const root = tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));
    /*
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
      */
    //document.body.appendChild(svg.node());


    //return svg.node();

    //const root = data;
    root.x0 = height / 2;
    root.y0 = 0;
    const gNode = d3.select('#tree')
      .append("g")
      .attr("cursor", "pointer");
    const gLink = d3.select('#tree')
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);
    root.descendants()
      .forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        //if (d.depth && d.data.name.length !== 7) d.children = null;
      });
    console.log(data)
    update(root);

    d3.select('#tree')
      //.style("height", "800px")
      //.attr("width", width)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "-" + (radius) + " -" + (radius - 50) + " " + radius * 2 + " " + radius * 2)
    //.attr('transform', `translate(${radius/2},${radius/2})`);

    function update(source) {
      console.log(source)
      const nodes = root.descendants()
        .reverse();
      const links = root.links();
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      console.log(nodes);
      console.log(links);
      const transition = d3.select('#tree')
        .transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => d3.select('#tree')
          .dispatch("toggle"));

      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter()
        .append("g")
        .attr('transform', d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `)
        //.attr("fill-opacity", 0)
        //.attr("stroke-opacity", 0)
        /*.on("click", d => {
          d.children = d.children ? null : d._children;
          update(d);
        });*/
        .on("click", toggleChildren);
      /*
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
          */
      nodeEnter.append("circle")
        .attr("r", 2.5)
        .attr("fill", d => d._children ? "#555" : "#999");

      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
        //.attr("x", d => d._children ? -6 : 6)
        //.attr("text-anchor", d => d._children ? "end" : "start")
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? 'start' : 'end')
        .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
        .text(d => d.data.name)
        .clone(true)
        .lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");
      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter)
        //.transition(transition)
        //.attr("transform", d => `translate(${d.y},${d.x})`)
        .transition()
        .duration(duration)
        /*.attr("transform", function (d) {
          return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"
        })*/
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit()
        //.transition(transition)
        //.remove()
        //.attr("transform", d => `translate(${source.y},${source.x})`)
        .exit()
        .transition()
        .duration(duration)
        .remove()
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter()
        .append("path")
        .attr("d", d => {
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
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit()
        //.transition(transition)
        //.remove()
        .transition()
        .duration(duration)
        .attr("d", d => {
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
      /*
      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });*/
    }

    function toggleChildren(d, clickType) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }

      var type = typeof clickType == undefined ? "node" : clickType;

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