import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'droplet-rewrite';
}
function onTabClosed({ detail: component }) {
  console.log(component);
}


