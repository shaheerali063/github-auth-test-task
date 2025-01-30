import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, MatExpansionModule, MatButtonModule, MatCardModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  isConnected = false;
  username = '';
  avatarUrl = '';
  lastSynced: Date | null = null;
  githubData: any = null;

  ngOnInit(): void {
    this.checkConnection();
  }

  checkConnection(): void {
    this.authService.checkConnection().subscribe(
      (response) => {
        if (response.connected) {
          this.isConnected = true;
          this.username = response.username;
          this.avatarUrl = response.avatarUrl;
          this.lastSynced = response.lastSynced;
          this.fetchGitHubData();
        } else {
          this.isConnected = false;
        }
      },
      (error) => {
        console.error('Error checking connection:', error);
        this.isConnected = false;
      }
    );
  }

  fetchGitHubData(): void {
    this.authService.fetchGitHubData().subscribe(
      (data) => {
        this.githubData = data;
      },
      (error) => console.error('Error fetching GitHub data:', error)
    );
  }

  connectToGitHub(): void {
    this.authService.redirectToGitHub();
  }

  removeConnection(): void {
    this.authService.removeConnection().subscribe(
      () => {
        this.isConnected = false;
        this.username = '';
        this.avatarUrl = '';
        this.lastSynced = null;
        this.githubData = null;
      },
      (error) => console.error('Error removing connection:', error)
    );
  }
}
