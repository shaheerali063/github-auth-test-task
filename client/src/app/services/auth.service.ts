import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Backend URL

  constructor(private http: HttpClient) {}

  // Redirect to GitHub OAuth
  redirectToGitHub(): void {
    window.location.href = `${this.apiUrl}/auth/github`;
  }

  // Check if user is already connected
  checkConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-connection`, { withCredentials: true });
  }

  // Fetch user’s GitHub data
  fetchGitHubData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/github-data`, { withCredentials: true });
  }

  // Remove GitHub integration
  removeConnection(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-connection`, { withCredentials: true });
  }
}
