import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

    constructor(private http:Http) {}

    fetchData():Observable<any> {
        // return this.http.get('assets/mock-data/simple-graph.json')
        return this.http.get('assets/mock-data/codegraph.json')
        // return this.http.get('assets/mock-data/graph.json')
                .map((res) => res.json())
    }

}