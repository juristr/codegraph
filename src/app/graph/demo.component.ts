import { Component, ElementRef, OnInit, OnChanges, SimpleChange, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgZone } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'demo-graph',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ''
})
export class DemoComponent implements OnInit {
    
    constructor(private element: ElementRef, private zone: NgZone) {
    }


    ngOnInit() {
        let width = 960;
        let height = 500;
        // var transform = d3.zoomIdentity;
        let svg = d3.select(this.element.nativeElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        var points = d3.range(2000).map(phyllotaxis(10));

        var g = svg.append("g");

        g.selectAll("circle")
            .data(points)
            .enter().append("circle")
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", 2.5)
            .call(d3.drag()
                .on("drag", dragged));

        svg.call(d3.zoom()
            .scaleExtent([1 / 2, 8])
            .on("zoom", zoomed));

        function zoomed() {
            g.attr("transform", d3.event.transform);
        }

        function dragged(d) {
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }

        function phyllotaxis(radius) {
            var theta = Math.PI * (3 - Math.sqrt(5));
            return function (i) {
                var r = radius * Math.sqrt(i), a = theta * i;
                return {
                    x: width / 2 + r * Math.cos(a),
                    y: height / 2 + r * Math.sin(a)
                };
            };
        }
    }


}