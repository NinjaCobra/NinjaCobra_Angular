import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ninjaAuth } from '@ninja/ninja-auth-js';
import { ninjaAuthStateService } from '@ninja/ninja-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  isAuthenticated: boolean;

  constructor(
    private ninjaAuth: ninjaAuth, 
    private authStateService: ninjaAuthStateService, 
    private router: Router
  ) {}

  login() {
    this.ninjaAuth.signInWithRedirect({ originalUri: '/profile' });
  }

  async logout() {
    // Terminates the session with ninja and removes current tokens.
    await this.ninjaAuth.signOut();
    this.router.navigateByUrl('/');
  }
}
