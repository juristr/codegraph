import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {  CodeGraphComponent } from '../graph';
import { DataService } from './data.service';

@Component({
  selector: 'home', 
  styleUrls: [ './home.style.css' ],
  templateUrl: './home.template.html',
  directives: [CodeGraphComponent],
  providers: [ DataService ],
  encapsulation: ViewEncapsulation.None // fix
})
export class Home {
  private graphData:any;
  
  constructor(private dataService: DataService) {
     this.dataService.fetchData()
        .subscribe((data) => {
          this.graphData = data;
        });
  }

}
