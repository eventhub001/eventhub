import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './ladingpage.component.html',
  styleUrls: ['./styles.component.scss'],
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignUp() {
    this.router.navigate(['/auth/signup']);
  }
}
