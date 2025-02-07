import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ColDef, ColGroupDef, ModuleRegistry } from '@ag-grid-community/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// ✅ Register the required AG Grid module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, MatExpansionModule, MatButtonModule, 
    MatCardModule, MatSelectModule, MatFormFieldModule, MatInputModule, AgGridAngular
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  isConnected = false;
  username = '';
  avatarUrl = '';
  lastSynced: Date | null = null;
  githubData: any = null;
  
  columnDefs: (ColDef<any, any> | ColGroupDef<any>)[] = [];
  rowData: any[] = [];
  gridApi: any;
  gridColumnApi: any;
  
  activeIntegration = 'GitHub';
  collections: string[] = [];
  selectedCollection = '';

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
          this.fetchCollections();
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

  fetchCollections(): void {
    this.http.get<string[]>('http://localhost:3000/github/collections', { withCredentials: true }).subscribe(
      (collections) => {
        this.collections = collections;
      },
      (error) => console.error('Error fetching collections:', error)
    );
  }

  fetchCollectionData(): void {
    if (!this.selectedCollection) return;

    this.http.get<any[]>(`http://localhost:3000/github/collection/${this.selectedCollection}`, { withCredentials: true }).subscribe(
      (data) => {
        this.rowData = data;
        this.columnDefs = Object.keys(data[0] || {}).map((key) => ({
          field: key,
          filter: true,
          sortable: true
        })) as (ColDef<any, any> | ColGroupDef<any>)[];
      },
      (error) => console.error('Error fetching collection data:', error)
    );
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onSearch(event: any): void {
    this.gridApi.setQuickFilter(event.target.value);
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
