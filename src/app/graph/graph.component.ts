import { Component, ElementRef, OnInit, OnChanges, SimpleChange, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'code-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ''
})
export class CodeGraphComponent implements OnInit, OnChanges {
  private linkedByIndex:any = [];
  private width: number = 1200;
  private height: number = 800;
  private svg: any;
  private g: any;
  private linksContainer: any;
  private nodesContainer: any;
  private color: any;
  private simulation: any;
  private link: any;
  private node: any;
  private tooltip: any;
  private is2ndUpdate: boolean = false;

  @Input() graphData: any;

  constructor(private element: ElementRef, private zone: NgZone) {
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.graphData = changes['graphData'].currentValue;
    console.log('New data', this.graphData);

    if (this.graphData) {
      // if (this.is2ndUpdate) {
      //     this.updateGraph(this.graphData);
      // } else {
      this.render(this.graphData);
      // }
      // this.is2ndUpdate = true;
    }
  }

  ngOnInit() {

    this.tooltip = d3.select(this.element.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    this.svg = d3.select(this.element.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.g = this.svg.append('g');

    this.linksContainer = this.g.append('g').attr('class', 'links-container');
    this.nodesContainer = this.g.append('g').attr('class', 'nodes-container');

    this.svg
      .style("pointer-events", "all")
      .call(d3.zoom()
        .on("zoom", () => this.g.attr("transform", d3.event.transform)));

    this.color = d3.scaleOrdinal(d3.schemeCategory20);

    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  }

  isConnected(a, b) {
    return this.linkedByIndex[a.index + "," + b.index] || this.linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

  formatClassName(prefix, object) {
    return prefix + '-' + object.id.replace(/(\.|\/)/gi, '-');
  }

  fadeRelatedNodes(d, opacity, nodes, links) {

    // Clean
    // $('path.link').removeAttr('data-show');
    let self = this;
    nodes.style("stroke-opacity", function (o) {
      var thisOpacity;

      if (self.isConnected(d, o)) {
        thisOpacity = 1;
      } else {
        thisOpacity = opacity;
      }

      this.setAttribute('fill-opacity', thisOpacity);
      this.setAttribute('stroke-opacity', thisOpacity);

      if (thisOpacity == 1) {
        this.classList.remove('dimmed');
      } else {
        this.classList.add('dimmed');
      }

      return thisOpacity;
    });

    links.style("stroke-opacity", function (o) {

      if (o.source === d) {

        // Highlight target/sources of the link
        var elmNodes = self.g.selectAll('.' + self.formatClassName('node', o.target));
        elmNodes.attr('fill-opacity', 1);
        elmNodes.attr('stroke-opacity', 1);

        elmNodes.classed('dimmed', false);

        // Highlight arrows
        var elmCurrentLink = self.g.selectAll('path.link[data-source=' + o.source.index + ']');
        elmCurrentLink.attr('data-show', true);
        elmCurrentLink.attr('marker-end', 'url(#regular)');

        return 1;

      } else {

        var elmAllLinks = self.g.selectAll('path.link:not([data-show])');

        if (opacity == 1) {
          elmAllLinks.attr('marker-end', 'url(#regular)');
        } else {
          elmAllLinks.attr('marker-end', '');
        }

        return opacity;
      }

    });
  }

  render(graph) {
    this.zone.runOutsideAngular(() => {

      let markers = this.svg.append("defs")
        .selectAll("marker")
        .data(['regular']);

      let newMarkers = markers
        .enter()
        .append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 23)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

      // create the links container and fill with data
      var link = this.linksContainer
        .selectAll("line")
        .data(graph.links);

      link.attr('class', (d) => {
        if (d.highlighted) {
          console.log('graph: is highlighted', d);
          return 'link highlighted';
        } else {
          return 'link';
        }
      });

      // add new links
      var newLinks = link
        .enter()
        .append("line")
        .attr('class', (d) => {
          if (d.highlighted) {
            console.log('graph: is highlighted', d);
            return 'link highlighted';
          } else {
            return 'link';
          }
        })
        .attr("stroke-width", (d) => Math.sqrt(d.value))
        .attr("data-target", function (o) { return o.target })
        .attr("data-source", function (o) { return o.source })
        .attr("marker-end", function (d) { return "url(#regular)"; });

      // remove old ones
      var exitLinks = link.exit().remove();

      // merge changes
      link = newLinks.merge(link);



      var self = this;
      // create nodes container and fill with data
      var node = this.nodesContainer
        .selectAll("circle")
        .data(graph.nodes);

      // update the nodes attributes based
      // on the new data
      node
        .attr("fill", (d) => {
          if (d.isHighlighted) {
            console.log('coloring highlighted node', d);
            return '#7CFC00';
          } else {
            return this.color(1);
          }
        });

      // add eventual new nodes
      var newNodes = node
        .enter().append("circle")
        .attr('class', 'node')
        .attr("r", (d) => d.weight * 10 || 10)
        .attr("fill", (d) => {
          if (d.isHighlighted) {
            console.log('coloring highlighted node', d);
            return '#7CFC00';
          } else {
            return this.color(1);
          }
        })
        .on('mouseover', (d) => {
          this.tooltip
            .transition()
            .duration(500)
            .style('opacity', .85);

          this.tooltip.html(d.id)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');

          this.fadeRelatedNodes(d, 0.5, node, link);
        })
        .on('mouseout', (d) => {
          this.tooltip.transition()
            .duration(300)
            .style('opacity', 0);

          this.fadeRelatedNodes(d, 1, node, link);
        })
        .on('dblclick', function (d) {
          d.fx = null;
          d.fy = null;

          d3.select(this).classed('fixed', false);
        })
        .call(d3.drag()
          .on("start", function (d) {
            if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
          })
          .on("end", function (d) {
            if (!d3.event.active) self.simulation.alphaTarget(0);
            // don't reset the fx and fy coordinates to have the node stick at that position
            // d.fx = null;
            // d.fy = null;

            d3.select(this).classed('fixed', true);
          })
        );

      // remove old nodes
      node.exit().remove();

      node = newNodes.merge(node);


      this.simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

      this.simulation.force("link")
        .links(graph.links);

      ticked();

      function ticked() {
        link
          .attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; });

        node
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; });
      }
    });
  }

}
