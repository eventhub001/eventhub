import { AfterContentInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core'
import { TestComponent } from './components/evenmodeller3d/3dsimulator.component'
import { RouterOutlet } from '@angular/router'
import { CommonModule } from '@angular/common'


@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [TestComponent, RouterOutlet, CommonModule],
    styleUrls: ['./app.component.css']
})
export class AppComponent {

}
