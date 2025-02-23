import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt'; // ✅ Import JWT Services

export function jwtOptionsFactory() {
  return {
    tokenGetter: () => localStorage.getItem('access_token'), // ✅ Retrieve token from localStorage
    allowedDomains: ['localhost:8000'], // ✅ Add your backend API domain
    disallowedRoutes: ['http://localhost:8000/api/login']
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: JWT_OPTIONS, useFactory: jwtOptionsFactory }, // ✅ Provide JWT_OPTIONS
    JwtHelperService // ✅ Provide JwtHelperService
  ]
}).catch(err => console.error(err));
