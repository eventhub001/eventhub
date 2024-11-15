import { AfterContentInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core'
import { TestComponent } from './components/evenmodeller3d/test.component'
import { RouterOutlet } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ChatbotComponent } from "./components/chatbot/chatbot/chatbot.component";


@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [TestComponent, RouterOutlet, CommonModule, ChatbotComponent],
    styleUrls: ['./app.component.css']
})
export class AppComponent {

}
