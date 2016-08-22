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

  highlight(pattern, highlightArches) {
    let nodesHighlighted = [];

    try {
      var regex = new RegExp(pattern, 'gi');
      let nodes = this.graphData.nodes.map((node, idx) => {
        if (pattern !== '' && regex.test(node.id)) {
          node.isHighlighted = true;
          nodesHighlighted.push(node);
          console.log('highlighting', node);
        } else {
          node.isHighlighted = false;
        }

        return node;
      });

      let links;
      let linksToRemove = [];
      if (highlightArches && nodesHighlighted.length > 0) {
        links = this.initialData.links.map((link, idx) => {
          let idxPresent = false;

          nodesHighlighted.forEach((node) => {
            if (node.id === link.target.id) {
              link.highlighted = true;
            } else {
              if (!link.highlighted) {
                link.highlighted = false;
              }
            }
          });

          return link;
        });

        // remove nodes
        nodes = this.graphData.nodes.filter((node, idx) => {
          links.forEach((link) => {
            if (!link.highlighted && link.source.id === node.id || link.target.id === node.id) {
              return false;
            } else {
              return true;
            }
          });
        });

        links = this.graphData.links.filter((link, idx) => {
          return link.highlighted === false;
        });



      } else {
        links = this.initialData.links;
      }

      this.graphData = {
        nodes: nodes,
        links: links
      };
    } catch (e) {
      this.resetGraph();
    }
  }

  isLinkHighlighted(links, nodeId) {

  }

  excludeGraph(excludePattern) {
    try {
      if (excludePattern && excludePattern !== '') {

        let regex = new RegExp(excludePattern, 'gi');
        console.log('regex: ', regex);
        let removedNodeIdx = [];
        let nodes = this.initialData.nodes.filter((node, idx) => {
          if (excludePattern !== '' && regex.test(node.id)) {
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

    } catch (e) {
      this.resetGraph();
    }

  }

  filterGraph(excludePattern) {
    try {
      if (excludePattern && excludePattern !== '') {

        let regex = new RegExp(excludePattern, 'gi');
        console.log('regex: ', regex);
        let removedNodeIdx = [];
        let nodes = this.initialData.nodes.filter((node, idx) => {
          if (excludePattern !== '' && !regex.test(node.id)) {
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

    } catch (e) {
      this.resetGraph();
    }

  }

}
