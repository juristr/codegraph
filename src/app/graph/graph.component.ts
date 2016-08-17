import { Component, ElementRef, OnInit, OnChanges, SimpleChange, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
import * as d3 from 'd3';
// import {selection, select} from 'd3-selection';
// import 'd3-selection-multi';

@Component({
    selector: 'code-graph',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="graph"></div>
    `,
    styles: [
        `
        `
    ]
})
export class CodeGraphComponent implements OnInit, OnChanges {
    private width: number = 1200;
    private height: number = 800;
    private svg: any;
    private g:any;
    private color: any;
    private simulation: any;
    private link: any;
    private node: any;

    @Input() graphData: any;

    constructor(private element: ElementRef, private zone: NgZone) {
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.graphData = changes['graphData'].currentValue;
        console.log('New data', this.graphData);

        if (this.graphData) {
            this.render(this.graphData);
        }
    }

    ngOnInit() {
        // var transform = d3.zoomIdentity;
        let svg = d3.select(this.element.nativeElement.getElementsByClassName('graph')[0])
            .append('svg')
            .attr("pointer-events", "all")
            .call(d3.zoom()
                .scaleExtent([1/2, 8]))
                .on('zoom', () => this.g.attr('transform', d3.event.transform))
        
        this.g = svg.append('g')
            .attr('width', this.width)
            .attr('height', this.height);
        
        this.color = d3.scaleOrdinal(d3.schemeCategory20);

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
    }

    render(graph) {
        this.zone.runOutsideAngular(() => {

            var link = this.g.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graph.links)
                .enter().append("line")
                .attr("stroke-width", (d) => Math.sqrt(d.value))

            var self = this;
            var node = this.g.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("r", (d) => d.weight*10 || 10)
                .attr("fill", (d) => this.color(d.group))
                .on('dblclick', function(d) {
                        d.fx = null;
                        d.fy = null;

                        d3.select(this).classed('fixed', false);
                })
                .call(d3.drag()
                    .on("start", function(d) {
                        if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", function(d) {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                    })
                    .on("end", function(d) {
                        if (!d3.event.active) self.simulation.alphaTarget(0);
                        // don't reset the fx and fy coordinates to have the node stick at that position
                        // d.fx = null;
                        // d.fy = null;

                        d3.select(this).classed('fixed', true);
                    })
                );

            node.append("title")
                .text(function (d) { return d.id; });

            this.simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            this.simulation.force("link")
                .links(graph.links);

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