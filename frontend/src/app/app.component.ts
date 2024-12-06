import { AfterContentInit, Component, EventEmitter, LOCALE_ID, OnDestroy, Output } from '@angular/core'
import { Simulator3DComponent } from './components/evenmodeller3d/3dsimulator.component'
import { RouterOutlet } from '@angular/router'
import { CommonModule, registerLocaleData } from '@angular/common'
import { ChatbotComponent } from "./components/chatbot/chatbot/chatbot.component";
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [RouterOutlet, CommonModule, ChatbotComponent],
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    
}
