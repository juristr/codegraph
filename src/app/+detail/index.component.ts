import { Component } from '@angular/core';

import { DemoComponent } from '../graph';

@Component({
  selector: 'index',

  template: `
    <demo-graph></demo-graph>
  `,
  directives: [ DemoComponent]
})
export class Index {
  constructor() {

  }
  
  ngOnInit() {
    console.log('hello `Index` component');
  }
}
