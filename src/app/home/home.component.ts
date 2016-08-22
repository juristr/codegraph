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
        } else {
          node.isHighlighted = false;
        }

        return node;
      });


      // highlight matching links
      let links = this.graphData.links.map((link, idx) => {
        let highlightLink:boolean = false;
        nodesHighlighted.forEach((node) => {
          if(link.target.id === node.id) {
            highlightLink = true;
            return;
          }
        });

        if(highlightLink) {
          link.highlighted = true;
        }

        return link;
      });

      // filter out all nodes that are not highlighted
      // links = links.filter((link) => {
      //   if(link.highlighted) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // });

      // nodes = nodes.filter((node) => {
      //   if(node.isHighlighted) {
      //     return true;
      //   } else {
      //     let includeNode = false;
          
      //     links.forEach(link => {
      //       if(link.target.id === node.id) {
      //         includeNode = true;
      //         return;
      //       }
      //     }); 

      //     return includeNode;
      //   }
      // });


      // set the new data
      this.graphData = {
        nodes: nodes,
        links: links
      };

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
