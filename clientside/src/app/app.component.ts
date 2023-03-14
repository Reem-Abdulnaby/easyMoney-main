import { RoutingAnimation } from './shared/animations/routing-animation';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [RoutingAnimation],
})
export class AppComponent {
  title = 'eazy-money';

  onActivate(event: any) {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 800);
  }
}
