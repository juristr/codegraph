import { Component, ElementRef, OnInit, OnChanges, SimpleChange, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'code-graph',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ''
})
export class CodeGraphComponent implements OnInit, OnChanges {
    private width: number = 1200;
    private height: number = 800;
    private svg: any;
    private g: any;
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

        this.svg
            .style("pointer-events", "all")
            .call(d3.zoom()
                .on("zoom", () => this.g.attr("transform", d3.event.transform));

        this.color = d3.scaleOrdinal(d3.schemeCategory20);

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
    }

    render(graph) {
        this.zone.runOutsideAngular(() => {

            // create the links container and fill with data
            var link = this.g
                .selectAll("line")
                .data(graph.links);

            // add new links
            var newLinks = link
                .enter()
                .append("line")
                .attr('class', 'link')
                .attr("stroke-width", (d) => Math.sqrt(d.value));

            // remove old ones
            var exitLinks = link.exit().remove();

            // merge changes
            link = newLinks.merge(link);



            var self = this;
            // create nodes container and fill with data
            var node = this.g
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
                })
                .on('mouseout', (d) => {
                    this.tooltip.transition()
                        .duration(300)
                        .style('opacity', 0);
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