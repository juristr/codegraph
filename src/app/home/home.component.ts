import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {  CodeGraphComponent } from '../graph';
import { DataService } from './data.service';
import { GraphFilterComponent } from '../shared/graphfilter';

@Component({
  selector: 'home',
  styleUrls: ['./home.style.css'],
  templateUrl: './home.template.html',
  directives: [CodeGraphComponent, GraphFilterComponent],
  providers: [DataService],
  encapsulation: ViewEncapsulation.None // fix
})
export class Home {
  private graphData: any;
  private initialData: any;

  constructor(private dataService: DataService) {
    this.dataService.fetchData()
      .subscribe((data) => {
        this.graphData = data;
        this.initialData = data;
      });
  }

  resetGraph() {
    this.graphData = this.initialData;
  }

  highlight(pattern) {
    var regex = new RegExp(pattern, 'gi'); 
    let nodes = this.initialData.nodes.map((node, idx) => {
        if (pattern !== '' && node.id.indexOf(pattern) > -1) {
          node.isHighlighted = true;
          console.log('highlighting', node);
        } else {
          node.isHighlighted = false;
        }

        return node;
      });

    this.graphData = {
      nodes: nodes,
      links: this.initialData.links
    };
    
  }

  filterGraph(excludePattern) {
    if (excludePattern && excludePattern !== '') {

      let regex = /`${excludePattern}`/;
      let removedNodeIdx = [];
      let nodes = this.initialData.nodes.filter((node, idx) => {
        if (excludePattern !== '' && node.id.indexOf(excludePattern) > -1) {
          removedNodeIdx.push(node);
          return false;
        } else {
          return true;
        }
      });

      console.log('Nodes removed', removedNodeIdx);

      let links = this.initialData.links.filter((link, idx) => {
        let idxPresent = false;

        removedNodeIdx.forEach((node) => {
          if (node.id === link.source.id || node.id === link.target.id) {
            idxPresent = true;
          }
        });

        if (idxPresent) {
          console.log('Removing link', link);
          return false;
        } else {
          return true;
        }
      });

      // set the new data
      this.graphData = {
        nodes: nodes,
        links: links
      };

    } else {
      this.resetGraph();
    }

  }

}
