import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  registerLicense('ORg4AjUWIQA/Gnt2UlhhQlVMfV5AQmFWfFN0QXNadVt3flZBcDwsT3RfQFliSH5QdERiUHtbcXRdQg==');
