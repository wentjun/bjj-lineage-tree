class LineageTree {
  constructor() {
    this.root = undefined;
    this.tree = undefined;
    this.gNode = undefined;
    this.gLink = undefined;
    this.loadData()
      .then(data => {
        this.generateTree(data);
      });
    const collapse = document.querySelector('button[id=collapse]');
    collapse.addEventListener('click', event => {
      this.collapse();
    });
    const collapseAll = document.querySelector('button[id=collapse-all]');
    collapseAll.addEventListener('click', event => {
      this.collapseAll();
    });
    const expandAll = document.querySelector('button[id=expand]');
    expandAll.addEventListener('click', event => {
      this.expandAll();
    });
    const searchBar = document.querySelector('input[id=search-bar]');
    searchBar.addEventListener('keyup', event => {
      this.searchFighter(event);
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
    const collapse = d => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    };
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', () => {
        d3.select('#bjj-lineage')
          .attr('transform', d3.event.transform)
      });
    const margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    const width = viewportWidthToPixels(100);
    const height = width;
    const radius = width / 2;

    // dendrogram configuration
    this.tree = d3.cluster()
      .size([2 * Math.PI, radius - 100]);
    // root data
    this.root = this.tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));
    this.root.children.forEach(collapse);
    this.root.x0 = height / 2;
    this.root.y0 = 0;

    d3.select('#tree')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `-${radius} -${radius-50} ${radius * 2} ${radius * 2}`)
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity.scale(0.7))
      .append('g')
      .attr('id', 'bjj-lineage')
      .attr('transform', `scale(0.7,0.7)`);

    // each node represents BJJ fighter
    this.gNode = d3.select('#bjj-lineage')
      .append('g')
      .attr('id', 'nodes')
      .attr('cursor', 'pointer');

    // each link represents the master-disciple relationship between two BJJ fighters
    this.gLink = d3.select('#bjj-lineage')
      .append('g')
      .attr('id', 'links')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);
    //document.body.appendChild(svg.node());

    this.update(this.root);

    return d3.select('#tree')
      .node();
  }

  update(source) {
    this.tree(this.root);
    const diagonal = d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y);
    const toggleChildren = (d, clickType) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }

      var type = typeof clickType == undefined ? 'node' : clickType;

      //Activities on node click
      this.update(d);
      //highlightNodeSelections(d);

      //highlightRootToNodePath(d, type);
    }
    const nodes = this.root.descendants()
    //  .reverse();
    const links = this.root.links();
    const duration = d3.event && d3.event.altKey ? 2500 : 250;

    const node = this.gNode.selectAll('g')
      .data(nodes, (d, i) => d.id || (d.id = ++i));

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter()
      .append('g')
      .on('click', toggleChildren);

    nodeEnter.append('circle')
      .attr('r', 2.5)
      .attr('fill', d => {
        if (d.highlight) {
          return '#d91e18';
        } else if (d._children) {
          return '#555';
        } else {
          return '#999';
        }
      });
    nodeEnter.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .classed('search-path', d => d.highlight)
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
    const link = this.gLink.selectAll('path')
      .data(links, d => {
        return d.target.id
      });
    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter()
      .append('path')
      .classed('highlight', d => d.target.highlight)
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

  collapse() {
    if (this.root) {
      // collapse all, but keep 'state'
      this.root._children = this.root.children;
      this.root.children = null;
      this.update(this.root);
    }
  }

  collapseAll() {
    // collapse all
    const collapse = d => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    if (this.root && this.root.children) {
      collapse(this.root)
      this.update(this.root);
    }
  }

  expandAll() {
    // expand entire tree
    const expand = d => {
      const children = (d.children) ? d.children : d._children;
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (children) {
        children.forEach(expand);
      }
    }
    expand(this.root);
    this.update(this.root);
  }

  searchFighter(event) {
    const searchTerm = event.target.value;
    const search = (d, searchTerm, path) => {
      const searchResultsList = [];
      if (d.data.name === searchTerm) {
        // if there is a match, add node to the path and return it
        path.push(d);
        return path;
      } else if (d.children || d._children) {
        const res = undefined;
        const children = (d.children) ? d.children : d._children;
        for (let i = 0; i < children.length; i++) {
          /*
          if (children[i].data.name !== searchTerm) {
            return search(children[i], searchTerm);
            //break;
          }*/
          // assume path is valid
          path.push(d);
          const isMatch = search(children[i], searchTerm, path);
          if (isMatch) {
            // if there is a match, this should return the bubbled-up path from the first if statement
            return isMatch;
          } else {
            // remove if no match
            path.pop();
          }
        }
      } else {
        return false;
      }
    }

    const expand = paths => {
      for (let i = 0; i < paths.length; i++) {
        if (paths[i].id !== 1) {
          // if not root
          paths[i].parent.highlight = true;
          if (paths[i]._children) { //if children are hidden: open them, otherwise: don't do anything
            paths[i].children = paths[i]._children;
            paths[i]._children = null;
          }
          this.update(paths[i]);
        }
      }
      console.log(this.root)
    }
    const click = d => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      this.update(d);
    }

    const find = (d, name) => {
      if (d.data.name == name) {
        while (d.parent) {
          d.highlight = true;
          d = d.parent;
          click(d); //if found open its parent
        }
        return;
      }

      //recursively call find function on its children
      if (d.children) {
        d.children.forEach(function (d) {
          find(d, name)
        });
      } else if (d._children) {
        d._children.forEach(function (d) {
          find(d, name)
        });
      }
    }

    const collapse = d => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(function (d1) {
          d1.parent = d;
          collapse(d1);
        });
        d.children = null;
      }
    }

    const res = search(this.root, searchTerm, []);
    this.collapseAll();
    collapse(this.root);
    find(this.root, searchTerm)
    this.update(this.root);
  }

}